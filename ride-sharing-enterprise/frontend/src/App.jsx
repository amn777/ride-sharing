import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './context/store'
import LoginPage      from './pages/LoginPage'
import RegisterPage   from './pages/RegisterPage'
import RiderDashboard from './pages/RiderDashboard'
import DriverDashboard from './pages/DriverDashboard'
import HistoryPage    from './pages/HistoryPage'

function Guard({ children, role }) {
  const { user, token } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (role && user?.role !== role) return <Navigate to="/" replace />
  return children
}

function Home() {
  const { user, token } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  return <Navigate to={user?.role === 'DRIVER' ? '/driver' : '/rider'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1a1a26', color: '#f1f0ff',
          border: '1px solid rgba(255,255,255,0.07)',
          fontFamily: 'DM Sans, sans-serif',
        }
      }} />
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/rider"    element={<Guard role="RIDER"><RiderDashboard /></Guard>} />
        <Route path="/driver"   element={<Guard role="DRIVER"><DriverDashboard /></Guard>} />
        <Route path="/history"  element={<Guard><HistoryPage /></Guard>} />
      </Routes>
    </BrowserRouter>
  )
}
