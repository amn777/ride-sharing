import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import { rideApi } from '../services/api'
import { useAuthStore } from '../context/store'

export default function HistoryPage() {
  const { user } = useAuthStore()
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = user.role === 'DRIVER'
          ? await rideApi.driverRides()
          : await rideApi.myRides()
        setRides(data.data || [])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetch()
  }, [user.role])

  const completed = rides.filter((r) => r.status === 'COMPLETED')
  const totalFare  = completed.reduce((s, r) => s + (r.actualFare || r.estimatedFare || 0), 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }} className="animate-slide-up">
          <div>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 26, color: 'white', marginBottom: 4 }}>Ride History</h1>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>{rides.length} total rides</p>
          </div>
          <Link to={user.role === 'DRIVER' ? '/driver' : '/rider'} className="btn-outline">← Back</Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }} className="animate-slide-up">
          {[
            { label: 'Total',     value: rides.length },
            { label: 'Completed', value: completed.length },
            { label: user.role === 'DRIVER' ? 'Earned' : 'Spent', value: `₹${totalFare.toFixed(0)}` },
          ].map((s) => (
            <div key={s.label} className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28, color: 'white', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--bg-elevated)', borderTopColor: 'var(--brand)', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--muted)' }}>Loading...</p>
          </div>
        ) : rides.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚗</div>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: 'white', marginBottom: 8 }}>No rides yet</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>Your ride history will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {rides.map((ride, i) => (
              <div key={ride.id} className="card animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <p style={{ fontFamily: 'Syne', fontWeight: 600, color: 'white', fontSize: 14 }}>{ride.vehicleType} Ride</p>
                    <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>
                      {ride.requestedAt ? new Date(ride.requestedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </p>
                  </div>
                  <StatusBadge status={ride.status} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { dot: 'var(--brand)', text: ride.pickupLocation?.address },
                    { dot: '#6366f1',      text: ride.dropLocation?.address   },
                  ].map((item, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.dot, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: 'var(--muted)' }}>{item.text}</span>
                    </div>
                  ))}
                </div>

                {(ride.actualFare || ride.estimatedFare) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {ride.distanceKm && `${ride.distanceKm} km`}
                      {ride.durationMinutes && ` · ${ride.durationMinutes} min`}
                    </span>
                    <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: 'var(--brand)' }}>
                      ₹{(ride.actualFare || ride.estimatedFare).toFixed(0)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
