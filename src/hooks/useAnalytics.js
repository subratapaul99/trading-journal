import { useCallback } from 'react'
import { useAnalyticsStore } from '@/store/useStore'
import { analyticsAPI } from '@/services/api'
import toast from 'react-hot-toast'

export const useAnalytics = () => {
  const {
    summary, equityCurve, mistakeData, calendarData, aiInsights,
    isLoadingInsights,
    setSummary, setEquityCurve, setMistakeData, setCalendarData,
    setAIInsights, setLoadingInsights,
  } = useAnalyticsStore()

  const fetchAll = useCallback(async (range = '1M') => {
    try {
      const [s, e, m, c] = await Promise.all([
        analyticsAPI.getSummary({ range }),
        analyticsAPI.getEquityCurve({ range }),
        analyticsAPI.getMistakes({ range }),
        analyticsAPI.getCalendar({ range }),
      ])
      setSummary(s.data)
      setEquityCurve(e.data.curve)
      setMistakeData(m.data.mistakes)
      setCalendarData(c.data.calendar)
    } catch {
      toast.error('Failed to load analytics')
    }
  }, [])

  const fetchAIInsights = useCallback(async () => {
    setLoadingInsights(true)
    try {
      const { data } = await analyticsAPI.getAIInsights()
      setAIInsights(data.insights)
    } catch {
      toast.error('AI analysis failed')
    } finally {
      setLoadingInsights(false)
    }
  }, [])

  return {
    summary, equityCurve, mistakeData, calendarData,
    aiInsights, isLoadingInsights,
    fetchAll, fetchAIInsights,
  }
}
