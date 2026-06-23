import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../components/Navbar'

describe('Navbar', () => {
  it('renders connect wallet button when not connected', () => {
    render(
      <MemoryRouter>
        <Navbar 
          pubKey="" 
          balance="" 
          balanceState="idle" 
          onConnect={() => {}} 
          onDisconnect={() => {}} 
          connecting={false} 
        />
      </MemoryRouter>
    )
    
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
  })

  it('shows wallet address and balance when connected', () => {
    render(
      <MemoryRouter>
        <Navbar 
          pubKey="GBTEST1234567890ABCDEF" 
          balance="10.5" 
          balanceState="ready" 
          onConnect={() => {}} 
          onDisconnect={() => {}} 
          connecting={false} 
        />
      </MemoryRouter>
    )
    
    expect(screen.getByText('GBTEST...CDEF')).toBeInTheDocument()
    expect(screen.getByText('10.50 XLM')).toBeInTheDocument()
    expect(screen.getByText('Disconnect')).toBeInTheDocument()
  })
})
