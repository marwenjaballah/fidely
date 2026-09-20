/**
 * Shared DB-related types from @repo/types (Supabase-generated).
 * Re-exports and aliases for use across apps.
 */
import type { Enums, Tables } from '@repo/types'

export type UserRole = Enums<'UserRole'>
export type DbUser = Tables<'users'>

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  avatar_url: string | null
  is_verified: boolean
  created_at: string
  updated_at: string
}
