import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import NotificationToast from '../components/NotificationToast'

describe('NotificationToast', () => {
  const mockNotifications = [
    {
      id: '1',
      type: 'success' as const,
      title: 'Success',
      message: 'Operation completed',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'error' as const,
      title: 'Error',
      message: 'Something went wrong',
      timestamp: new Date()
    }
  ]

  it('renders notifications correctly', () => {
    render(<NotificationToast notifications={mockNotifications} onDismiss={() => {}} />)
    
    expect(screen.getByText('Success')).toBeInTheDocument()
    expect(screen.getByText('Operation completed')).toBeInTheDocument()
    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('calls onDismiss when close button is clicked', () => {
    const handleDismiss = vi.fn()
    render(<NotificationToast notifications={[mockNotifications[0]]} onDismiss={handleDismiss} />)
    
    const closeButtons = screen.getAllByRole('button')
    fireEvent.click(closeButtons[0])
    
    expect(handleDismiss).toHaveBeenCalledWith('1')
  })

  it('renders nothing when notifications array is empty', () => {
    const { container } = render(<NotificationToast notifications={[]} onDismiss={() => {}} />)
    expect(container.firstChild).toBeNull()
  })
})
