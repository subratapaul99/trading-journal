import { useMemo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, startOfWeek, addDays } from 'date-fns'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// Generate mock calendar data
const generateMockData = () => {
  const data = {}
  const now = new Date()
  for (let i = 90; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = format(d, 'yyyy-MM-dd')
    if (d.getDay() !== 0 && d.getDay() !== 6 && Math.random() > 0.3) {
      data[key] = (Math.random() - 0.4) * 1200
    }
  }
  return data
}

const getPnLColor = (pnl) => {
  if (pnl === undefined || pnl === null) return 'var(--bg-secondary)'
  if (pnl > 500)  return 'rgba(0,200,150,0.9)'
  if (pnl > 200)  return 'rgba(0,200,150,0.6)'
  if (pnl > 0)    return 'rgba(0,200,150,0.3)'
  if (pnl > -200) return 'rgba(232,64,64,0.3)'
  if (pnl > -500) return 'rgba(232,64,64,0.6)'
  return 'rgba(232,64,64,0.9)'
}

export default function PnLCalendar({ data, loading }) {
  const calData = data && Object.keys(data).length ? data : generateMockData()

  const months = useMemo(() => {
    const now = new Date()
    const result = []
    for (let m = 2; m >= 0; m--) {
      const date = new Date(now.getFullYear(), now.getMonth() - m, 1)
      const days = eachDayOfInterval({ start: startOfMonth(date), end: endOfMonth(date) })
      result.push({ label: MONTHS[date.getMonth()], year: date.getFullYear(), days })
    }
    return result
  }, [])

  if (loading) {
    return <div className="h-32 rounded-lg animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Legend */}
      <div className="flex items-center gap-3 justify-end">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Loss</span>
        {['rgba(232,64,64,0.9)', 'rgba(232,64,64,0.5)', 'rgba(232,64,64,0.2)', 'var(--bg-secondary)', 'rgba(0,200,150,0.2)', 'rgba(0,200,150,0.5)', 'rgba(0,200,150,0.9)'].map((c, i) => (
          <div key={i} className="w-4 h-4 rounded-sm" style={{ background: c, border: '1px solid rgba(255,255,255,0.05)' }} />
        ))}
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Profit</span>
      </div>

      {/* Calendar months */}
      <div className="flex gap-6">
        {months.map(({ label, year, days }) => {
          const firstDow = getDay(days[0])
          const cells = []
          for (let i = 0; i < firstDow; i++) cells.push(null)
          days.forEach(d => cells.push(d))

          return (
            <div key={`${year}-${label}`} className="flex-1">
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                {label} {year}
              </p>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {DAYS.map(d => (
                  <div key={d} className="text-center" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{d[0]}</div>
                ))}
              </div>
              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                  if (!day) return <div key={`e-${i}`} />
                  const key = format(day, 'yyyy-MM-dd')
                  const pnl = calData[key]
                  const isToday = key === format(new Date(), 'yyyy-MM-dd')
                  return (
                    <div
                      key={key}
                      title={pnl !== undefined ? `${key}: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(0)}` : key}
                      className="aspect-square rounded-sm cursor-pointer transition-transform hover:scale-110"
                      style={{
                        background: getPnLColor(pnl),
                        border: isToday ? '1px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.04)',
                        minHeight: '18px',
                      }}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
