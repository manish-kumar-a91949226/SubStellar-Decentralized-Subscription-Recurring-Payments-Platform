export interface Plan {
  id: string
  creator_wallet: string
  name: string
  description: string
  price: number
  interval: 'monthly' | 'yearly'
  trial_days: number
  status: 'active' | 'paused' | 'deleted'
  tier: 'starter' | 'pro' | 'enterprise'
  benefits: string[]
  is_public: boolean
  subscriber_count: number
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_wallet: string
  plan_id: string
  plan_name: string
  price: number
  interval: string
  tier: string
  creator_wallet: string
  benefits: string[]
  status: 'active' | 'trial' | 'paused' | 'cancelled'
  trial_ends_at: string | null
  current_period_start: string
  current_period_end: string
  cancelled_at: string | null
  paused_at: string | null
  coupon_used: string | null
  discount_percent: number
  created_at: string
}

export interface Transaction {
  id: string
  subscription_id: string
  user_wallet: string
  creator_wallet: string
  amount: number
  platform_fee: number
  creator_amount: number
  stellar_hash: string | null
  status: string
  type: string
  created_at: string
  plan_name?: string
}

export interface AnalyticsData {
  revenue: {
    total: number
    gross: number
    monthly: Array<{ month: string; revenue: number; transactions: number }>
  }
  subscribers: {
    active: number
    cancelled: number
    total: number
    growthRate: number
  }
  plans: {
    total: number
    stats: Array<{
      id: string
      name: string
      price: number
      interval: string
      tier: string
      total_subs: number
      active_subs: number
      revenue: number
    }>
  }
}

export interface WalletState {
  pubKey: string
  network: string
  balance: string
  isConnected: boolean
  isTestnet: boolean
}
