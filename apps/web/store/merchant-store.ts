import { create } from 'zustand'
import { createCookieAuthApiClient, ApiError } from '@/lib/api-client'
import { AUTH_ROUTES } from '@/features/auth/services/auth-service'
import axios from 'axios'

export interface Store {
  id: string
  name: string
  slug: string
  primaryColor: string
  pointsPerTnd: number
}

export interface Customer {
  customerId: string
  fullName: string | null
  email: string
  pointsBalance: number
  joinedAt: string
}

export interface Staff {
  id: string
  fullName: string | null
  email: string
  phone?: string | null
  createdAt: string
}

export interface Analytics {
  totalMembers: number
  totalPointsIssued: number
  totalPointsRedeemed: number
  recentTransactions: Array<{
    date: string
    issued: number
    redeemed: number
  }>
}

export interface MerchantState {
  stores: Store[]
  activeStore: Store | null
  customers: Customer[]
  staff: Staff[]
  analytics: Analytics | null
  loading: boolean
  error: string | null

  fetchStores: () => Promise<void>
  createStore: (name: string, slug: string) => Promise<Store>
  setActiveStore: (storeId: string) => void
  updateStore: (storeId: string, data: Partial<Store>) => Promise<void>
  fetchCustomers: (storeId: string) => Promise<void>
  fetchStaff: (storeId: string) => Promise<void>
  createStaff: (storeId: string, data: { fullName: string; email: string; password?: string; phone?: string }) => Promise<Staff>
  inviteStaff: (storeId: string, fullName: string, email: string) => Promise<void>
  updateStaff: (storeId: string, staffId: string, data: { fullName?: string; phone?: string }) => Promise<Staff>
  changeStaffPassword: (storeId: string, staffId: string, password: string) => Promise<void>
  deleteStaff: (storeId: string, staffId: string) => Promise<void>
  fetchAnalytics: (storeId: string) => Promise<void>
}

const baseURL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

let merchantClient: ReturnType<typeof createCookieAuthApiClient> | null = null

function getMerchantClient() {
  if (merchantClient) return merchantClient
  const refreshClient = axios.create({
    baseURL: baseURL.replace(/\/$/, ''),
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  })
  merchantClient = createCookieAuthApiClient({
    baseURL,
    useCookies: true,
    refreshUrl: AUTH_ROUTES.refresh,
    onRefresh: async () => {
      await refreshClient.post(AUTH_ROUTES.refresh, {})
    },
  })
  return merchantClient
}

