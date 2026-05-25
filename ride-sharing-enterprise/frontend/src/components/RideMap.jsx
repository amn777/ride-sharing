import { useEffect, useRef } from 'react'

export default function RideMap({ pickup, drop, driverLocation, height = 400 }) {
  const ref = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef({})

  useEffect(() => {
    import('leaflet').then((L) => {
      if (mapRef.current || !ref.current) return
      const map = L.default.map(ref.current, {
        center: pickup ? [pickup.lat, pickup.lng] : [28.6139, 77.2090],
        zoom: 13, zoomControl: false,
      })
      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
      L.default.control.zoom({ position: 'bottomright' }).addTo(map)
      mapRef.current = { map, L: L.default }
    })
    return () => {
      if (mapRef.current) { mapRef.current.map.remove(); mapRef.current = null }
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    const { map, L } = mapRef.current

    const addMarker = (key, lat, lng, color, label) => {
      const icon = L.divIcon({
        html: `<div style="width:14px;height:14px;background:${color};border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px ${color}44"></div>`,
        className: '', iconAnchor: [7, 7],
      })
      if (markersRef.current[key]) markersRef.current[key].setLatLng([lat, lng])
      else markersRef.current[key] = L.marker([lat, lng], { icon }).addTo(map).bindPopup(label)
    }

    if (pickup) addMarker('pickup', pickup.lat, pickup.lng, '#f97316', '📍 Pickup')
    if (drop)   addMarker('drop',   drop.lat,   drop.lng,   '#6366f1', '🏁 Drop')
    if (driverLocation) addMarker('driver', driverLocation.lat, driverLocation.lng, '#10b981', '🚗 Driver')

    if (pickup && drop) {
      map.fitBounds([[pickup.lat, pickup.lng], [drop.lat, drop.lng]], { padding: [40, 40] })
    }
  }, [pickup, drop, driverLocation])

  return <div ref={ref} style={{ width: '100%', height, borderRadius: 16, overflow: 'hidden' }} />
}
