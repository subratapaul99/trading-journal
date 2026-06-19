import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { formatDate, formatCurrency } from '@/utils'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  return (
    <div
      className="px-3 py-2 rounded-lg text-xs"
      style={{
        background: 'var(--bg-hover)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
      }}
    >
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>{label}</p>
      <p
        className="font-mono font-medium"
        style={{ color: val >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}
      >
        {formatCurrency(val)}
      </p>
    </div>
  )
}

// Mock data for when API isn't connected
const MOCK_DATA = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toISOString(),
  equity: 10000 + Math.round(Math.random() * 400 - 100) * (i + 1) * 0.3,
}))

export default function EquityChart({ data }) {
  const chartData = (data?.length ? data : MOCK_DATA).map((d) => ({
    ...d,
    dateLabel: formatDate(d.date, 'MMM dd'),
  }))

  const values = chartData.map((d) => d.equity)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const isProfit = chartData[chartData.length - 1]?.equity >= chartData[0]?.equity

  return (
    <div style={{ height: '200px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={isProfit ? '#00C896' : '#E84040'}
                stopOpacity={0.2}
              />
              <stop
                offset="95%"
                stopColor={isProfit ? '#00C896' : '#E84040'}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="dateLabel"
            tick={{ fill: '#8892A4', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#8892A4', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            domain={[min * 0.99, max * 1.01]}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="equity"
            stroke={isProfit ? '#00C896' : '#E84040'}
            strokeWidth={2}
            fill="url(#equityGrad)"
            dot={false}
            activeDot={{ r: 4, fill: isProfit ? '#00C896' : '#E84040', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
