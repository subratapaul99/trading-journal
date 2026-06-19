import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/store/useStore'
import { authAPI } from '@/services/api'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    try {
      const res = await authAPI.login(data)
      setAuth(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    }
  }

  const inp = {
    width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '14px',
    background: '#111827', border: '1px solid #1E2A3A', color: '#E8EAF0', outline: 'none',
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0A0E1A' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3"
            style={{ background: '#00D4FF' }}>
            <span className="text-sm font-bold" style={{ color: '#0A0E1A' }}>TL</span>
          </div>
          <h1 className="text-lg font-semibold" style={{ color: '#E8EAF0' }}>Welcome back</h1>
          <p className="text-sm mt-1" style={{ color: '#8892A4' }}>Sign in to your trading journal</p>
        </div>

        <div className="rounded-2xl p-6" style={{ background: '#1C2333', border: '1px solid #1E2A3A' }}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs mb-1.5 uppercase tracking-wider" style={{ color: '#8892A4' }}>
                Email
              </label>
              <input
                type="email"
                {...register('email', { required: 'Required' })}
                style={inp}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-xs mt-1" style={{ color: '#E84040' }}>{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs mb-1.5 uppercase tracking-wider" style={{ color: '#8892A4' }}>
                Password
              </label>
              <input
                type="password"
                {...register('password', { required: 'Required' })}
                style={inp}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-xs mt-1" style={{ color: '#E84040' }}>{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-all mt-1 disabled:opacity-60"
              style={{ background: '#00D4FF', color: '#0A0E1A' }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-4" style={{ color: '#8892A4' }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#00D4FF' }}>Create one</Link>
        </p>
      </div>
    </div>
  )
}
