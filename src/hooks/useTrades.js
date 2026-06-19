import { useCallback } from 'react'
import { useTradeStore } from '@/store/useStore'
import { tradesAPI } from '@/services/api'
import toast from 'react-hot-toast'

export const useTrades = () => {
  const {
    trades, filters, pagination, isLoading,
    setTrades, addTrade, updateTrade, removeTrade,
    setLoading, setError,
  } = useTradeStore()

  const fetchTrades = useCallback(async (extraParams = {}) => {
    setLoading(true)
    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        ...extraParams,
      }
      const { data } = await tradesAPI.getAll(params)
      setTrades(data.trades, data.total)
    } catch (err) {
      setError(err.message)
      toast.error('Failed to load trades')
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page])

  const createTrade = useCallback(async (tradeData) => {
    try {
      const { data } = await tradesAPI.create(tradeData)
      addTrade(data.trade)
      toast.success('Trade logged successfully')
      return data.trade
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log trade')
      throw err
    }
  }, [])

  const editTrade = useCallback(async (id, tradeData) => {
    try {
      const { data } = await tradesAPI.update(id, tradeData)
      updateTrade(id, data.trade)
      toast.success('Trade updated')
      return data.trade
    } catch (err) {
      toast.error('Failed to update trade')
      throw err
    }
  }, [])

  const deleteTrade = useCallback(async (id) => {
    try {
      await tradesAPI.delete(id)
      removeTrade(id)
      toast.success('Trade deleted')
    } catch (err) {
      toast.error('Failed to delete trade')
      throw err
    }
  }, [])

  return {
    trades,
    filters,
    pagination,
    isLoading,
    fetchTrades,
    createTrade,
    editTrade,
    deleteTrade,
  }
}
