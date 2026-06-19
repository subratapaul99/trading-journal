import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const MOCK = [
  { range: '<-2R', count: 4, color: '#E84040' },
  { range: '-2R to -1R', count: 8, color: '#E84040' },
  { range: '-1R to 0', count: 12, color: 'rgba(232,64,64,0.5)' },
  { range: '0 to 1R', count: 10, color: 'rgba(0,200,150,0.5)' },
  { range: '1R to 2R', count: 16, color: '#00C896' },
  { range: '2R to 3R', count: 9, color: '#00C896' },
  { range: '>3R', count: 5, color: '#00D4FF' },
]

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="px-3 py-2 rounded-lg text-xs"
      style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
      <p className="font-medium">{d.range}</p>
      <p style={{ color: 'var(--text-secondary)' }}>{d.count} trades</p>
    </div>
  )
}

export default function RRDistribution({ data, loading }) {
  if (loading) return <div className="h-48 rounded-lg animate-pulse" style={{ background: 'var(--bg-secondary)' }} />

  return (
    <div style={{ height: '200px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={MOCK} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="range" tick={{ fill: '#8892A4', fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#8892A4', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {MOCK.map((entry, i) => (
              <Cell key={i} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
