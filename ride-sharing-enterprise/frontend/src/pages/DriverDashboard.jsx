import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import RideMap from '../components/RideMap'
import StatusBadge from '../components/StatusBadge'
import { driverApi, rideApi } from '../services/api'
import { useRideStore } from '../context/store'

export default function DriverDashboard() {
  const { activeRide, setActiveRide, clearActiveRide } = useRideStore()
  const [online, setOnline] = useState(false)
  const [location, setLocation] = useState(null)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [earnings, setEarnings] = useState({ today: 0, rides: 0 })

  useEffect(() => {
    navigator.geolocation?.watchPosition(
      (p) => setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
      ()  => setLocation({ lat: 28.6139, lng: 77.2090 })
    )
  }, [])

  useEffect(() => {
    if (!online || !location) return
    const t = setInterval(() => driverApi.updateLocation(location.lat, location.lng).catch(() => {}), 10000)
    return () => clearInterval(t)
  }, [online, location])

  const toggleOnline = async () => {
    setLoading(true)
    try {
      if (online) {
        await driverApi.goOffline()
        setOnline(false)
        toast('You are now offline')
      } else {
        await driverApi.goOnline(location?.lat || 28.6139, location?.lng || 77.2090)
        setOnline(true)
        toast.success('You are online! Ready for rides')
      }
    } catch (e) {
      toast.error(e.response?.data?.error || 'Error updating status')
    } finally { setLoading(false) }
  }

  const startRide = async () => {
    if (!activeRide || !otp) return
    try {
      const { data } = await rideApi.startRide(activeRide.id, otp)
      setActiveRide(data.data)
      toast.success('Ride started!')
    } catch (e) { toast.error(e.response?.data?.error || 'Invalid OTP') }
  }

  const completeRide = async () => {
    if (!activeRide) return
    try {
      const { data } = await rideApi.completeRide(activeRide.id, { distanceKm: 8.5, durationMinutes: 25 })
      const fare = data.data.actualFare || 0
      setEarnings((e) => ({ today: e.today + fare, rides: e.rides + 1 }))
      clearActiveRide()
      toast.success(`Ride complete! Earned ₹${fare.toFixed(0)}`)
    } catch { toast.error('Could not complete ride') }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-slide-up">

          {/* Online toggle */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 20, color: 'white', marginBottom: 4 }}>Driver Mode</h2>
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>
                  {online ? 'Visible to riders nearby' : 'Go online to accept rides'}
                </p>
              </div>
              <div style={{ position: 'relative', width: 16, height: 16 }}>
                {online && <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(16,185,129,0.4)', animation: 'ping 1.5s infinite' }} />}
                <div style={{ position: 'relative', width: 16, height: 16, borderRadius: '50%', background: online ? '#10b981' : '#4b5563' }} />
              </div>
            </div>
            <button onClick={toggleOnline} disabled={loading}
              style={{ width: '100%', padding: '14px', borderRadius: 12, border: online ? '1px solid #ef4444' : 'none', background: online ? 'rgba(239,68,68,0.1)' : 'var(--brand)', color: online ? '#ef4444' : 'white', fontFamily: 'Syne', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              {loading ? '...' : online ? '🔴 Go Offline' : '🟢 Go Online'}
            </button>
          </div>

          {/* Earnings */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: "Today's Earnings", value: `₹${earnings.today.toFixed(0)}`, color: '#10b981', icon: '💰' },
              { label: 'Rides Today',       value: earnings.rides,                   color: 'var(--brand)', icon: '🚗' },
            ].map((s) => (
              <div key={s.label} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Active ride */}
          {activeRide && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: 'white' }}>Active Ride</h3>
                <StatusBadge status={activeRide.status} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {[
                  { icon: '📍', label: 'Pickup', val: activeRide.pickupLocation?.address },
                  { icon: '🏁', label: 'Drop',   val: activeRide.dropLocation?.address   },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 12 }}>
                    <span>{item.icon}</span>
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--muted)' }}>{item.label}</p>
                      <p style={{ fontSize: 13, color: 'white' }}>{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>

              {activeRide.status === 'DRIVER_ASSIGNED' && (
                <div>
                  <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 10 }}>Enter OTP from rider to start</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="input-field" placeholder="OTP" maxLength={4} value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      style={{ textAlign: 'center', fontFamily: 'Syne', fontWeight: 800, fontSize: 20, letterSpacing: '0.3em' }} />
                    <button onClick={startRide} className="btn-primary" style={{ width: 'auto', padding: '0 24px' }}>Start</button>
                  </div>
                </div>
              )}

              {activeRide.status === 'ONGOING' && (
                <button onClick={completeRide} style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: '#10b981', color: 'white', fontFamily: 'Syne', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 8 }}>
                  ✅ Complete Ride
                </button>
              )}
            </div>
          )}

          {online && !activeRide && (
            <div className="card" style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: 'white', marginBottom: 8 }}>Waiting for rides</h3>
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>You'll be notified when a rider requests a trip</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand)', animation: `spin 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="animate-fade-in">
          <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <RideMap pickup={activeRide?.pickupLocation} drop={activeRide?.dropLocation} driverLocation={location} height={480} />
          </div>
          {location && (
            <div className="card" style={{ padding: '12px 16px', marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: online ? '#10b981' : '#4b5563', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
