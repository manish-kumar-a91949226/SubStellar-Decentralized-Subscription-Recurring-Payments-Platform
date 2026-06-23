import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Navbar from './components/Navbar'
import NotificationToast from './components/NotificationToast'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Plans from './pages/Plans'
import Marketplace from './pages/Marketplace'
import Subscriptions from './pages/Subscriptions'
import Analytics from './pages/Analytics'
import Profile from './pages/Profile'
import { useWallet } from './hooks/useWallet'
import { useSocket } from './hooks/useSocket'

const queryClient = new QueryClient()

function AppInner() {
  const wallet = useWallet()
  const { notifications, dismissNotification } = useSocket(wallet.pubKey || undefined)

  return (
    <>
      <Navbar
        pubKey={wallet.pubKey}
        balance={wallet.balance}
        balanceState={wallet.balanceState}
        onConnect={wallet.connect}
        onDisconnect={wallet.disconnect}
        connecting={wallet.walletState === 'connecting'}
      />

      <NotificationToast notifications={notifications} onDismiss={dismissNotification} />

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard pubKey={wallet.pubKey} />} />
        <Route path="/plans" element={<Plans pubKey={wallet.pubKey} />} />
        <Route path="/marketplace" element={<Marketplace pubKey={wallet.pubKey} />} />
        <Route path="/subscriptions" element={<Subscriptions pubKey={wallet.pubKey} />} />
        <Route path="/analytics" element={<Analytics pubKey={wallet.pubKey} />} />
        <Route path="/profile" element={
          <Profile
            pubKey={wallet.pubKey}
            balance={wallet.balance}
            balanceState={wallet.balanceState}
            network={wallet.network}
            onFundWallet={wallet.fundWallet}
            onRefreshBalance={wallet.refreshBalance}
          />
        } />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
