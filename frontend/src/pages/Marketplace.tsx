import { useEffect, useState } from 'react'
import axios from 'axios'
import { Search, Filter } from 'lucide-react'
import { signTransaction } from '@stellar/freighter-api'
import { Asset, BASE_FEE, Networks, Operation, TransactionBuilder } from '@stellar/stellar-sdk'
import { Horizon } from '@stellar/stellar-sdk'
import PlanCard from '../components/PlanCard'
import type { Plan, Subscription } from '../types'

const server = new Horizon.Server('https://horizon-testnet.stellar.org')

interface MarketplaceProps {
  pubKey: string
}

export default function Marketplace({ pubKey }: MarketplaceProps) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [mySubs, setMySubs] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [intervalFilter, setIntervalFilter] = useState('')
  const [coupon, setCoupon] = useState<{ [planId: string]: string }>({})
  const [couponStatus, setCouponStatus] = useState<{ [planId: string]: { valid: boolean; discount: number; msg: string } }>({})
  const [modal, setModal] = useState<Plan | null>(null)
  const [txStatus, setTxStatus] = useState<{ type: string; message: string; hash?: string } | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const plansRes = await axios.get('/api/plans?is_public=1')
      setPlans(plansRes.data.data.filter((p: Plan) => p.status === 'active'))
      if (pubKey) {
        const subsRes = await axios.get(`/api/subscriptions?wallet=${pubKey}`)
        setMySubs(subsRes.data.data)
      }
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [pubKey])

  const isSubscribed = (planId: string) => mySubs.some(s => s.plan_id === planId && ['active', 'trial', 'paused'].includes(s.status))

  const validateCoupon = async (planId: string) => {
    const code = coupon[planId]?.trim()
    if (!code) return
    try {
      const res = await axios.get(`/api/coupons/validate/${code}`)
      setCouponStatus(prev => ({ ...prev, [planId]: { valid: true, discount: res.data.data.discount_percent, msg: `✅ ${res.data.data.discount_percent}% off!` } }))
    } catch {
      setCouponStatus(prev => ({ ...prev, [planId]: { valid: false, discount: 0, msg: '❌ Invalid coupon' } }))
    }
  }

  const handleSubscribe = async (plan: Plan) => {
    if (!pubKey) { alert('Please connect your wallet first.'); return }
    setSubscribing(plan.id)
    setTxStatus({ type: 'pending', message: '⏳ Building transaction...' })
    try {
      const discount = couponStatus[plan.id]?.discount || 0
      const finalPrice = plan.price * (1 - discount / 100)

      // Build Stellar payment transaction
      const sourceAccount = await server.loadAccount(pubKey)
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE, networkPassphrase: Networks.TESTNET,
      })
        .addOperation(Operation.payment({
          destination: plan.creator_wallet === 'GBDEMO1234567890DEMO1234567890DEMO1234567890DEMO12345678'
            ? pubKey // Demo: send to self for testnet
            : plan.creator_wallet,
          asset: Asset.native(),
          amount: Math.max(0.0000001, finalPrice).toFixed(7),
        }))
        .setTimeout(180)
        .build()

      setTxStatus({ type: 'pending', message: '✍️ Please sign in Freighter...' })
      const signed = await signTransaction(transaction.toXDR(), { address: pubKey, networkPassphrase: Networks.TESTNET })
      if (signed.error || !signed.signedTxXdr) throw new Error(signed.error?.message || 'Signing failed')

      setTxStatus({ type: 'pending', message: '📡 Submitting to Stellar Testnet...' })
      const signedTx = TransactionBuilder.fromXDR(signed.signedTxXdr, Networks.TESTNET)
      const result = await server.submitTransaction(signedTx)

      // Record subscription in backend
      await axios.post('/api/subscriptions', {
        user_wallet: pubKey,
        plan_id: plan.id,
        coupon_code: coupon[plan.id] || null,
        stellar_hash: result.hash,
      })

      setTxStatus({ type: 'success', message: `🎉 Subscribed to ${plan.name}!`, hash: result.hash })
      await loadData()
      setTimeout(() => { setTxStatus(null); setModal(null) }, 5000)
    } catch (err: any) {
      setTxStatus({ type: 'error', message: err.response?.data?.error || err.message || 'Subscription failed.' })
    } finally {
      setSubscribing(null)
    }
  }

  const filtered = plans.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())
    const matchTier = !tierFilter || p.tier === tierFilter
    const matchInterval = !intervalFilter || p.interval === intervalFilter
    return matchSearch && matchTier && matchInterval
  })

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 24px 40px' }}>
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '1.8rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '6px' }}>
          Subscription Marketplace
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Discover newsletters, SaaS tools, communities & more</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input className="form-input" style={{ paddingLeft: '36px' }} placeholder="Search plans..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: 'auto' }} value={tierFilter} onChange={e => setTierFilter(e.target.value)}>
          <option value="">All Tiers</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <select className="form-input" style={{ width: 'auto' }} value={intervalFilter} onChange={e => setIntervalFilter(e.target.value)}>
          <option value="">All Intervals</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Tx Status Banner */}
      {txStatus && (
        <div style={{
          padding: '14px 18px', borderRadius: '10px', marginBottom: '20px',
          background: txStatus.type === 'success' ? 'rgba(74,222,128,0.1)' : txStatus.type === 'error' ? 'rgba(248,113,113,0.1)' : 'rgba(125,211,252,0.1)',
          border: `1px solid ${txStatus.type === 'success' ? 'rgba(74,222,128,0.3)' : txStatus.type === 'error' ? 'rgba(248,113,113,0.3)' : 'rgba(125,211,252,0.3)'}`,
          color: txStatus.type === 'success' ? '#4ade80' : txStatus.type === 'error' ? '#f87171' : '#7dd3fc',
          fontSize: '0.88rem',
        }}>
          <div>{txStatus.message}</div>
          {txStatus.hash && (
            <a href={`https://stellar.expert/explorer/testnet/tx/${txStatus.hash}`} target="_blank" rel="noreferrer"
              style={{ color: '#a78bfa', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
              View on Stellar Explorer →
            </a>
          )}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
          <span className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#475569' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛒</div>
          <p>No plans found matching your filters.</p>
        </div>
      ) : (
        <div>
          {/* Coupon row */}
          {pubKey && (
            <div className="glass" style={{ borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>🎟️ Have a coupon?</span>
              <span className="badge badge-green">WELCOME20</span>
              <span className="badge badge-purple">SAVE50</span>
              <span className="badge badge-blue">FIRSTMONTH</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '20px' }}>
            {filtered.map(plan => (
              <div key={plan.id}>
                <PlanCard
                  plan={plan}
                  isSubscribed={isSubscribed(plan.id)}
                  loading={subscribing === plan.id}
                  onSubscribe={() => setModal(plan)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscribe Modal */}
      {modal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '24px',
        }} onClick={() => setModal(null)}>
          <div className="glass-strong" style={{ borderRadius: '20px', padding: '32px', maxWidth: '460px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '6px' }}>Subscribe to {modal.name}</h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '20px' }}>{modal.description}</p>

            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Price</span>
                <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{modal.price} XLM / {modal.interval}</span>
              </div>
              {modal.trial_days > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Free trial</span>
                  <span style={{ color: '#4ade80', fontWeight: 700 }}>{modal.trial_days} days</span>
                </div>
              )}
              {couponStatus[modal.id]?.valid && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>After discount</span>
                  <span style={{ color: '#4ade80', fontWeight: 700 }}>
                    {(modal.price * (1 - (couponStatus[modal.id]?.discount || 0) / 100)).toFixed(4)} XLM
                  </span>
                </div>
              )}
            </div>

            {/* Coupon input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Coupon Code (optional)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input className="form-input" style={{ flex: 1 }} placeholder="e.g. WELCOME20" value={coupon[modal.id] || ''} onChange={e => setCoupon(p => ({ ...p, [modal.id]: e.target.value }))} />
                <button className="btn btn-secondary" style={{ flexShrink: 0 }} onClick={() => validateCoupon(modal.id)}>Apply</button>
              </div>
              {couponStatus[modal.id] && (
                <div style={{ fontSize: '0.8rem', marginTop: '6px', color: couponStatus[modal.id].valid ? '#4ade80' : '#f87171' }}>
                  {couponStatus[modal.id].msg}
                </div>
              )}
            </div>

            {txStatus && (
              <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(125,211,252,0.08)', color: '#7dd3fc', fontSize: '0.82rem', marginBottom: '16px' }}>
                {txStatus.message}
                {txStatus.hash && <a href={`https://stellar.expert/explorer/testnet/tx/${txStatus.hash}`} target="_blank" rel="noreferrer" style={{ color: '#a78bfa', marginLeft: '8px' }}>View →</a>}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2 }} disabled={subscribing === modal.id} onClick={() => handleSubscribe(modal)}>
                {subscribing === modal.id ? <span className="spinner" style={{ width: '14px', height: '14px' }} /> : null}
                {subscribing === modal.id ? 'Processing...' : 'Confirm & Subscribe'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
