import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '../services/api'
import { useAuthStore } from '../context/store'

const VEHICLES = ['BIKE', 'AUTO', 'CAR', 'SUV']

export default function RegisterPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'RIDER', vehicleType: 'CAR' })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authApi.register(form)
      login(data.data.accessToken, data.data.user)
      toast.success(`Welcome, ${data.data.user.name}!`)
      navigate(data.data.user.role === 'DRIVER' ? '/driver' : '/rider')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 420 }} className="animate-slide-up">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z"/>
              </svg>
            </div>
            <span style={{ fontFamily: 'Syne', fontWeight: 700, color: 'white' }}>RideWave</span>
          </Link>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 26, color: 'white', marginBottom: 6 }}>Create account</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Join riders and drivers across the city</p>
        </div>

        <div className="card">
          {/* Role Toggle */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-elevated)', borderRadius: 12, padding: 4, marginBottom: 20 }}>
            {['RIDER', 'DRIVER'].map((r) => (
              <button key={r} type="button" onClick={() => set('role', r)}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'Syne', fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
                  background: form.role === r ? 'var(--brand)' : 'transparent',
                  color: form.role === r ? 'white' : 'var(--muted)' }}>
                {r === 'RIDER' ? '🧑 Rider' : '🚗 Driver'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { key: 'name',     label: 'Full Name', type: 'text',     ph: 'Rahul Sharma' },
              { key: 'email',    label: 'Email',     type: 'email',    ph: 'rahul@gmail.com' },
              { key: 'phone',    label: 'Phone',     type: 'tel',      ph: '9876543210' },
              { key: 'password', label: 'Password',  type: 'password', ph: '8+ characters' },
            ].map(({ key, label, type, ph }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 11, fontFamily: 'Syne', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 6 }}>{label}</label>
                <input type={type} className="input-field" placeholder={ph}
                  value={form[key]} onChange={(e) => set(key, e.target.value)} required />
              </div>
            ))}

            {form.role === 'DRIVER' && (
              <div>
                <label style={{ display: 'block', fontSize: 11, fontFamily: 'Syne', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 8 }}>Vehicle Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {VEHICLES.map((v) => (
                    <button key={v} type="button" onClick={() => set('vehicleType', v)}
                      style={{ padding: '10px 4px', borderRadius: 10, border: `1px solid ${form.vehicleType === v ? 'var(--brand)' : 'var(--border)'}`, cursor: 'pointer', fontFamily: 'Syne', fontWeight: 600, fontSize: 12, transition: 'all 0.2s',
                        background: form.vehicleType === v ? 'rgba(249,115,22,0.12)' : 'var(--bg-elevated)',
                        color: form.vehicleType === v ? 'var(--brand)' : 'var(--muted)' }}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 6 }}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 16 }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
