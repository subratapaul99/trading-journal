import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { formatDate, formatCurrency } from '@/utils'

const generateMockDrawdown = () => {
  const data = []
  let equity = 10000
  let peak = 10000
  for (let i = 30; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const change = (Math.random() - 0.42) * 300
    equity = Math.max(equity + change, 7000)
    if (equity > peak) peak = equity
    const dd = ((equity - peak) / peak) * 100
    data.push({ date: d.toISOString(), drawdown: parseFloat(dd.toFixed(2)), equity })
  }
  return data
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  return (
    <div className="px-3 py-2 rounded-lg text-xs"
      style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>{label}</p>
      <p className="font-mono font-medium" style={{ color: val < 0 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
        {val.toFixed(2)}%
      </p>
    </div>
  )
}

export default function DrawdownChart({ data, loading }) {
  if (loading) return <div className="h-40 rounded-lg animate-pulse" style={{ background: 'var(--bg-secondary)' }} />

  const chartData = (data?.length ? data : generateMockDrawdown()).map(d => ({
    ...d,
    dateLabel: formatDate(d.date, 'MMM dd'),
  }))

  return (
    <div style={{ height: '160px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E84040" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#E84040" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="dateLabel" tick={{ fill: '#8892A4', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis
            tick={{ fill: '#8892A4', fontSize: 11 }} axisLine={false} tickLine={false}
            tickFormatter={v => `${v}%`} width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
          <Area type="monotone" dataKey="drawdown" stroke="#E84040" strokeWidth={1.5}
            fill="url(#ddGrad)" dot={false}
            activeDot={{ r: 3, fill: '#E84040', strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
