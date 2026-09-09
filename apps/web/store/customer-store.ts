import { create } from 'zustand'
import { createCookieAuthApiClient, ApiError } from '@/lib/api-client'
import { AUTH_ROUTES } from '@/features/auth/services/auth-service'
import axios from 'axios'

export interface Reward {
  id: string
  name: string
  description?: string | null
  pointsCost: number
  active: boolean
}

export interface Voucher {
  id: string
  code: string
  status: string
  issuedAt: string
  usedAt?: string | null
  rewardName: string
  pointsCost: number
}

export interface Transaction {
  id: string
  type: string
  amountTnd: number | null
  pointsAffected: number
  createdAt: string
}

export interface CustomerMembership {
  id: string
  storeId: string
  storeName: string
  storeSlug: string
  primaryColor: string
  pointsPerTnd: number
  pointsBalance: number
  qrCodeToken: string
  joinedAt: string
  rewards: Reward[]
  vouchers: Voucher[]
  transactions: Transaction[]
}

export interface AvailableStore {
  id: string
  name: string
  slug: string
  primaryColor: string
  pointsPerTnd: number
  rewardsCount: number
}

export interface CustomerState {
  memberships: CustomerMembership[]
  activeMembership: CustomerMembership | null
  availableStores: AvailableStore[]
  loading: boolean
  error: string | null

  fetchOverview: () => Promise<void>
  setActiveMembership: (membershipId: string) => void
  joinStore: (storeId: string) => Promise<void>
}

const baseURL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

let customerClient: ReturnType<typeof createCookieAuthApiClient> | null = null

function getCustomerClient() {
  if (customerClient) return customerClient
  const refreshClient = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  })
  customerClient = createCookieAuthApiClient({
    baseURL,
    useCookies: true,
    refreshUrl: AUTH_ROUTES.refresh,
    onRefresh: async () => {
      await refreshClient.post(AUTH_ROUTES.refresh, {})
    },
  })
  return customerClient
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  memberships: [],
  activeMembership: null,
  availableStores: [],
  loading: false,
  error: null,

  fetchOverview: async () => {
    set({ loading: true, error: null })
    try {
      const client = getCustomerClient()
      const { data } = await client.get<{
        memberships: CustomerMembership[]
        availableStores: AvailableStore[]
      }>('/api/v1/customer/overview')

      const memberships = data.memberships || []
      const availableStores = data.availableStores || []

      const currentActiveId = get().activeMembership?.id
      const activeMembership =
        memberships.find((m) => m.id === currentActiveId) || (memberships.length > 0 ? memberships[0] : null)

      set({
        memberships,
        activeMembership,
        availableStores,
        loading: false,
        error: null,
      })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load loyalty overview.'
      set({ error: message, loading: false })
    }
  },

  setActiveMembership: (membershipId: string) => {
    const membership = get().memberships.find((m) => m.id === membershipId) || null
    set({ activeMembership: membership })
  },

  joinStore: async (storeId: string) => {
    set({ loading: true, error: null })
    try {
      const client = getCustomerClient()
      await client.post('/api/v1/customer/join', { storeId })
      await get().fetchOverview()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to join coffee shop loyalty.'
      set({ error: message, loading: false })
      throw err
    }
  },
}))
