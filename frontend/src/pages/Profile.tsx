import { useEffect, useState } from 'react'
import axios from 'axios'
import { ExternalLink, Copy, TrendingUp, RefreshCw } from 'lucide-react'

const EXPLORER_ACCOUNT = 'https://stellar.expert/explorer/testnet/account'

interface ProfileProps {
  pubKey: string
  balance: string
  balanceState: string
  network: string
  onFundWallet: () => void
  onRefreshBalance: () => void
}

export default function Profile({ pubKey, balance, balanceState, network, onFundWallet, onRefreshBalance }: ProfileProps) {
  const [copied, setCopied] = useState(false)
  const [treasury, setTreasury] = useState<any>(null)

  const copyAddress = () => {
    navigator.clipboard.writeText(pubKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    if (!pubKey) return
    axios.get(`/api/treasury?wallet=${pubKey}`)
      .then(res => setTreasury(res.data.data))
      .catch(console.error)
  }, [pubKey])

  if (!pubKey) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <div style={{ fontSize: '3rem' }}>🔐</div>
        <h2 style={{ color: '#f1f5f9', fontWeight: 700 }}>Connect your wallet</h2>
        <p style={{ color: '#64748b' }}>Connect Freighter to view your profile.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 24px 40px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '1.8rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '6px' }}>Profile</h1>
        <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Your wallet and earnings overview</p>
      </div>

      {/* Wallet card */}
      <div className="glass" style={{ borderRadius: '20px', padding: '32px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>Wallet Details</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="pulse-dot" style={{ width: '7px', height: '7px' }} />
            <span style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 600 }}>Connected</span>
          </div>
        </div>

        {/* Address */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Wallet Address</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <code style={{ flex: 1, color: '#e2e8f0', fontSize: '0.85rem', overflowWrap: 'anywhere', fontFamily: 'monospace' }}>{pubKey}</code>
            <button onClick={copyAddress} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.78rem', flexShrink: 0 }}>
              <Copy size={13} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <a href={`${EXPLORER_ACCOUNT}/${pubKey}`} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.78rem', flexShrink: 0, textDecoration: 'none' }}>
              <ExternalLink size={13} />
              Explorer
            </a>
          </div>
        </div>

        {/* Balance */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '16px' }}>
          <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(125,211,252,0.06)', border: '1px solid rgba(125,211,252,0.15)' }}>
            <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>XLM Balance</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#7dd3fc', fontFamily: 'Space Grotesk' }}>
              {balanceState === 'loading' ? '...' :
               balanceState === 'ready' ? `${Number(balance).toFixed(4)}` :
               balanceState === 'unfunded' ? '0.0000' : '--'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px' }}>XLM (Testnet)</div>
          </div>
          <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)' }}>
            <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Network</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#a78bfa', fontFamily: 'Space Grotesk' }}>Testnet</div>
            <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px' }}>Stellar {network}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button className="btn btn-secondary" onClick={onRefreshBalance}>
            <RefreshCw size={14} />
            Refresh Balance
          </button>
          {balanceState === 'unfunded' && (
            <button className="btn btn-primary" onClick={onFundWallet}>
              💧 Fund with Friendbot
            </button>
          )}
        </div>
      </div>

      {/* Treasury earnings */}
      {treasury && (
        <div className="glass" style={{ borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '20px' }}>Creator Earnings</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'Net Earnings', value: `${treasury.summary?.total_earnings?.toFixed(4) || '0.0000'} XLM`, color: '#4ade80' },
              { label: 'Gross Volume', value: `${treasury.summary?.gross_volume?.toFixed(4) || '0.0000'} XLM`, color: '#a78bfa' },
              { label: 'Platform Fees Paid', value: `${treasury.summary?.total_fees?.toFixed(4) || '0.0000'} XLM`, color: '#fbbf24' },
              { label: 'Transactions', value: treasury.summary?.total_transactions || 0, color: '#7dd3fc' },
            ].map(k => (
              <div key={k.label} style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>{k.label}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: k.color, fontFamily: 'Space Grotesk' }}>{k.value}</div>
              </div>
            ))}
          </div>

          {treasury.recentTransactions?.length > 0 && (
            <>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#94a3b8', marginBottom: '12px' }}>Recent Transactions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {treasury.recentTransactions.slice(0, 5).map((tx: any) => (
                  <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.82rem' }}>
                    <div>
                      <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{tx.plan_name || 'Subscription'}</span>
                      <span style={{ color: '#475569', marginLeft: '8px' }}>{new Date(tx.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#4ade80', fontWeight: 700 }}>+{tx.creator_amount?.toFixed(4)} XLM</span>
                      {tx.stellar_hash && (
                        <a href={`https://stellar.expert/explorer/testnet/tx/${tx.stellar_hash}`} target="_blank" rel="noreferrer" style={{ color: '#a78bfa' }}>
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Contract addresses */}
      <div className="glass" style={{ borderRadius: '16px', padding: '24px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '16px' }}>Smart Contract Addresses</h2>
        {[
          { name: 'Plan Contract', addr: 'CDEMO_PLAN_CONTRACT_TESTNET_ADDRESS_PLACEHOLDER' },
          { name: 'Subscription Contract', addr: 'CDEMO_SUBSCRIPTION_CONTRACT_TESTNET_ADDRESS' },
          { name: 'Treasury Contract', addr: 'CDEMO_TREASURY_CONTRACT_TESTNET_ADDRESS' },
        ].map(c => (
          <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{c.name}</span>
            <code style={{ fontSize: '0.75rem', color: '#a78bfa', fontFamily: 'monospace' }}>{c.addr.slice(0, 20)}...</code>
          </div>
        ))}
      </div>
    </div>
  )
}
