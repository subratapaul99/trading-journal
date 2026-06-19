const COLOR_MAP = {
  amber: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B', border: 'rgba(245,158,11,0.3)' },
  blue:  { bg: 'rgba(88,130,255,0.15)', text: '#5882FF', border: 'rgba(88,130,255,0.3)' },
  green: { bg: 'rgba(0,200,150,0.15)',  text: '#00C896', border: 'rgba(0,200,150,0.3)' },
  red:   { bg: 'rgba(232,64,64,0.15)', text: '#E84040', border: 'rgba(232,64,64,0.3)' },
}

export default function MultiSelect({ options, value = [], onChange, color = 'blue' }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue

  const toggle = (opt) => {
    const next = value.includes(opt)
      ? value.filter((v) => v !== opt)
      : [...value, opt]
    onChange(next)
  }

  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {options.map((opt) => {
        const selected = value.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className="px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-100"
            style={
              selected
                ? { background: c.bg, color: c.text, border: `1px solid ${c.border}` }
                : {
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                  }
            }
          >
            {selected && <span className="mr-1">✓</span>}
            {opt}
          </button>
        )
      })}
    </div>
  )
}
