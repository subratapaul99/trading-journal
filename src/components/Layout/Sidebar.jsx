import { NavLink, useNavigate } from 'react-router-dom'
import { useUIStore, useAuthStore } from '@/store/useStore'
import clsx from 'clsx'

const NAV_ITEMS = [
  { to: '/', icon: '⬡', label: 'Dashboard', exact: true },
  { to: '/trades', icon: '↕', label: 'Trades' },
  { to: '/analytics', icon: '◈', label: 'Analytics' },
  { to: '/journal', icon: '✦', label: 'Journal' },
]

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, openTradeForm } = useUIStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col transition-all duration-200 z-20"
      style={{
        width: sidebarCollapsed ? '60px' : '220px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-4 border-b"
        style={{ borderColor: 'var(--border)', minHeight: '60px' }}
      >
        <div
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{ background: 'var(--accent-cyan)', color: 'var(--bg-primary)' }}
        >
          TL
        </div>
        {!sidebarCollapsed && (
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            TradeLog
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="ml-auto text-xs transition-colors"
          style={{ color: 'var(--text-muted)' }}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Log Trade Button */}
      <div className="px-3 py-3">
        <button
          onClick={() => openTradeForm()}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150"
          style={{
            background: 'var(--accent-cyan)',
            color: 'var(--bg-primary)',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          }}
        >
          <span className="text-base leading-none">+</span>
          {!sidebarCollapsed && 'Log Trade'}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-2 py-2 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                isActive
                  ? 'text-text-primary bg-bg-hover'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              )
            }
            style={({ isActive }) => ({
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: isActive ? 'var(--bg-hover)' : 'transparent',
              justifyContent: sidebarCollapsed ? 'center' : undefined,
            })}
            title={sidebarCollapsed ? item.label : undefined}
          >
            <span className="text-base w-4 text-center flex-shrink-0">{item.icon}</span>
            {!sidebarCollapsed && item.label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div
        className="px-3 py-3 border-t"
        style={{ borderColor: 'var(--border)' }}
      >
        {!sidebarCollapsed && user && (
          <div className="flex items-center gap-2 px-2 py-1 mb-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
              style={{ background: 'var(--accent-blue)', color: '#fff' }}
            >
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {user.name}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {user.email}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all"
          style={{
            color: 'var(--text-secondary)',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          }}
          title="Sign out"
        >
          <span>⎋</span>
          {!sidebarCollapsed && 'Sign out'}
        </button>
      </div>
    </aside>
  )
}
