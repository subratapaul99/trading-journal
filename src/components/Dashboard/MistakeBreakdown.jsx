const COLORS = ['#E84040', '#F59E0B', '#F59E0B', '#5882FF', '#A855F7']

const MOCK = [
  { name: 'FOMO entry', count: 18, pct: 34 },
  { name: 'No stop loss', count: 12, pct: 22 },
  { name: 'Oversized position', count: 10, pct: 18 },
  { name: 'Early exit', count: 8, pct: 14 },
  { name: 'Revenge trade', count: 6, pct: 12 },
]

export default function MistakeBreakdown({ data }) {
  const items = data?.length ? data : MOCK

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          Top mistakes
        </h2>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
        >
          This month
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <div key={item.name}>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: 'var(--text-primary)' }}>{item.name}</span>
              <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{item.pct}%</span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: 'var(--bg-secondary)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${item.pct}%`, background: COLORS[i] || '#5882FF' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
