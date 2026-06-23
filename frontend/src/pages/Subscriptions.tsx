import { useEffect, useState } from 'react'
import axios from 'axios'
import { RefreshCw, ExternalLink, Play, Pause, X } from 'lucide-react'
import type { Subscription } from '../types'

interface SubscriptionsProps {
  pubKey: string
}

const EXPLORER_TX = 'https://stellar.expert/explorer/testnet/tx'

export default function Subscriptions({ pubKey }: SubscriptionsProps) {
  const [subs, setSubs] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null)

  const load = async () => {
    if (!pubKey) return
    setLoading(true)
    try {
      const res = await axios.get(`/api/subscriptions?wallet=${pubKey}`)
      setSubs(res.data.data)
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [pubKey])

  const doAction = async (id: string, action: 'pause' | 'resume' | 'cancel') => {
    setActionLoading(id + action)
    try {
      await axios.patch(`/api/subscriptions/${id}/${action}`)
      setMessage({ type: 'success', text: `Subscription ${action}d successfully.` })
      await load()
      setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || `Failed to ${action} subscription.` })
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  const getStatusColor = (s: string) => s === 'active' ? '#4ade80' : s === 'trial' ? '#7dd3fc' : s === 'paused' ? '#fbbf24' : '#f87171'
  const getStatusBg = (s: string) => s === 'active' ? 'rgba(74,222,128,0.1)' : s === 'trial' ? 'rgba(125,211,252,0.1)' : s === 'paused' ? 'rgba(251,191,36,0.1)' : 'rgba(248,113,113,0.1)'

  if (!pubKey) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <div style={{ fontSize: '3rem' }}>🔐</div>
        <h2 style={{ color: '#f1f5f9', fontWeight: 700 }}>Connect your wallet</h2>
        <p style={{ color: '#64748b' }}>Connect Freighter to view your subscriptions.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '100px 24px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '1.8rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '6px' }}>My Subscriptions</h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Manage your active subscriptions</p>
        </div>
        <button className="btn btn-secondary" onClick={load} disabled={loading}>
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.88rem',
          background: message.type === 'success' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
          border: `1px solid ${message.type === 'success' ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
          color: message.type === 'success' ? '#4ade80' : '#f87171' }}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
          <span className="spinner" />
        </div>
      ) : subs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#475569' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
          <h3 style={{ color: '#64748b', marginBottom: '8px' }}>No subscriptions yet</h3>
          <p style={{ marginBottom: '20px' }}>Browse the marketplace to find plans to subscribe to.</p>
          <a href="/marketplace" className="btn btn-primary">Browse Marketplace</a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {subs.map(sub => (
            <div key={sub.id} className="glass card-hover" style={{ borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f1f5f9' }}>{sub.plan_name}</h3>
                    <span style={{ padding: '2px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                      background: getStatusBg(sub.status), color: getStatusColor(sub.status),
                      border: `1px solid ${getStatusColor(sub.status)}40` }}>
                      {sub.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      💰 {sub.price} XLM / {sub.interval}
                    </span>
                    {sub.discount_percent > 0 && (
                      <span style={{ fontSize: '0.82rem', color: '#4ade80' }}>🎟️ {sub.discount_percent}% off ({sub.coupon_used})</span>
                    )}
                    {sub.trial_ends_at && sub.status === 'trial' && (
                      <span style={{ fontSize: '0.82rem', color: '#7dd3fc' }}>🕐 Trial ends: {formatDate(sub.trial_ends_at)}</span>
                    )}
                  </div>
                </div>
                <span className={`badge ${sub.tier === 'enterprise' ? 'badge-yellow' : sub.tier === 'pro' ? 'badge-purple' : 'badge-blue'}`}>
                  {sub.tier}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '12px', marginBottom: '20px', padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Started</div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{formatDate(sub.current_period_start)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Next Renewal</div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{sub.current_period_end ? formatDate(sub.current_period_end) : 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Creator</div>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                    {sub.creator_wallet?.slice(0, 8)}...{sub.creator_wallet?.slice(-4)}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              {['active', 'trial', 'paused'].includes(sub.status) && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {sub.status !== 'paused' ? (
                    <button className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '7px 14px' }}
                      disabled={actionLoading === sub.id + 'pause'}
                      onClick={() => doAction(sub.id, 'pause')}>
                      {actionLoading === sub.id + 'pause' ? <span className="spinner" style={{ width: '12px', height: '12px' }} /> : <Pause size={13} />}
                      Pause
                    </button>
                  ) : (
                    <button className="btn btn-success" style={{ fontSize: '0.82rem', padding: '7px 14px' }}
                      disabled={actionLoading === sub.id + 'resume'}
                      onClick={() => doAction(sub.id, 'resume')}>
                      {actionLoading === sub.id + 'resume' ? <span className="spinner" style={{ width: '12px', height: '12px' }} /> : <Play size={13} />}
                      Resume
                    </button>
                  )}
                  <button className="btn btn-danger" style={{ fontSize: '0.82rem', padding: '7px 14px' }}
                    disabled={actionLoading === sub.id + 'cancel'}
                    onClick={() => { if (confirm('Cancel this subscription?')) doAction(sub.id, 'cancel') }}>
                    {actionLoading === sub.id + 'cancel' ? <span className="spinner" style={{ width: '12px', height: '12px' }} /> : <X size={13} />}
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
