import { useEffect, useState } from 'react'
import axios from 'axios'
import { Plus, X, Check } from 'lucide-react'
import PlanCard from '../components/PlanCard'
import type { Plan } from '../types'

interface PlansProps {
  pubKey: string
}

const INTERVALS = ['monthly', 'yearly']
const TIERS = ['starter', 'pro', 'enterprise']

const DEFAULT_FORM = {
  name: '', description: '', price: '', interval: 'monthly',
  trial_days: '0', tier: 'starter', benefits: [''], is_public: true,
}

export default function Plans({ pubKey }: PlansProps) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)

  const loadPlans = async () => {
    if (!pubKey) return
    setLoading(true)
    try {
      const res = await axios.get(`/api/plans?creator=${pubKey}`)
      setPlans(res.data.data)
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { loadPlans() }, [pubKey])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        creator_wallet: pubKey,
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        interval: form.interval,
        trial_days: parseInt(form.trial_days),
        tier: form.tier,
        benefits: form.benefits.filter(b => b.trim()),
        is_public: form.is_public,
      }
      if (editingPlan) {
        await axios.put(`/api/plans/${editingPlan.id}`, payload)
        setSuccess('Plan updated successfully!')
      } else {
        await axios.post('/api/plans', payload)
        setSuccess('Plan created successfully!')
      }
      setForm(DEFAULT_FORM)
      setShowForm(false)
      setEditingPlan(null)
      await loadPlans()
      setTimeout(() => setSuccess(null), 4000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save plan.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (plan: Plan) => {
    setForm({
      name: plan.name, description: plan.description, price: String(plan.price),
      interval: plan.interval, trial_days: String(plan.trial_days), tier: plan.tier,
      benefits: plan.benefits.length ? plan.benefits : [''], is_public: plan.is_public,
    })
    setEditingPlan(plan)
    setShowForm(true)
  }

  const handleDelete = async (plan: Plan) => {
    if (!confirm(`Delete plan "${plan.name}"?`)) return
    await axios.delete(`/api/plans/${plan.id}`)
    await loadPlans()
  }

  const handleTogglePause = async (plan: Plan) => {
    const status = plan.status === 'active' ? 'paused' : 'active'
    await axios.patch(`/api/plans/${plan.id}/status`, { status })
    await loadPlans()
  }

  const addBenefit = () => setForm(f => ({ ...f, benefits: [...f.benefits, ''] }))
  const updateBenefit = (i: number, val: string) => setForm(f => ({ ...f, benefits: f.benefits.map((b, idx) => idx === i ? val : b) }))
  const removeBenefit = (i: number) => setForm(f => ({ ...f, benefits: f.benefits.filter((_, idx) => idx !== i) }))

  if (!pubKey) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <div style={{ fontSize: '3rem' }}>🔐</div>
        <h2 style={{ color: '#f1f5f9', fontWeight: 700 }}>Connect your wallet</h2>
        <p style={{ color: '#64748b' }}>Connect Freighter to manage your plans.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '100px 24px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '1.8rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '6px' }}>My Plans</h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Create and manage your subscription plans</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditingPlan(null); setForm(DEFAULT_FORM) }}>
          <Plus size={16} />
          {showForm ? 'Cancel' : 'Create Plan'}
        </button>
      </div>

      {success && (
        <div style={{ padding: '14px 18px', borderRadius: '10px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Check size={16} /> {success}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="glass" style={{ borderRadius: '16px', padding: '28px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '24px' }}>
            {editingPlan ? 'Edit Plan' : 'Create New Plan'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Plan Name *</label>
                <input className="form-input" placeholder="e.g. Pro Newsletter" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Price (XLM) *</label>
                <input className="form-input" type="number" min="0.01" step="0.01" placeholder="e.g. 10" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Billing Interval</label>
                <select className="form-input" value={form.interval} onChange={e => setForm(f => ({ ...f, interval: e.target.value }))}>
                  {INTERVALS.map(i => <option key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Tier</label>
                <select className="form-input" value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}>
                  {TIERS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Free Trial Days</label>
                <select className="form-input" value={form.trial_days} onChange={e => setForm(f => ({ ...f, trial_days: e.target.value }))}>
                  {[0, 7, 14, 30].map(d => <option key={d} value={d}>{d === 0 ? 'No trial' : `${d} days`}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Visibility</label>
                <select className="form-input" value={form.is_public ? 'public' : 'private'} onChange={e => setForm(f => ({ ...f, is_public: e.target.value === 'public' }))}>
                  <option value="public">Public (Marketplace)</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Description</label>
              <textarea className="form-input" style={{ resize: 'vertical', minHeight: '80px' }} placeholder="What do subscribers get?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8' }}>Benefits</label>
                <button type="button" className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={addBenefit}>
                  <Plus size={12} /> Add
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {form.benefits.map((b, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px' }}>
                    <input className="form-input" placeholder={`Benefit ${i + 1}`} value={b} onChange={e => updateBenefit(i, e.target.value)} />
                    {form.benefits.length > 1 && (
                      <button type="button" className="btn btn-danger" style={{ padding: '8px', flexShrink: 0 }} onClick={() => removeBenefit(i)}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', marginBottom: '16px', fontSize: '0.85rem' }}>{error}</div>}

            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
              {submitting ? <span className="spinner" style={{ width: '14px', height: '14px' }} /> : null}
              {submitting ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
            </button>
          </form>
        </div>
      )}

      {/* Plans grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px', color: '#64748b' }}>
          <span className="spinner" />
        </div>
      ) : plans.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: '#475569' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
          <h3 style={{ color: '#64748b', marginBottom: '8px' }}>No plans yet</h3>
          <p>Create your first subscription plan to start accepting recurring payments.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '20px' }}>
          {plans.map(plan => (
            <PlanCard key={plan.id} plan={plan} isCreator onEdit={handleEdit} onDelete={handleDelete} onTogglePause={handleTogglePause} />
          ))}
        </div>
      )}
    </div>
  )
}
