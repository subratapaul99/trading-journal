import { useLocation } from 'react-router-dom'
import { useUIStore, useThemeStore } from '@/store/useStore'
import { format } from 'date-fns'

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/trades': 'Trade Log',
  '/analytics': 'Analytics',
  '/journal': 'Journal',
}

export default function Topbar() {
  const location = useLocation()
  const { openTradeForm } = useUIStore()
  const { theme, toggleTheme } = useThemeStore()
  const title = PAGE_TITLES[location.pathname] || 'TradeLog'
  const isLight = theme === 'light'

  return (
    <header
      className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)', minHeight: '60px' }}
    >
      <div>
        <h1 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Mode toggle */}
        <button
          onClick={toggleTheme}
          title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            background: 'var(--bg-hover)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}
        >
          <span style={{ fontSize: '15px' }}>{isLight ? '🌙' : '☀️'}</span>
          {isLight ? 'Dark' : 'Light'}
        </button>

        <button
          onClick={() => openTradeForm()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ background: 'var(--accent-cyan)', color: 'var(--bg-primary)' }}
        >
          + Log Trade
        </button>
      </div>
    </header>
  )
}
