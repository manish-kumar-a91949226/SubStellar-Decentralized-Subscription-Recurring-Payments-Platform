import { Link, useLocation } from 'react-router-dom'
import { Zap, LayoutDashboard, Layers, ShoppingBag, CreditCard, User, BarChart3, Wallet, LogOut, TrendingUp } from 'lucide-react'

interface NavbarProps {
  pubKey: string
  balance: string
  balanceState: string
  onConnect: () => void
  onDisconnect: () => void
  connecting: boolean
}

function shortenAddress(address: string) {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/plans', label: 'My Plans', icon: Layers },
  { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { to: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: User },
]

export default function Navbar({ pubKey, balance, balanceState, onConnect, onDisconnect, connecting }: NavbarProps) {
  const location = useLocation()

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(5, 8, 16, 0.85)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: '0 24px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '24px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(124,58,237,0.4)',
          }}>
            <Zap size={18} color="white" fill="white" />
          </div>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.15rem', color: '#fff' }}>
            Sub<span className="gradient-text">Stellar</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto' }}>
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 12px', borderRadius: '8px', textDecoration: 'none',
                  fontSize: '0.83rem', fontWeight: 500, whiteSpace: 'nowrap',
                  color: active ? '#a78bfa' : '#94a3b8',
                  background: active ? 'rgba(124,58,237,0.12)' : 'transparent',
                  border: active ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={14} />
                <span className="hidden md:inline">{label}</span>
              </Link>
            )
          })}
        </div>

        {/* Wallet section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {pubKey ? (
            <>
              {/* Balance badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 12px', borderRadius: '8px',
                background: 'rgba(125,211,252,0.08)',
                border: '1px solid rgba(125,211,252,0.2)',
              }}>
                <TrendingUp size={13} color="#7dd3fc" />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#7dd3fc' }}>
                  {balanceState === 'ready' ? `${Number(balance).toFixed(2)} XLM` :
                   balanceState === 'loading' ? '...' : '-- XLM'}
                </span>
              </div>

              {/* Wallet address */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 12px', borderRadius: '8px',
                background: 'rgba(74,222,128,0.08)',
                border: '1px solid rgba(74,222,128,0.2)',
              }}>
                <div className="pulse-dot" style={{ width: '6px', height: '6px' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#4ade80', fontFamily: 'monospace' }}>
                  {shortenAddress(pubKey)}
                </span>
              </div>

              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.82rem' }} onClick={onDisconnect}>
                <LogOut size={14} />
                <span>Disconnect</span>
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary"
              onClick={onConnect}
              disabled={connecting}
              style={{ padding: '8px 16px', fontSize: '0.88rem' }}
            >
              {connecting ? <span className="spinner" style={{ width: '14px', height: '14px' }} /> : <Wallet size={15} />}
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
