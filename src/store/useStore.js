import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Auth Store ──────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
)

// ─── Trade Store ─────────────────────────────────────────────
export const useTradeStore = create((set, get) => ({
  trades: [],
  selectedTrade: null,
  filters: {
    symbol: '',
    type: '',        // 'long' | 'short' | ''
    mistake: '',
    dateFrom: '',
    dateTo: '',
    result: '',      // 'win' | 'loss' | ''
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
  isLoading: false,
  error: null,

  setTrades: (trades, total) =>
    set((s) => ({ trades, pagination: { ...s.pagination, total } })),

  addTrade: (trade) =>
    set((s) => ({ trades: [trade, ...s.trades] })),

  updateTrade: (id, updated) =>
    set((s) => ({
      trades: s.trades.map((t) => (t._id === id ? { ...t, ...updated } : t)),
    })),

  removeTrade: (id) =>
    set((s) => ({ trades: s.trades.filter((t) => t._id !== id) })),

  setSelectedTrade: (trade) => set({ selectedTrade: trade }),

  setFilters: (filters) =>
    set((s) => ({
      filters: { ...s.filters, ...filters },
      pagination: { ...s.pagination, page: 1 },
    })),

  resetFilters: () =>
    set({
      filters: { symbol: '', type: '', mistake: '', dateFrom: '', dateTo: '', result: '' },
    }),

  setPage: (page) =>
    set((s) => ({ pagination: { ...s.pagination, page } })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))

// ─── UI Store ────────────────────────────────────────────────
export const useUIStore = create((set) => ({
  isTradeFormOpen: false,
  editingTradeId: null,
  sidebarCollapsed: false,

  openTradeForm: (tradeId = null) =>
    set({ isTradeFormOpen: true, editingTradeId: tradeId }),

  closeTradeForm: () =>
    set({ isTradeFormOpen: false, editingTradeId: null }),

  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}))

// ─── Analytics Store ─────────────────────────────────────────
export const useAnalyticsStore = create((set) => ({
  summary: null,
  equityCurve: [],
  mistakeData: [],
  calendarData: {},
  aiInsights: [],
  isLoadingInsights: false,

  setSummary: (summary) => set({ summary }),
  setEquityCurve: (equityCurve) => set({ equityCurve }),
  setMistakeData: (mistakeData) => set({ mistakeData }),
  setCalendarData: (calendarData) => set({ calendarData }),
  setAIInsights: (aiInsights) => set({ aiInsights }),
  setLoadingInsights: (isLoadingInsights) => set({ isLoadingInsights }),
}))

// ─── Theme Store ──────────────────────────────────────────────
export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === 'dark' ? 'light' : 'dark'
          document.documentElement.classList.toggle('light', next === 'light')
          return { theme: next }
        }),
      initTheme: (theme) => {
        document.documentElement.classList.toggle('light', theme === 'light')
      },
    }),
    { name: 'theme-storage' }
  )
)
