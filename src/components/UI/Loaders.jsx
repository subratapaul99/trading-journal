export function Spinner({ size = 20 }) {
  return (
    <div
      className="rounded-full border-2 border-t-transparent animate-spin"
      style={{
        width: size,
        height: size,
        borderColor: `var(--accent-cyan) transparent transparent transparent`,
      }}
    />
  )
}

export function LoadingCard({ rows = 4, height = 12 }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg"
          style={{
            height: `${height * 4}px`,
            background: 'var(--bg-hover)',
            width: i % 3 === 0 ? '75%' : '100%',
          }}
        />
      ))}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center" style={{ height: '60vh' }}>
      <Spinner size={28} />
    </div>
  )
}
