import { PrismaClient } from '@repo/database';

import { AbstractServiceOptions } from '../types/services.js';
import { getSupabaseServiceClient } from '../lib/supabase.js';

import { HTTPException } from 'hono/http-exception';
import { normalizePhone, getPhoneSignificantDigits } from '../utils/phone.js';

export class UsersService {
  prisma: PrismaClient;

  constructor(options: AbstractServiceOptions) {
    this.prisma = options.prisma;
  }

  async getLoggedUserData(id: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
      },
    });
  }

  async updateLoggedUserData(id: string, data: { fullName?: string; phone?: string | null }) {
    let normalizedPhone: string | null | undefined = undefined;

    if (data.phone !== undefined) {
      if (data.phone === null || data.phone.trim() === '') {
        normalizedPhone = null;
      } else {
        const normalized = normalizePhone(data.phone);
        if (!normalized) {
          normalizedPhone = null;
        } else {
          const rawDigits = normalized.replace(/\D/g, '');
          if (rawDigits.length < 6) {
            throw new HTTPException(400, {
              message: 'Please enter a valid phone number with at least 6 digits.',
            });
          }

          // Verify phone number is unique across all client accounts
          const significantDigits = getPhoneSignificantDigits(normalized);
          const existingUser = await this.prisma.user.findFirst({
            where: {
              id: { not: id },
              OR: [
                { phone: normalized },
                { phone: { endsWith: significantDigits } },
              ],
            },
            select: { id: true, email: true },
          });

          if (existingUser) {
            throw new HTTPException(409, {
              message: 'This phone number is already registered to another account.',
            });
          }

          normalizedPhone = normalized;
        }
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
        ...(normalizedPhone !== undefined ? { phone: normalizedPhone } : {}),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
      },
    });

    return updated;
  }

  async deleteLoggedUser(id: string) {
    const serviceClient = getSupabaseServiceClient();

    // First delete from Supabase Auth (primary source of truth)
    const { error } = await serviceClient.auth.admin.deleteUser(id);

    if (error) {
      // Surface a clear error so the caller can handle / log it
      throw new Error(error.message);
    }

    // Then delete the corresponding record from our local `user` table
    await this.prisma.user.delete({
      where: { id },
    });
  }
}