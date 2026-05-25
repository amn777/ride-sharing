import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import RideMap from '../components/RideMap'
import StatusBadge from '../components/StatusBadge'
import { rideApi } from '../services/api'
import { useRideStore } from '../context/store'

const VEHICLES = [
  { type: 'BIKE', icon: '🏍️', label: 'Bike',  fare: '₹10 + ₹7/km'  },
  { type: 'AUTO', icon: '🛺',  label: 'Auto',  fare: '₹15 + ₹10/km' },
  { type: 'CAR',  icon: '🚗',  label: 'Car',   fare: '₹20 + ₹13/km' },
  { type: 'SUV',  icon: '🚙',  label: 'SUV',   fare: '₹30 + ₹18/km' },
]

const LOCATIONS = [
  { name: 'Connaught Place', lat: 28.6315, lng: 77.2167 },
  { name: 'India Gate',      lat: 28.6129, lng: 77.2295 },
  { name: 'Hauz Khas',       lat: 28.5494, lng: 77.2001 },
  { name: 'Lajpat Nagar',    lat: 28.5665, lng: 77.2431 },
  { name: 'Saket',           lat: 28.5244, lng: 77.2090 },
  { name: 'Dwarka',          lat: 28.5921, lng: 77.0460 },
]

export default function RiderDashboard() {
  const { activeRide, setActiveRide, clearActiveRide } = useRideStore()
  const [step, setStep] = useState('book')
  const [vehicle, setVehicle] = useState('CAR')
  const [pickup, setPickup] = useState(null)
  const [drop, setDrop] = useState(null)
  const [loading, setLoading] = useState(false)

  const pollRide = useCallback(async () => {
    if (!activeRide?.id) return
    try {
      const { data } = await rideApi.getById(activeRide.id)
      const ride = data.data
      setActiveRide(ride)
      if (['COMPLETED', 'CANCELLED'].includes(ride.status)) { setStep('book'); clearActiveRide() }
      else if (['DRIVER_ASSIGNED', 'ONGOING'].includes(ride.status)) setStep('active')
    } catch {}
  }, [activeRide?.id, setActiveRide, clearActiveRide])

  useEffect(() => {
    if (step === 'searching' || step === 'active') {
      const t = setInterval(pollRide, 4000)
      return () => clearInterval(t)
    }
  }, [step, pollRide])

  const requestRide = async () => {
    if (!pickup || !drop) return toast.error('Select pickup and destination')
    setLoading(true)
    try {
      const { data } = await rideApi.request({
        pickupLat: pickup.lat, pickupLng: pickup.lng, pickupAddress: pickup.name,
        dropLat: drop.lat, dropLng: drop.lng, dropAddress: drop.name,
        vehicleType: vehicle,
      })
      setActiveRide(data.data)
      setStep('searching')
      toast.success('Ride requested! Finding driver...')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Could not request ride')
    } finally { setLoading(false) }
  }

  const cancelRide = async () => {
    if (!activeRide) return
    try {
      await rideApi.cancelRide(activeRide.id, 'Cancelled by rider')
      clearActiveRide(); setStep('book'); setPickup(null); setDrop(null)
      toast('Ride cancelled')
    } catch { toast.error('Could not cancel') }
  }

  const s = { maxWidth: 1100, margin: '0 auto', padding: '24px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={s}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-slide-up">

          {step === 'book' && (
            <div className="card">
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 20, color: 'white', marginBottom: 20 }}>Book a Ride</h2>

              <p style={{ fontSize: 11, fontFamily: 'Syne', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 10 }}>Pickup</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                {LOCATIONS.slice(0, 4).map((loc) => (
                  <button key={loc.name} onClick={() => setPickup(loc)}
                    style={{ padding: '10px 12px', borderRadius: 12, border: `1px solid ${pickup?.name === loc.name ? 'var(--brand)' : 'var(--border)'}`, background: pickup?.name === loc.name ? 'rgba(249,115,22,0.1)' : 'var(--bg-elevated)', color: pickup?.name === loc.name ? 'var(--brand)' : 'var(--muted)', fontSize: 12, cursor: 'pointer', textAlign: 'left', fontFamily: 'DM Sans' }}>
                    📍 {loc.name}
                  </button>
                ))}
              </div>

              <p style={{ fontSize: 11, fontFamily: 'Syne', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 10 }}>Destination</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                {LOCATIONS.slice(2).map((loc) => (
                  <button key={loc.name} onClick={() => setDrop(loc)}
                    style={{ padding: '10px 12px', borderRadius: 12, border: `1px solid ${drop?.name === loc.name ? '#6366f1' : 'var(--border)'}`, background: drop?.name === loc.name ? 'rgba(99,102,241,0.1)' : 'var(--bg-elevated)', color: drop?.name === loc.name ? '#6366f1' : 'var(--muted)', fontSize: 12, cursor: 'pointer', textAlign: 'left', fontFamily: 'DM Sans' }}>
                    🏁 {loc.name}
                  </button>
                ))}
              </div>

              <p style={{ fontSize: 11, fontFamily: 'Syne', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 10 }}>Vehicle</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
                {VEHICLES.map((v) => (
                  <button key={v.type} onClick={() => setVehicle(v.type)}
                    style={{ padding: '12px 8px', borderRadius: 12, border: `1px solid ${vehicle === v.type ? 'var(--brand)' : 'var(--border)'}`, background: vehicle === v.type ? 'rgba(249,115,22,0.1)' : 'var(--bg-elevated)', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{v.icon}</div>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 12, color: 'white' }}>{v.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{v.fare}</div>
                  </button>
                ))}
              </div>

              <button className="btn-primary" onClick={requestRide} disabled={loading || !pickup || !drop}>
                {loading ? 'Requesting...' : `Request ${vehicle}`}
              </button>
            </div>
          )}

          {step === 'searching' && (
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 20px' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(249,115,22,0.2)', animation: 'ping 1.5s infinite' }} />
                <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(249,115,22,0.1)', border: '2px solid var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🔍</div>
              </div>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 20, color: 'white', marginBottom: 8 }}>Finding your driver</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 16 }}>Searching nearby {vehicle.toLowerCase()}s...</p>
              <StatusBadge status="SEARCHING_DRIVER" />
              <div style={{ marginTop: 20, padding: '16px', background: 'var(--bg-elevated)', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ color: 'var(--brand)' }}>📍</span>
                  <span style={{ fontSize: 13, color: 'white' }}>{pickup?.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🏁</span>
                  <span style={{ fontSize: 13, color: 'white' }}>{drop?.name}</span>
                </div>
              </div>
              <button onClick={cancelRide} style={{ marginTop: 16, padding: '10px 24px', borderRadius: 12, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: 13 }}>
                Cancel
              </button>
            </div>
          )}

          {step === 'active' && activeRide && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: 'white' }}>Your Ride</h3>
                <StatusBadge status={activeRide.status} />
              </div>

              {activeRide.otp && (
                <div style={{ padding: '16px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 12, marginBottom: 16, textAlign: 'center' }}>
                  <p style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 4 }}>Share OTP with driver</p>
                  <p style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 32, letterSpacing: '0.3em', color: 'var(--brand)' }}>{activeRide.otp}</p>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {[
                  { icon: '📍', label: 'Pickup', val: activeRide.pickupLocation?.address, color: 'var(--brand)' },
                  { icon: '🏁', label: 'Drop',   val: activeRide.dropLocation?.address,   color: '#6366f1'     },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 12 }}>
                    <span>{item.icon}</span>
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--muted)' }}>{item.label}</p>
                      <p style={{ fontSize: 14, color: 'white', fontWeight: 500 }}>{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>

              {activeRide.estimatedFare && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>Estimated Fare</span>
                  <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 20, color: 'var(--brand)' }}>₹{activeRide.estimatedFare?.toFixed(0)}</span>
                </div>
              )}

              {!['COMPLETED', 'CANCELLED'].includes(activeRide.status) && (
                <button onClick={cancelRide} style={{ width: '100%', marginTop: 12, padding: '12px', borderRadius: 12, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: 13 }}>
                  Cancel Ride
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right - Map */}
        <div className="animate-fade-in">
          <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <RideMap pickup={pickup || activeRide?.pickupLocation} drop={drop || activeRide?.dropLocation} height={480} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
            {[
              { label: 'Vehicle',  value: vehicle           },
              { label: 'From',     value: pickup?.name || '—' },
              { label: 'To',       value: drop?.name   || '—' },
            ].map((s) => (
              <div key={s.label} className="card" style={{ padding: '12px 16px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 13, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.value}</p>
                <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
