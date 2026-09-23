import type { PrismaClient, UserRole as PrismaUserRole } from '@repo/database';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Database } from '@repo/types';
import { HTTPException } from 'hono/http-exception';
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
  role?: DbUserRole;
  intent?: 'login' | 'signup';
  referredByStoreId?: string;
};

type GoogleOAuthTokenPayload = {
  accessToken: string;
  refreshToken?: string;
  role?: DbUserRole;
  intent?: 'login' | 'signup';
  referredByStoreId?: string;
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
          ...(payload.referredByStoreId ? { referredByStoreId: payload.referredByStoreId } : {}),
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
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: user.id },
          { email: email.toLowerCase() },
        ],
      },
      select: { id: true, role: true, referredByStoreId: true },
    });

    const role: DbUserRole =
      (existingUser?.role as DbUserRole | undefined) ??
      overrides?.role ??
      (user.user_metadata?.role as DbUserRole | undefined) ??
      'CUSTOMER';

    const prismaRole = role as PrismaUserRole;

    const profile = this.pickProfileFields({
      ...(user.user_metadata as Record<string, unknown>),
      ...overrides,
    });
    const rawReferredByStore =
      overrides?.referredByStoreId ??
      (user.user_metadata?.referredByStoreId as string | undefined) ??
      existingUser?.referredByStoreId;

    let resolvedStore: any = null;
    let resolvedStoreId: string | null = null;

    if (rawReferredByStore && typeof rawReferredByStore === 'string') {
      const trimmedRef = rawReferredByStore.trim();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmedRef);
      try {
        resolvedStore = await this.prisma.store.findFirst({
          where: {
            OR: [
              { slug: trimmedRef.toLowerCase() },
              ...(isUuid ? [{ id: trimmedRef }] : []),
            ],
          },
        });
        if (resolvedStore) {
          resolvedStoreId = resolvedStore.id;
        }
      } catch (e) {
        console.warn('Error resolving referred store:', e);
      }
    }

    const targetUserId = existingUser?.id ?? user.id;
    let dbUser: any;
    try {
      dbUser = await this.prisma.user.upsert({
        where: { id: targetUserId },
        update: {
          email,
          role: prismaRole,
          ...(resolvedStoreId ? { referredByStoreId: resolvedStoreId } : {}),
          ...profile,
        },
        create: {
          id: user.id,
          email,
          role: prismaRole,
          referredByStoreId: resolvedStoreId,
          ...profile,
        },
      });
    } catch (err: any) {
      // Graceful fallback if database schema is missing `referredByStoreId` or other optional columns
      console.warn(
        '⚠️ Prisma user upsert fallback:',
        err.message
      );
      dbUser = await this.prisma.user.upsert({
        where: { id: targetUserId },
        update: {
          email,
          role: prismaRole,
          ...profile,
        },
        create: {
          id: user.id,
          email,
          role: prismaRole,
          ...profile,
        },
      });
    }

    // If referred by a store (either by store UUID or store slug), automatically create initial CustomerMembership
    if (resolvedStore && resolvedStore.active) {
      try {
        await this.prisma.customerMembership.upsert({
          where: {
            customerStoreIdx: {
              customerId: dbUser.id,
              storeId: resolvedStore.id,
            },
          },
          update: {},
          create: {
            customerId: dbUser.id,
            storeId: resolvedStore.id,
            pointsBalance: 0,
            qrCodeToken: `${dbUser.id}:${resolvedStore.id}`,
            joinSource: 'STORE_QR',
          },
        });
      } catch (e) {
        console.warn('Failed to auto-enroll referred customer:', e);
      }
    }

    // Keep JWT in sync: push DB role into Supabase user_metadata
    try {
      const serviceClient = getSupabaseServiceClient();
      await serviceClient.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...(user.user_metadata as Record<string, unknown>),
          role: dbUser.role,
        },
      });
    } catch (e: any) {
      console.warn('Failed to sync DB role to Supabase metadata:', e?.message || e);
    }

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

    const userEmail = user.email?.toLowerCase();

    // Check if user already exists in database
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: user.id },
          ...(userEmail ? [{ email: userEmail }] : []),
        ],
      },
      select: { id: true, email: true, role: true },
    });

    // If intent is login, but no user account exists in Fidely:
    if (payload.intent === 'login' && !existingUser) {
      // Clean up newly created Supabase auth user so no unlinked ghost user remains
      await serviceClient.auth.admin.deleteUser(user.id).catch(() => {});

      const err = new HTTPException(404, { message: 'ACCOUNT_NOT_FOUND' });
      (err as any).data = {
        email: user.email,
        fullName: googleProfile?.full_name || googleProfile?.name || '',
      };
      throw err;
    }

    const role: DbUserRole =
      (existingUser?.role as DbUserRole | undefined) ??
      payload.role ??
      (googleProfile?.role as DbUserRole | undefined) ??
      'CUSTOMER';

    // Upsert user in database
    const syncedUser = await this.upsertUserFromSupabase(user, {
      ...profileMetadata,
      role,
      referredByStoreId: payload.referredByStoreId,
    });

    // If new user, sync role to Supabase user_metadata as well
    if (!existingUser && role) {
      await serviceClient.auth.admin.updateUserById(user.id, {
        user_metadata: { ...googleProfile, role },
      }).catch(() => {});
    }

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

    const userEmail = user.email?.toLowerCase();

    // Check if user already exists in database
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: user.id },
          ...(userEmail ? [{ email: userEmail }] : []),
        ],
      },
      select: { id: true, email: true, role: true },
    });

    // If intent is login, but no user account exists in Fidely:
    if (payload.intent === 'login' && !existingUser) {
      // Clean up newly created Supabase auth user so no unlinked ghost user remains
      await serviceClient.auth.admin.deleteUser(user.id).catch(() => {});

      const err = new HTTPException(404, { message: 'ACCOUNT_NOT_FOUND' });
      (err as any).data = {
        email: user.email,
        fullName: googleProfile?.full_name || googleProfile?.name || '',
      };
      throw err;
    }

    const role: DbUserRole =
      (existingUser?.role as DbUserRole | undefined) ??
      payload.role ??
      (googleProfile?.role as DbUserRole | undefined) ??
      'CUSTOMER';

    // Upsert user in database
    const syncedUser = await this.upsertUserFromSupabase(user, {
      ...profileMetadata,
      role,
      referredByStoreId: payload.referredByStoreId,
    });

    // If new user, sync role to Supabase user_metadata as well
    if (!existingUser && role) {
      await serviceClient.auth.admin.updateUserById(user.id, {
        user_metadata: { ...googleProfile, role },
      }).catch(() => {});
    }

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
