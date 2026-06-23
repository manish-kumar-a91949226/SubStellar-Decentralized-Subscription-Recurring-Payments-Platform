import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export interface SocketNotification {
  id: string
  type: 'success' | 'info' | 'warning'
  title: string
  message: string
  timestamp: Date
}

export function useSocket(walletAddress?: string) {
  const socketRef = useRef<Socket | null>(null)
  const [notifications, setNotifications] = useState<SocketNotification[]>([])
  const [isConnected, setIsConnected] = useState(false)

  const addNotification = (n: Omit<SocketNotification, 'id' | 'timestamp'>) => {
    setNotifications(prev => [
      { ...n, id: Math.random().toString(36).slice(2), timestamp: new Date() },
      ...prev.slice(0, 9),
    ])
  }

  useEffect(() => {
    const socket = io(BACKEND_URL, { transports: ['websocket', 'polling'] })
    socketRef.current = socket

    socket.on('connect', () => {
      setIsConnected(true)
      if (walletAddress) socket.emit('join-wallet', walletAddress)
    })

    socket.on('disconnect', () => setIsConnected(false))

    socket.on('subscription:started', ({ plan }: any) => {
      addNotification({ type: 'success', title: '🎉 Subscription Active!', message: `You subscribed to ${plan?.name}` })
    })

    socket.on('subscription:renewed', () => {
      addNotification({ type: 'success', title: '🔄 Subscription Renewed', message: 'Your subscription has been renewed successfully.' })
    })

    socket.on('subscription:cancelled', () => {
      addNotification({ type: 'warning', title: '❌ Subscription Cancelled', message: 'Your subscription has been cancelled.' })
    })

    socket.on('subscription:paused', () => {
      addNotification({ type: 'info', title: '⏸️ Subscription Paused', message: 'Your subscription is now paused.' })
    })

    socket.on('subscription:resumed', () => {
      addNotification({ type: 'success', title: '▶️ Subscription Resumed', message: 'Your subscription is now active again.' })
    })

    socket.on('subscription:new_subscriber', ({ plan }: any) => {
      addNotification({ type: 'success', title: '🎊 New Subscriber!', message: `Someone subscribed to your plan: ${plan?.name}` })
    })

    socket.on('plan:created', ({ name }: any) => {
      addNotification({ type: 'info', title: '📋 New Plan', message: `New plan available: ${name}` })
    })

    socket.on('treasury:fee_collected', ({ amount }: any) => {
      addNotification({ type: 'success', title: '💰 Payment Received', message: `You received ${Number(amount * 0.98).toFixed(4)} XLM` })
    })

    return () => {
      socket.disconnect()
    }
  }, [walletAddress])

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return { notifications, isConnected, dismissNotification }
}
