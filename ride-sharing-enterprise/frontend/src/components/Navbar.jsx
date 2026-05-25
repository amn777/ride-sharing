import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../context/store'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <nav className="glass sticky top-0 z-50" style={{ borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'Syne', fontWeight: 700, color: 'white', fontSize: 18 }}>RideWave</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/history" style={{ color: 'var(--muted)', fontSize: 14, textDecoration: 'none' }}>History</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: 'white' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ color: 'white', fontSize: 13, fontWeight: 500 }}>{user?.name}</p>
              <p style={{ color: 'var(--muted)', fontSize: 11 }}>{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-outline" style={{ padding: '8px 16px' }}>Logout</button>
        </div>
      </div>
    </nav>
  )
}
