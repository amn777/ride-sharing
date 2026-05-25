const CONFIG = {
  REQUESTED:        { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  label: 'Requested',      pulse: true  },
  SEARCHING_DRIVER: { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', label: 'Finding Driver',  pulse: true  },
  DRIVER_ASSIGNED:  { color: '#f97316', bg: 'rgba(249,115,22,0.12)', label: 'Driver Assigned', pulse: false },
  DRIVER_ARRIVED:   { color: '#f97316', bg: 'rgba(249,115,22,0.12)', label: 'Driver Arrived',  pulse: false },
  ONGOING:          { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Ongoing',         pulse: true  },
  COMPLETED:        { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Completed',       pulse: false },
  CANCELLED:        { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  label: 'Cancelled',       pulse: false },
}

export default function StatusBadge({ status }) {
  const c = CONFIG[status] || { color: 'var(--muted)', bg: 'rgba(136,132,168,0.1)', label: status, pulse: false }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: c.bg, color: c.color, fontSize: 12, fontFamily: 'Syne', fontWeight: 600 }}>
      {c.pulse && <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, display: 'inline-block', animation: 'ping 1.5s infinite' }} />}
      {c.label}
    </span>
  )
}
