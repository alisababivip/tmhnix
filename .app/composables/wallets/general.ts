import type { JSONResponse, Transaction, Wallet } from '~~/types'

export default function useWallets() {
  const apiPath = useRuntimeConfig().public.apiPath
  const activeWallet = ref<Wallet | null>(null)
  const transactions = ref<Transaction[]>([])
  const balance = ref<number | null>(null)
  const userUuid = ref<string | null>(null) // User UUID

  return {
    fetchWallet,
    activeWallet,
    transactions,
    balance,
    userUuid,
    selectWallet,
    getWallets,
    getWallet,
    createWallet,
    checkBalance,
    transferFunds,
    fetchWalletsByType,
  }

  async function fetchWallet(currency: string, type: string) {
    const response = await $fetch(apiPath + `/api/wallets/fetch`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      query: {
        currency,
        type,
      },
    })

    return response
  }

  async function fetchWalletsByType(type: string, hasTransaction?: boolean) {
    const response = await $fetch(apiPath + `/api/wallets/fetch-type`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      query: {
        type,
        transactions: hasTransaction,
      },
    })

    return response
  }

  function selectWallet(wallet: Wallet | null) {
    activeWallet.value = wallet
  }

  async function getWallets(hasTransaction?: boolean): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/wallets`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      query: {
        transactions: hasTransaction,
      },
    })

    return response
  }

  async function getWallet(uuid: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/wallets/wallet`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      query: {
        uuid: uuid,
      },
    })

    return response
  }

  async function createWallet(
    currency: Wallet,
    type: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/wallets`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        currency: currency,
        type: type,
      },
    })

    return response
  }

  async function checkBalance(wallet: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/wallets/balance`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      query: {
        uuid: wallet,
      },
    })

    balance.value = await response.json()

    return response
  }

  async function transferFunds(
    currency: string,
    type: string,
    amount: number,
    to: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/wallets/transfer`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        currency: currency,
        type: type,
        amount: amount,
        to: to,
      },
    })

    return response
  }
}
