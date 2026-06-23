import { useEffect, useState } from 'react'
import axios from 'axios'
import { TrendingUp, Users, DollarSign, Layers, RefreshCw, ExternalLink } from 'lucide-react'
import type { AnalyticsData, Subscription } from '../types'

const EXPLORER_TX = 'https://stellar.expert/explorer/testnet/tx'

interface DashboardProps {
  pubKey: string
}

function StatCard({ label, value, icon: Icon, color, sub }: any) {
  return (
    <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', fontFamily: 'Space Grotesk' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>{sub}</div>}
    </div>
  )
}

export default function Dashboard({ pubKey }: DashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [subs, setSubs] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!pubKey) return
    setLoading(true)
    try {
      const [analyticsRes, subsRes] = await Promise.all([
        axios.get(`/api/analytics?wallet=${pubKey}`),
        axios.get(`/api/subscriptions/creator?wallet=${pubKey}`),
      ])
      setAnalytics(analyticsRes.data.data)
      setSubs(subsRes.data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [pubKey])

  if (!pubKey) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <div style={{ fontSize: '3rem' }}>🔐</div>
        <h2 style={{ color: '#f1f5f9', fontWeight: 700 }}>Connect your wallet</h2>
        <p style={{ color: '#64748b' }}>Connect your Freighter wallet to view your dashboard.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '100px 24px 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px' }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '1.8rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '6px' }}>
            Creator Dashboard
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Your subscription business at a glance</p>
        </div>
        <button className="btn btn-secondary" onClick={load} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px', color: '#64748b' }}>
          <span className="spinner" />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '16px', marginBottom: '32px' }}>
            <StatCard label="Total Revenue" value={`${analytics?.revenue?.total?.toFixed(2) || '0.00'} XLM`} icon={DollarSign} color="#4ade80" sub="After 2% platform fee" />
            <StatCard label="Active Subscribers" value={analytics?.subscribers?.active || 0} icon={Users} color="#a78bfa" sub={`${analytics?.subscribers?.cancelled || 0} cancelled`} />
            <StatCard label="Growth Rate" value={`${analytics?.subscribers?.growthRate || 0}%`} icon={TrendingUp} color="#7dd3fc" sub="vs last month" />
            <StatCard label="Total Plans" value={analytics?.plans?.total || 0} icon={Layers} color="#fbbf24" sub="Active plans" />
          </div>

          {/* Recent subscribers */}
          <div className="glass" style={{ borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '20px' }}>Recent Subscribers</h2>
            {subs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>
                No subscribers yet. Create a plan and share it!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {subs.slice(0, 8).map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#94a3b8' }}>
                        {s.user_wallet?.slice(0, 10)}...{s.user_wallet?.slice(-6)}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#475569' }}>{s.plan_name} · {s.interval}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#4ade80' }}>{s.price} XLM</span>
                      <span className={`badge ${s.status === 'active' ? 'badge-green' : s.status === 'trial' ? 'badge-blue' : s.status === 'paused' ? 'badge-yellow' : 'badge-red'}`}>
                        {s.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Plan performance */}
          {analytics?.plans?.stats && analytics.plans.stats.length > 0 && (
            <div className="glass" style={{ borderRadius: '16px', padding: '24px' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '20px' }}>Plan Performance</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      {['Plan', 'Tier', 'Price', 'Active Subs', 'Revenue'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.plans.stats.map(plan => (
                      <tr key={plan.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '12px', color: '#f1f5f9', fontWeight: 600 }}>{plan.name}</td>
                        <td style={{ padding: '12px' }}><span className={`badge ${plan.tier === 'enterprise' ? 'badge-yellow' : plan.tier === 'pro' ? 'badge-purple' : 'badge-blue'}`}>{plan.tier}</span></td>
                        <td style={{ padding: '12px', color: '#94a3b8' }}>{plan.price} XLM/{plan.interval}</td>
                        <td style={{ padding: '12px', color: '#a78bfa', fontWeight: 700 }}>{plan.active_subs}</td>
                        <td style={{ padding: '12px', color: '#4ade80', fontWeight: 700 }}>{plan.revenue?.toFixed(2)} XLM</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
