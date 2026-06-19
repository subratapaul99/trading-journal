import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts'

const MOCK = [
  { day: 'Mon', winRate: 68, trades: 14 },
  { day: 'Tue', winRate: 72, trades: 18 },
  { day: 'Wed', winRate: 55, trades: 16 },
  { day: 'Thu', winRate: 48, trades: 12 },
  { day: 'Fri', winRate: 38, trades: 8 },
]

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="px-3 py-2 rounded-lg text-xs"
      style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
      <p className="font-medium mb-1">{d.day}</p>
      <p style={{ color: d.winRate >= 50 ? 'var(--accent-green)' : 'var(--accent-red)' }}>Win rate: {d.winRate}%</p>
      <p style={{ color: 'var(--text-secondary)' }}>Trades: {d.trades}</p>
    </div>
  )
}

export default function WinRateByDay({ data, loading }) {
  const chartData = data?.length ? data : MOCK

  if (loading) return <div className="h-48 rounded-lg animate-pulse" style={{ background: 'var(--bg-secondary)' }} />

  return (
    <div style={{ height: '200px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: '#8892A4', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: '#8892A4', fontSize: 11 }} axisLine={false} tickLine={false}
            tickFormatter={v => `${v}%`} domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <ReferenceLine y={50} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
          <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.winRate >= 50 ? '#00C896' : '#E84040'} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
