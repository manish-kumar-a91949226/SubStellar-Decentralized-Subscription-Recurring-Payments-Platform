import { Check, Star, Zap, Crown } from 'lucide-react'
import type { Plan } from '../types'

interface PlanCardProps {
  plan: Plan
  onSubscribe?: (plan: Plan) => void
  onEdit?: (plan: Plan) => void
  onDelete?: (plan: Plan) => void
  onTogglePause?: (plan: Plan) => void
  isCreator?: boolean
  isSubscribed?: boolean
  loading?: boolean
}

const tierConfig = {
  starter: { icon: Star, color: '#7dd3fc', bg: 'rgba(125,211,252,0.1)', border: 'rgba(125,211,252,0.2)', label: 'Starter' },
  pro: { icon: Zap, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)', label: 'Pro' },
  enterprise: { icon: Crown, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)', label: 'Enterprise' },
}

export default function PlanCard({ plan, onSubscribe, onEdit, onDelete, onTogglePause, isCreator, isSubscribed, loading }: PlanCardProps) {
  const tier = tierConfig[plan.tier] || tierConfig.starter
  const TierIcon = tier.icon

  return (
    <div className="glass card-hover" style={{
      borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Tier glow */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: '120px', height: '120px',
        background: `radial-gradient(circle, ${tier.bg} 0%, transparent 70%)`,
        borderRadius: '0 16px 0 0',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '3px 10px', borderRadius: '999px',
              background: tier.bg, border: `1px solid ${tier.border}`,
              fontSize: '0.72rem', fontWeight: 700, color: tier.color, textTransform: 'uppercase',
            }}>
              <TierIcon size={11} />
              {tier.label}
            </div>
            {plan.trial_days > 0 && (
              <div className="badge badge-green">{plan.trial_days}d trial</div>
            )}
            {isSubscribed && (
              <div className="badge badge-purple">Subscribed</div>
            )}
          </div>
          <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f1f5f9', marginBottom: '4px' }}>{plan.name}</h3>
          <p style={{ fontSize: '0.83rem', color: '#64748b', lineHeight: 1.5 }}>{plan.description}</p>
        </div>

        {/* Status badge */}
        {plan.status !== 'active' && (
          <span className={`badge ${plan.status === 'paused' ? 'badge-yellow' : 'badge-red'}`}>
            {plan.status}
          </span>
        )}
      </div>

      {/* Price */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9' }}>
          {plan.price}
        </span>
        <span style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b' }}>XLM</span>
        <span style={{ fontSize: '0.82rem', color: '#475569' }}>/ {plan.interval}</span>
      </div>

      {/* Benefits */}
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {(plan.benefits || []).map((benefit, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#94a3b8' }}>
            <div style={{
              width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
              background: 'rgba(74,222,128,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Check size={10} color="#4ade80" />
            </div>
            {benefit}
          </li>
        ))}
      </ul>

      {/* Subscriber count */}
      <div style={{ fontSize: '0.78rem', color: '#475569' }}>
        {plan.subscriber_count} subscriber{plan.subscriber_count !== 1 ? 's' : ''}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
        {isCreator ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" style={{ flex: 1, fontSize: '0.82rem' }} onClick={() => onEdit?.(plan)}>
              Edit
            </button>
            <button
              className={`btn ${plan.status === 'active' ? 'btn-secondary' : 'btn-success'}`}
              style={{ flex: 1, fontSize: '0.82rem' }}
              onClick={() => onTogglePause?.(plan)}
            >
              {plan.status === 'active' ? 'Pause' : 'Activate'}
            </button>
            <button className="btn btn-danger" style={{ flex: 1, fontSize: '0.82rem' }} onClick={() => onDelete?.(plan)}>
              Delete
            </button>
          </div>
        ) : (
          <button
            className="btn btn-primary"
            disabled={isSubscribed || loading || plan.status !== 'active'}
            onClick={() => onSubscribe?.(plan)}
            style={{ width: '100%' }}
          >
            {loading ? <span className="spinner" style={{ width: '14px', height: '14px' }} /> : null}
            {isSubscribed ? 'Already Subscribed' : plan.status !== 'active' ? 'Plan Unavailable' : plan.trial_days > 0 ? `Start ${plan.trial_days}-Day Free Trial` : 'Subscribe Now'}
          </button>
        )}
      </div>
    </div>
  )
}
