import { useEffect, useState } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import type { AnalyticsData } from '../types'

interface AnalyticsProps {
  pubKey: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 16px' }}>
        <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginBottom: '6px' }}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{ color: p.color, fontWeight: 700, fontSize: '0.88rem' }}>
            {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function Analytics({ pubKey }: AnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pubKey) return
    setLoading(true)
    axios.get(`/api/analytics?wallet=${pubKey}`)
      .then(res => setAnalytics(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [pubKey])

  if (!pubKey) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <div style={{ fontSize: '3rem' }}>🔐</div>
        <h2 style={{ color: '#f1f5f9', fontWeight: 700 }}>Connect your wallet</h2>
        <p style={{ color: '#64748b' }}>Connect Freighter to view analytics.</p>
      </div>
    )
  }

  // Generate mock monthly data for demo if empty
  const monthlyData = analytics?.revenue?.monthly?.length
    ? analytics.revenue.monthly.map(m => ({ ...m, month: m.month, revenue: m.revenue || 0 }))
    : Array.from({ length: 6 }, (_, i) => {
        const d = new Date(); d.setMonth(d.getMonth() - (5 - i))
        return { month: d.toISOString().slice(0, 7), revenue: Math.random() * 50, transactions: Math.floor(Math.random() * 10) }
      })

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '100px 24px 40px' }}>
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '1.8rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '6px' }}>Revenue Analytics</h1>
        <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Detailed view of your subscription revenue</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><span className="spinner" /></div>
      ) : (
        <>
          {/* KPI summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px', marginBottom: '32px' }}>
            {[
              { label: 'Total Revenue (Net)', value: `${analytics?.revenue?.total?.toFixed(4) || '0.0000'} XLM`, color: '#4ade80' },
              { label: 'Gross Volume', value: `${analytics?.revenue?.gross?.toFixed(4) || '0.0000'} XLM`, color: '#a78bfa' },
              { label: 'Active Subscribers', value: analytics?.subscribers?.active || 0, color: '#7dd3fc' },
              { label: 'Subscriber Growth', value: `${analytics?.subscribers?.growthRate || 0}%`, color: '#fbbf24' },
            ].map(k => (
              <div key={k.label} className="glass" style={{ padding: '20px', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: k.color, fontFamily: 'Space Grotesk', marginBottom: '6px' }}>{k.value}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Revenue chart */}
          <div className="glass" style={{ borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '24px' }}>Monthly Revenue (XLM)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 11 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="#a78bfa" strokeWidth={2.5} dot={{ fill: '#a78bfa', r: 4 }} name="Revenue (XLM)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Transactions chart */}
          <div className="glass" style={{ borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '24px' }}>Monthly Transactions</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 11 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="transactions" fill="#6366f1" radius={[4, 4, 0, 0]} name="Transactions" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Per-plan breakdown */}
          {analytics?.plans?.stats && analytics.plans.stats.length > 0 && (
            <div className="glass" style={{ borderRadius: '16px', padding: '24px' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '20px' }}>Revenue by Plan</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.plans.stats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="#475569" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" stroke="#475569" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#4ade80" radius={[0, 4, 4, 0]} name="Revenue (XLM)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  )
}
