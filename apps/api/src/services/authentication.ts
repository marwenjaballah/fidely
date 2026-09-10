import type { PrismaClient, UserRole as PrismaUserRole } from '@repo/database';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Database } from '@repo/types';
import type { AuthenticationServiceOptions } from '../types/services.js';
import { getSupabaseServiceClient } from '../lib/supabase.js';
import { env } from '../config/env.js';

type DbUserRole = Database['public']['Enums']['UserRole'];

const PROFILE_FIELDS = [
  'fullName',
  'phone',
  'streetAddress',
  'city',
  'state',
  'postalCode',
  'country',
] as const;

type ProfileField = (typeof PROFILE_FIELDS)[number];
type UserProfileShape = Pick<Database['public']['Tables']['users']['Row'], ProfileField>;
type UserProfileInput = Partial<UserProfileShape>;

type RegisterPayload = UserProfileInput & {
  email: string;
  password: string;
  role?: DbUserRole;
  referredByStoreId?: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type PasswordResetPayload = {
  email: string;
};

type PasswordChangePayload = {
  userId: string;
  newPassword: string;
};

type RefreshPayload = {
  refreshToken: string;
};

type GoogleOAuthPayload = {
  redirectTo?: string;
};

type GoogleOAuthCallbackPayload = {
  code: string;
  state?: string;
};

type GoogleOAuthTokenPayload = {
  accessToken: string;
  refreshToken?: string;
};

type SupabaseClientType = AuthenticationServiceOptions['supabase'];

export class AuthenticationService {
  private prisma: PrismaClient;
  private supabase: SupabaseClientType;
  private emailRedirectTo?: string;
  private resetRedirectTo?: string;
  private oauthRedirectTo?: string;

  constructor(options: AuthenticationServiceOptions) {
    this.prisma = options.prisma;
    this.supabase = options.supabase;
    this.emailRedirectTo = options.emailRedirectTo;
    this.resetRedirectTo = options.resetRedirectTo;
    this.oauthRedirectTo = options.oauthRedirectTo;
  }

  async registerUser(payload: RegisterPayload) {
    const role: DbUserRole = payload.role ?? 'CUSTOMER';
    const profileMetadata = this.pickProfileFields(payload);

    const { data, error } = await this.supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        emailRedirectTo: this.emailRedirectTo,
        data: {
          role,
          ...profileMetadata,
        },
      },
    });

    if (error) {
      const err = new Error(error.message);
      const statusFromError = (error as unknown as { status?: number }).status;
      const code = (error as unknown as { code?: string }).code;
      const status = statusFromError ?? (code === 'unexpected_failure' ? 500 : 400);

      // Supabase can fail signup due to email provider issues; that's not a client error.
      if (/confirmation email/i.test(error.message) || /sending confirmation email/i.test(error.message)) {
        (err as { status?: number }).status = 502;
      } else {
        (err as { status?: number }).status = status;
      }

      throw err;
    }

    const supabaseUser = data.user;

    if (!supabaseUser) {
      throw new Error('Supabase user record missing after signup.');
    }

    const userRecord = await this.upsertUserFromSupabase(supabaseUser, {
      ...profileMetadata,
      role,
      referredByStoreId: payload.referredByStoreId,
    });

    return {
      id: userRecord.id,
      email: userRecord.email,
      role: userRecord.role as DbUserRole,
      profile: this.pickProfileFields(userRecord),
      requiresEmailVerification: !data.session,
    };
  }

  async signIn(payload: LoginPayload) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    const { session, user } = data;

    if (!session || !user) {
      throw new Error('Invalid credentials.');
    }

    const syncedUser = await this.upsertUserFromSupabase(user);

    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresIn: session.expires_in,
      user: {
        id: syncedUser.id,
        email: syncedUser.email,
        role: syncedUser.role as DbUserRole,
        profile: this.pickProfileFields(syncedUser),
        emailConfirmed: Boolean(user.email_confirmed_at),
      },
    };
  }

  async requestPasswordReset(payload: PasswordResetPayload) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(payload.email, {
      redirectTo: this.resetRedirectTo,
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      message: 'If an account exists for that email, a reset link is on the way.',
    };
  }

  async resetPassword(payload: PasswordChangePayload) {
    const serviceClient = getSupabaseServiceClient();

    const { error } = await serviceClient.auth.admin.updateUserById(
      payload.userId,
      {
        password: payload.newPassword,
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    return {
      message: 'Password has been updated successfully.',
    };
  }

  async refreshSession(payload: RefreshPayload) {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: payload.refreshToken,
    });

    if (error) {
      throw new Error(error.message);
    }

    const { session, user } = data;

    if (!session || !user) {
      const err = new Error('Invalid refresh token.');
      (err as { status?: number }).status = 401;
      throw err;
    }

    const syncedUser = await this.upsertUserFromSupabase(user);

    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresIn: session.expires_in,
      user: {
        id: syncedUser.id,
        email: syncedUser.email,
        role: syncedUser.role as DbUserRole,
        profile: this.pickProfileFields(syncedUser),
        emailConfirmed: Boolean(user.email_confirmed_at),
      },
    };
  }

  private async upsertUserFromSupabase(
    user: SupabaseUser,
    overrides?: UserProfileInput & { role?: DbUserRole; referredByStoreId?: string }
  ) {
    const email = user.email;

    if (!email) {
      throw new Error('Supabase user missing email.');
    }

    // IMPORTANT: DB role is the source of truth.
    // Supabase `user_metadata.role` can be missing/stale at login time, and must not downgrade users.
    const existingUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    const role: DbUserRole =
      overrides?.role ??
      (existingUser?.role as DbUserRole | undefined) ??
      (user.user_metadata?.role as DbUserRole | undefined) ??
      'CUSTOMER';

    const prismaRole = role as PrismaUserRole;

    const profile = this.pickProfileFields({
      ...(user.user_metadata as Record<string, unknown>),
      ...overrides,
    });
    const referredByStoreId =
      overrides?.referredByStoreId ??
      (user.user_metadata?.referredByStoreId as string | undefined);

    const dbUser = await this.prisma.user.upsert({
      where: { id: user.id },
      update: {
        email,
        role: prismaRole,
        ...(referredByStoreId ? { referredByStoreId } : {}),
        ...profile,
      },
      create: {
        id: user.id,
        email,
        role: prismaRole,
        referredByStoreId: referredByStoreId || null,
        ...profile,
      },
    });

    // If referred by a store, automatically create initial CustomerMembership
    if (referredByStoreId) {
      try {
        const store = await this.prisma.store.findUnique({
          where: { id: referredByStoreId },
        });

        if (store && store.active) {
          await this.prisma.customerMembership.upsert({
            where: {
              customerStoreIdx: {
                customerId: dbUser.id,
                storeId: store.id,
              },
            },
            update: {},
            create: {
              customerId: dbUser.id,
              storeId: store.id,
              pointsBalance: 0,
              qrCodeToken: `${dbUser.id}:${store.id}`,
              joinSource: 'STORE_QR',
            },
          });
        }
      } catch (e) {
        console.warn('Failed to auto-enroll referred customer:', e);
      }
    }

    // Keep JWT in sync: push DB role into Supabase user_metadata so the next token (login/refresh) contains the correct role (Security First).
    const serviceClient = getSupabaseServiceClient();
    await serviceClient.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...(user.user_metadata as Record<string, unknown>),
        role: dbUser.role,
      },
    });

    return dbUser;
  }

  async getGoogleOAuthUrl(payload: GoogleOAuthPayload) {
    const redirectTo = payload.redirectTo || this.oauthRedirectTo;
    
    if (!redirectTo) {
      throw new Error('OAuth redirect URL is not configured');
    }

    // Use Supabase's signInWithOAuth - it will handle PKCE flow
    // The redirectTo URL should be configured in Supabase dashboard
    // Supabase will redirect to: https://[project].supabase.co/auth/v1/callback
    // Then redirect to our redirectTo URL with code in query params
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.url) {
      throw new Error('Failed to generate OAuth URL');
    }

    return {
      url: data.url,
    };
  }

  async handleGoogleOAuthCallback(payload: GoogleOAuthCallbackPayload) {
    // Use service client for code exchange (more secure for server-side OAuth)
    const serviceClient = getSupabaseServiceClient();
    
    // Exchange the code for a session
    const { data, error } = await serviceClient.auth.exchangeCodeForSession(payload.code);

    if (error) {
      throw new Error(error.message);
    }

    const { session, user } = data;

    if (!session || !user) {
      throw new Error('Invalid OAuth callback response');
    }

    // Extract profile data from Google OAuth response
    const googleProfile = user.user_metadata;
    const profileMetadata = this.pickProfileFields({
      fullName: googleProfile?.full_name || googleProfile?.name,
      ...googleProfile,
    });

    const role: DbUserRole = (googleProfile?.role as DbUserRole | undefined) ?? 'CUSTOMER';

    // Upsert user in database
    const syncedUser = await this.upsertUserFromSupabase(user, {
      ...profileMetadata,
      role,
    });

    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresIn: session.expires_in,
      user: {
        id: syncedUser.id,
        email: syncedUser.email,
        role: syncedUser.role as DbUserRole,
        profile: this.pickProfileFields(syncedUser),
        emailConfirmed: Boolean(user.email_confirmed_at),
      },
    };
  }

  async handleGoogleOAuthTokens(payload: GoogleOAuthTokenPayload) {
    // Validate tokens with Supabase and get user info
    const serviceClient = getSupabaseServiceClient();
    
    // Set the session using the access token
    const { data: { user }, error: userError } = await serviceClient.auth.getUser(payload.accessToken);

    if (userError || !user) {
      throw new Error(userError?.message || 'Invalid access token');
    }

    // Extract profile data from Google OAuth response
    const googleProfile = user.user_metadata;
    const profileMetadata = this.pickProfileFields({
      fullName: googleProfile?.full_name || googleProfile?.name,
      ...googleProfile,
    });

    const role: DbUserRole = (googleProfile?.role as DbUserRole | undefined) ?? 'CUSTOMER';

    // Upsert user in database
    const syncedUser = await this.upsertUserFromSupabase(user, {
      ...profileMetadata,
      role,
    });

    // Get session info - we'll use the provided tokens
    // Calculate expires_in (default to 3600 seconds / 1 hour)
    const expiresIn = 3600;

    // Ensure refreshToken is always a string (required by schema)
    const refreshToken: string = payload.refreshToken || '';

    return {
      accessToken: payload.accessToken,
      refreshToken,
      expiresIn,
      user: {
        id: syncedUser.id,
        email: syncedUser.email,
        role: syncedUser.role as DbUserRole,
        profile: this.pickProfileFields(syncedUser),
        emailConfirmed: Boolean(user.email_confirmed_at),
      },
    };
  }

  private pickProfileFields(source?: unknown): Partial<UserProfileShape> {
    if (!source || typeof source !== 'object') {
      return {};
    }

    return PROFILE_FIELDS.reduce((acc, field) => {
      const value = (source as Record<string, unknown>)[field];

      if (value !== undefined) {
        // All profile fields are string | null, so validate the type
        if (value === null || typeof value === 'string') {
          acc[field] = value as UserProfileShape[typeof field];
        }
      }

      return acc;
    }, {} as Partial<UserProfileShape>);
  }
}
