import { useState, useCallback } from 'react'
import {
  getNetworkDetails,
  isConnected,
  requestAccess,
} from '@stellar/freighter-api'
import { Horizon, Networks } from '@stellar/stellar-sdk'

const HORIZON_URL = 'https://horizon-testnet.stellar.org'
const server = new Horizon.Server(HORIZON_URL)

export function useWallet() {
  const [pubKey, setPubKey] = useState('')
  const [network, setNetwork] = useState<string>('')
  const [balance, setBalance] = useState<string>('')
  const [balanceState, setBalanceState] = useState<'idle' | 'loading' | 'ready' | 'unfunded' | 'error' | 'blocked'>('idle')
  const [walletState, setWalletState] = useState<'idle' | 'connecting'>('idle')
  const [error, setError] = useState<string | null>(null)

  const isTestnet = network === 'TESTNET' || network?.includes('testnet') || network?.toLowerCase() === 'testnet'

  const fetchBalance = useCallback(async (key: string) => {
    if (!key) return
    setBalanceState('loading')
    try {
      const account = await server.loadAccount(key)
      const xlmBalance = account.balances.find((b: any) => b.asset_type === 'native')
      setBalance(xlmBalance?.balance ?? '0')
      setBalanceState('ready')
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setBalance('0')
        setBalanceState('unfunded')
        return
      }
      setBalance('')
      setBalanceState('error')
    }
  }, [])

  const connect = useCallback(async () => {
    setWalletState('connecting')
    setError(null)
    try {
      const connection = await isConnected()
      if (connection.error || !connection.isConnected) {
        throw new Error('Freighter wallet not detected. Please install Freighter extension.')
      }
      const networkDetails = await getNetworkDetails()
      if (networkDetails.error) {
        throw new Error('Could not read Freighter network details.')
      }
      const access = await requestAccess()
      if (access.error || !access.address) {
        throw new Error(access.error?.message || 'Wallet access was not approved.')
      }

      const networkName = (networkDetails as any).network || (networkDetails as any).networkPassphrase || 'TESTNET'
      setNetwork(networkName)
      setPubKey(access.address)

      const passphrase = (networkDetails as any).networkPassphrase
      if (passphrase && passphrase !== Networks.TESTNET) {
        setBalance('')
        setBalanceState('blocked')
        setError('Please switch Freighter to Stellar Testnet to use SubStellar.')
      } else {
        await fetchBalance(access.address)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet.')
    } finally {
      setWalletState('idle')
    }
  }, [fetchBalance])

  const disconnect = useCallback(() => {
    setPubKey('')
    setNetwork('')
    setBalance('')
    setBalanceState('idle')
    setError(null)
  }, [])

  const fundWallet = useCallback(async () => {
    if (!pubKey) return
    try {
      const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(pubKey)}`)
      if (!res.ok) throw new Error('Friendbot could not fund this account.')
      await fetchBalance(pubKey)
    } catch (err: any) {
      setError(err.message)
    }
  }, [pubKey, fetchBalance])

  const refreshBalance = useCallback(() => fetchBalance(pubKey), [pubKey, fetchBalance])

  return {
    pubKey,
    network,
    balance,
    balanceState,
    walletState,
    error,
    isConnected: !!pubKey,
    isTestnet,
    connect,
    disconnect,
    fundWallet,
    refreshBalance,
  }
}
