import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PlanCard from '../components/PlanCard'

describe('PlanCard', () => {
  const mockPlan = {
    id: '1',
    creator_wallet: 'GBTEST...',
    name: 'Test Plan',
    description: 'A great plan',
    price: 15,
    interval: 'monthly' as const,
    trial_days: 7,
    status: 'active' as const,
    tier: 'pro' as const,
    benefits: ['Feature A', 'Feature B'],
    is_public: true,
    subscriber_count: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  it('renders plan details correctly', () => {
    render(<PlanCard plan={mockPlan} />)
    expect(screen.getByText('Test Plan')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('/ monthly')).toBeInTheDocument()
    expect(screen.getByText('Feature A')).toBeInTheDocument()
    expect(screen.getByText('Feature B')).toBeInTheDocument()
  })

  it('calls onSubscribe when Subscribe button is clicked', () => {
    const handleSubscribe = vi.fn()
    render(<PlanCard plan={mockPlan} onSubscribe={handleSubscribe} />)
    
    const button = screen.getByText('Start 7-Day Free Trial')
    fireEvent.click(button)
    
    expect(handleSubscribe).toHaveBeenCalledWith(mockPlan)
  })

  it('shows disabled state when already subscribed', () => {
    render(<PlanCard plan={mockPlan} isSubscribed={true} />)
    const button = screen.getByText('Already Subscribed')
    expect(button).toBeDisabled()
  })
})
