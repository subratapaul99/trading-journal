import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/store/useStore'
import { authAPI } from '@/services/api'
import toast from 'react-hot-toast'

export default function Register() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    try {
      const res = await authAPI.register({ name: data.name, email: data.email, password: data.password })
      setAuth(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
  }

  const inp = {
    width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '14px',
    background: '#111827', border: '1px solid #1E2A3A', color: '#E8EAF0', outline: 'none',
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0A0E1A' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3"
            style={{ background: '#00D4FF' }}>
            <span className="text-sm font-bold" style={{ color: '#0A0E1A' }}>TL</span>
          </div>
          <h1 className="text-lg font-semibold" style={{ color: '#E8EAF0' }}>Create account</h1>
          <p className="text-sm mt-1" style={{ color: '#8892A4' }}>Start tracking your trades today</p>
        </div>

        <div className="rounded-2xl p-6" style={{ background: '#1C2333', border: '1px solid #1E2A3A' }}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {[
              { name: 'name', label: 'Full name', type: 'text', placeholder: 'John Doe', rules: { required: 'Required' } },
              { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', rules: { required: 'Required' } },
              { name: 'password', label: 'Password', type: 'password', placeholder: '8+ characters',
                rules: { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } } },
              { name: 'confirmPassword', label: 'Confirm password', type: 'password', placeholder: '••••••••',
                rules: { required: 'Required', validate: (v) => v === password || 'Passwords do not match' } },
            ].map(({ name, label, type, placeholder, rules }) => (
              <div key={name}>
                <label className="block text-xs mb-1.5 uppercase tracking-wider" style={{ color: '#8892A4' }}>
                  {label}
                </label>
                <input type={type} {...register(name, rules)} style={inp} placeholder={placeholder} />
                {errors[name] && (
                  <p className="text-xs mt-1" style={{ color: '#E84040' }}>{errors[name].message}</p>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-all mt-1 disabled:opacity-60"
              style={{ background: '#00D4FF', color: '#0A0E1A' }}
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-4" style={{ color: '#8892A4' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#00D4FF' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
