import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useStore'
import { authAPI } from '@/services/api'
import toast from 'react-hot-toast'

export const useAuth = () => {
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore()
  const navigate = useNavigate()

  const login = useCallback(async ({ email, password }) => {
    const { data } = await authAPI.login({ email, password })
    setAuth(data.user, data.token)
    navigate('/')
    toast.success(`Welcome back, ${data.user.name}!`)
  }, [])

  const register = useCallback(async ({ name, email, password }) => {
    const { data } = await authAPI.register({ name, email, password })
    setAuth(data.user, data.token)
    navigate('/')
    toast.success(`Account created! Welcome, ${data.user.name}`)
  }, [])

  const logoutUser = useCallback(() => {
    logout()
    navigate('/login')
    toast.success('Signed out')
  }, [])

  return { user, token, isAuthenticated, login, register, logout: logoutUser }
}
