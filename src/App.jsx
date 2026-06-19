import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/store/useStore'
import Layout from '@/components/Layout/Layout'
import Dashboard from '@/pages/Dashboard'
import Trades from '@/pages/Trades'
import TradeDetail from '@/pages/TradeDetail'
import Analytics from '@/pages/Analytics'
import Journal from '@/pages/Journal'
import Login from '@/pages/Login'
import Register from '@/pages/Register'

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return !isAuthenticated ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1C2333',
            color: '#E8EAF0',
            border: '1px solid #1E2A3A',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#00C896', secondary: '#1C2333' } },
          error: { iconTheme: { primary: '#E84040', secondary: '#1C2333' } },
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected routes wrapped in Layout */}
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="trades" element={<Trades />} />
          <Route path="trades/:id" element={<TradeDetail />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="journal" element={<Journal />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
