import { create } from 'zustand'
import { createCookieAuthApiClient, ApiError } from '@/lib/api-client'
import { AUTH_ROUTES } from '@/features/auth/services/auth-service'
import axios from 'axios'

export interface AdminMetrics {
  totalRevenue: number
  totalStores: number
  totalUsers: number
  totalPointsCirculating: number
  activeTodayCount: number
  chartData: Array<{ date: string; volume: number }>
  recentActivity: Array<{
    id: string
    type: string
    amount: number
    storeName: string
    customerName: string
    createdAt: string
  }>
}

export interface AdminStore {
  id: string
  name: string
  slug: string
  primaryColor: string
  pointsPerTnd: number
  createdAt: string
  owner: {
    id: string
    email: string
    fullName: string | null
  }
  _count: {
    memberships: number
    staff: number
    transactions: number
  }
}

export interface AdminUser {
  id: string
  email: string
  role: string
  fullName: string | null
  createdAt: string
  storeMembershipsCount: number
  staffStoreCount: number
  ownedStoresCount: number
}

export interface AdminTransaction {
  id: string
  type: string
  amount: number
  points: number
  createdAt: string
  store: {
    id: string
    name: string
  }
  customer: {
    id: string
    fullName: string | null
    email: string
  }
}

export interface AdminState {
  metrics: AdminMetrics | null
  stores: AdminStore[]
  users: AdminUser[]
  transactions: AdminTransaction[]
  loading: boolean
  error: string | null

  fetchMetrics: () => Promise<void>
  fetchStores: () => Promise<void>
  fetchUsers: (query?: string, role?: string) => Promise<void>
  updateUserRole: (userId: string, role: string) => Promise<void>
  fetchTransactions: () => Promise<void>
}

const baseURL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

let adminClient: ReturnType<typeof createCookieAuthApiClient> | null = null

function getAdminClient() {
  if (adminClient) return adminClient
  const refreshClient = axios.create({
    baseURL: baseURL.replace(/\/$/, ''),
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  })
  adminClient = createCookieAuthApiClient({
    baseURL,
    useCookies: true,
    refreshUrl: AUTH_ROUTES.refresh,
    onRefresh: async () => {
      await refreshClient.post(AUTH_ROUTES.refresh, {})
    },
  })
  return adminClient
}

export const useAdminStore = create<AdminState>((set, get) => ({
  metrics: null,
  stores: [],
  users: [],
  transactions: [],
  loading: false,
  error: null,

  fetchMetrics: async () => {
    set({ loading: true, error: null })
    try {
      const client = getAdminClient()
      const { data } = await client.get<AdminMetrics>('/api/v1/admin/metrics')
      set({ metrics: data, loading: false, error: null })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load platform metrics.'
      set({ error: message, loading: false })
    }
  },

  fetchStores: async () => {
    set({ loading: true, error: null })
    try {
      const client = getAdminClient()
      const { data } = await client.get<AdminStore[]>('/api/v1/admin/stores')
      set({ stores: data, loading: false, error: null })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load stores.'
      set({ error: message, loading: false })
    }
  },

  fetchUsers: async (query?: string, role?: string) => {
    set({ loading: true, error: null })
    try {
      const client = getAdminClient()
      const params = new URLSearchParams()
      if (query) params.append('query', query)
      if (role && role !== 'ALL') params.append('role', role)

      const endpoint = `/api/v1/admin/users${params.toString() ? `?${params.toString()}` : ''}`
      const { data } = await client.get<AdminUser[]>(endpoint)
      set({ users: data, loading: false, error: null })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load users.'
      set({ error: message, loading: false })
    }
  },

  updateUserRole: async (userId: string, role: string) => {
    set({ loading: true, error: null })
    try {
      const client = getAdminClient()
      await client.patch(`/api/v1/admin/users/${userId}/role`, { role })
      // Update locally
      const users = get().users.map((u) => (u.id === userId ? { ...u, role } : u))
      set({ users, loading: false, error: null })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to update user role.'
      set({ error: message, loading: false })
      throw err
    }
  },

  fetchTransactions: async () => {
    set({ loading: true, error: null })
    try {
      const client = getAdminClient()
      const { data } = await client.get<AdminTransaction[]>('/api/v1/admin/transactions')
      set({ transactions: data, loading: false, error: null })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load transactions.'
      set({ error: message, loading: false })
    }
  },
}))
