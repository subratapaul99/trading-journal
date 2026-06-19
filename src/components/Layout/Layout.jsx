import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import TradeFormModal from '@/components/TradeForm/TradeFormModal'
import { useUIStore } from '@/store/useStore'

export default function Layout() {
  const { sidebarCollapsed, isTradeFormOpen } = useUIStore()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar />

      <div
        className="flex flex-col flex-1 min-w-0 transition-all duration-200"
        style={{ marginLeft: sidebarCollapsed ? '60px' : '220px' }}
      >
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {isTradeFormOpen && <TradeFormModal />}
    </div>
  )
}