export const useMerchantStore = create<MerchantState>((set, get) => ({
  stores: [],
  activeStore: null,
  customers: [],
  staff: [],
  analytics: null,
  loading: false,
  error: null,

  fetchStores: async () => {
    set({ loading: true, error: null })
    try {
      const client = getMerchantClient()
      const { data } = await client.get<Store[]>('/api/v1/merchant/stores')
      const stores = data
      const savedStoreId = typeof window !== 'undefined' ? localStorage.getItem('fidely_active_store_id') : null
      const currentActiveId = get().activeStore?.id || savedStoreId
      const activeStore = stores.find(s => s.id === currentActiveId) || (stores.length > 0 ? stores[0] : null)
      
      if (activeStore && typeof window !== 'undefined') {
        localStorage.setItem('fidely_active_store_id', activeStore.id)
      }
      
      set({ 
        stores, 
        activeStore,
        loading: false, 
        error: null 
      })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load stores.'
      set({ error: message, loading: false })
    }
  },

  createStore: async (name: string, slug: string) => {
    set({ loading: true, error: null })
    try {
      const client = getMerchantClient()
      const { data } = await client.post<Store>('/api/v1/merchant/stores', { name, slug })
      const stores = [...get().stores, data]
      if (typeof window !== 'undefined') {
        localStorage.setItem('fidely_active_store_id', data.id)
      }
      set({ 
        stores, 
        activeStore: data,
        loading: false, 
        error: null 
      })
      return data
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to create store.'
      set({ error: message, loading: false })
      throw err
    }
  },

  setActiveStore: (storeId: string) => {
    const store = get().stores.find(s => s.id === storeId) || null
    if (store && typeof window !== 'undefined') {
      localStorage.setItem('fidely_active_store_id', store.id)
    }
    set({ activeStore: store })
  },

  updateStore: async (storeId: string, payload: Partial<Store>) => {
    set({ loading: true, error: null })
    try {
      const client = getMerchantClient()
      const { data } = await client.put<Store>(`/api/v1/merchant/stores/${storeId}`, payload)
      
      const stores = get().stores.map(s => s.id === storeId ? data : s)
      const activeStore = get().activeStore?.id === storeId ? data : get().activeStore
      
      set({ stores, activeStore, loading: false, error: null })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to update store.'
      set({ error: message, loading: false })
      throw err
    }
  },

  fetchCustomers: async (storeId: string) => {
    set({ loading: true, error: null })
    try {
      const client = getMerchantClient()
      const { data } = await client.get<Customer[]>(`/api/v1/merchant/stores/${storeId}/customers`)
      set({ customers: data, loading: false, error: null })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load customers.'
      set({ error: message, loading: false })
    }
  },

  fetchStaff: async (storeId: string) => {
    set({ loading: true, error: null })
    try {
      const client = getMerchantClient()
      const { data } = await client.get<Staff[]>(`/api/v1/merchant/stores/${storeId}/staff`)
      set({ staff: data, loading: false, error: null })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load staff.'
      set({ error: message, loading: false })
    }
  },

  createStaff: async (storeId: string, data: { fullName: string; email: string; password?: string; phone?: string }) => {
    set({ loading: true, error: null })
    try {
      const client = getMerchantClient()
      const { data: newStaff } = await client.post<Staff>(`/api/v1/merchant/stores/${storeId}/staff`, data)
      const staff = [...get().staff, newStaff]
      set({ staff, loading: false, error: null })
      return newStaff
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to create cashier.'
      set({ error: message, loading: false })
      throw err
    }
  },

  inviteStaff: async (storeId: string, fullName: string, email: string) => {
    await get().createStaff(storeId, { fullName, email })
  },

  updateStaff: async (storeId: string, staffId: string, data: { fullName?: string; phone?: string }) => {
    set({ loading: true, error: null })
    try {
      const client = getMerchantClient()
      const { data: updatedStaff } = await client.put<Staff>(`/api/v1/merchant/stores/${storeId}/staff/${staffId}`, data)
      const staff = get().staff.map((s) => (s.id === staffId ? updatedStaff : s))
      set({ staff, loading: false, error: null })
      return updatedStaff
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to update cashier.'
      set({ error: message, loading: false })
      throw err
    }
  },

  changeStaffPassword: async (storeId: string, staffId: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const client = getMerchantClient()
      await client.put(`/api/v1/merchant/stores/${storeId}/staff/${staffId}/password`, { password })
      set({ loading: false, error: null })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to change password.'
      set({ error: message, loading: false })
      throw err
    }
  },

  deleteStaff: async (storeId: string, staffId: string) => {
    set({ loading: true, error: null })
    try {
      const client = getMerchantClient()
      await client.delete(`/api/v1/merchant/stores/${storeId}/staff/${staffId}`)
      const staff = get().staff.filter((s) => s.id !== staffId)
      set({ staff, loading: false, error: null })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to remove cashier.'
      set({ error: message, loading: false })
      throw err
    }
  },

  fetchAnalytics: async (storeId: string) => {
    set({ loading: true, error: null })
    try {
      const client = getMerchantClient()
      const { data } = await client.get<Analytics>(`/api/v1/merchant/stores/${storeId}/analytics`)
      set({ analytics: data, loading: false, error: null })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load analytics.'
      set({ error: message, loading: false })
    }
  }
}))
