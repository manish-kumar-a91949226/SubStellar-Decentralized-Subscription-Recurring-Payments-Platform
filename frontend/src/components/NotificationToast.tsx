import { X, Bell } from 'lucide-react'
import type { SocketNotification } from '../hooks/useSocket'

interface NotificationToastProps {
  notifications: SocketNotification[]
  onDismiss: (id: string) => void
}

export default function NotificationToast({ notifications, onDismiss }: NotificationToastProps) {
  if (notifications.length === 0) return null

  return (
    <div className="toast-container">
      {notifications.slice(0, 4).map(n => (
        <div key={n.id} className="toast glass-strong" style={{
          borderColor: n.type === 'success' ? 'rgba(74,222,128,0.3)'
            : n.type === 'warning' ? 'rgba(251,191,36,0.3)'
            : 'rgba(125,211,252,0.3)',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: n.type === 'success' ? 'rgba(74,222,128,0.15)'
              : n.type === 'warning' ? 'rgba(251,191,36,0.15)'
              : 'rgba(125,211,252,0.15)',
          }}>
            <Bell size={15} color={n.type === 'success' ? '#4ade80' : n.type === 'warning' ? '#fbbf24' : '#7dd3fc'} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f1f5f9', marginBottom: '2px' }}>{n.title}</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{n.message}</div>
          </div>
          <button onClick={() => onDismiss(n.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: '#64748b',
            padding: '4px', display: 'flex', alignItems: 'center',
          }}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
