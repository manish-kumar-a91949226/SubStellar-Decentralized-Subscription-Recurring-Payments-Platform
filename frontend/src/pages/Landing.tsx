import { Link } from 'react-router-dom'
import { Zap, Shield, TrendingUp, Users, Globe, ArrowRight, Star, CheckCircle, Repeat, Pause } from 'lucide-react'

const features = [
  { icon: Repeat, title: 'Recurring Payments', desc: 'Monthly & yearly subscriptions on Stellar blockchain. Set it and forget it.' },
  { icon: Shield, title: 'Treasury Protection', desc: '2% platform fee only. Creators keep 98% — secured by smart contracts.' },
  { icon: Users, title: 'Creator Dashboard', desc: 'Real-time analytics, subscriber metrics, and revenue charts in one place.' },
  { icon: Globe, title: 'Subscription Marketplace', desc: 'Discover and subscribe to newsletters, SaaS, communities and more.' },
  { icon: Star, title: 'Free Trials & Coupons', desc: '7, 14, or 30-day trials. Promo codes like WELCOME20, SAVE50 built-in.' },
  { icon: Pause, title: 'Pause & Resume', desc: 'Subscribers can pause and resume instead of cancelling. Reduce churn.' },
]

const stats = [
  { value: '3', label: 'Smart Contracts' },
  { value: '2%', label: 'Platform Fee' },
  { value: '∞', label: 'Subscription Plans' },
  { value: '100%', label: 'On-Chain' },
]

const plans = [
  { name: 'Starter', price: 5, color: '#7dd3fc', features: ['Monthly billing', 'Basic analytics', '7-day trial'] },
  { name: 'Pro', price: 20, color: '#a78bfa', features: ['Monthly/Yearly', 'Advanced analytics', 'Coupons', 'Priority support'] },
  { name: 'Enterprise', price: 99, color: '#fbbf24', features: ['Custom billing', 'Full analytics', 'White-label', 'Dedicated support'] },
]

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <section className="animated-bg grid-overlay" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          {/* Network pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '999px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', marginBottom: '28px', fontSize: '0.82rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <div className="pulse-dot" />
            Live on Stellar Testnet
          </div>

          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(2.8rem, 8vw, 5rem)', fontWeight: 800, lineHeight: 1.05, marginBottom: '24px', color: '#f1f5f9', letterSpacing: '-0.02em' }}>
            Stripe Billing for{' '}
            <span className="gradient-text">Web3</span>
            <br />Built on Stellar
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: '#64748b', maxWidth: '620px', margin: '0 auto 40px', lineHeight: 1.7 }}>
            Create subscription plans, accept recurring payments, and manage your creator business — all powered by Stellar smart contracts.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/marketplace" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
              <Zap size={18} />
              Explore Marketplace
            </Link>
            <Link to="/plans" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
              Create a Plan
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '72px', flexWrap: 'wrap' }}>
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#f1f5f9', fontFamily: 'Space Grotesk' }}>{s.value}</div>
                <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '100px 24px', background: 'var(--color-surface)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 800, color: '#f1f5f9', marginBottom: '16px' }}>
              Everything you need to run{' '}
              <span className="gradient-text">recurring payments</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto' }}>
              Professional subscription infrastructure built on Stellar's fast, low-cost blockchain.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass card-hover" style={{ padding: '28px', borderRadius: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(99,102,241,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Icon size={22} color="#a78bfa" />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f1f5f9', marginBottom: '8px' }}>{title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing section */}
      <section style={{ padding: '100px 24px', background: 'var(--color-bg)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: 800, color: '#f1f5f9', marginBottom: '12px' }}>
              Multi-Tier <span className="gradient-text">Plan Structure</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>Creators can set up plans for any price point.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {plans.map((p, i) => (
              <div key={p.name} className="glass card-hover" style={{
                padding: '28px', borderRadius: '16px', textAlign: 'center',
                ...(i === 1 ? { borderColor: 'rgba(167,139,250,0.3)', background: 'rgba(124,58,237,0.08)' } : {}),
              }}>
                {i === 1 && <div className="badge badge-purple" style={{ marginBottom: '12px' }}>Most Popular</div>}
                <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: p.color, marginBottom: '8px' }}>{p.name}</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '4px' }}>{p.price} <span style={{ fontSize: '1rem', color: '#64748b' }}>XLM</span></div>
                <div style={{ color: '#475569', fontSize: '0.82rem', marginBottom: '20px' }}>per month</div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#94a3b8' }}>
                      <CheckCircle size={14} color="#4ade80" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(99,102,241,0.05) 100%)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: 800, color: '#f1f5f9', marginBottom: '16px' }}>
            Ready to launch your <span className="gradient-text">subscription?</span>
          </h2>
          <p style={{ color: '#64748b', marginBottom: '32px' }}>Connect your Freighter wallet and start accepting recurring payments today.</p>
          <Link to="/plans" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
            <Zap size={18} />
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', color: '#334155', fontSize: '0.82rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span>SubStellar — Built for Stellar Level 3 Competition</span>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="https://stellar.org" target="_blank" rel="noreferrer" style={{ color: '#475569', textDecoration: 'none' }}>Stellar</a>
            <a href="https://stellar.expert" target="_blank" rel="noreferrer" style={{ color: '#475569', textDecoration: 'none' }}>Explorer</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
