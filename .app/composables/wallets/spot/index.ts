import type { JSONResponse } from '~~/types'

export default function useSpotWallet() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getSpotWallet,
    createSpotWallet,
    verifySpotDepositTransaction,
    cancelSpotDepositTransaction,
    createSpotDepositTransaction,
    getSpotTransaction,
    createSpotWithdrawTransaction,
  }

  async function getSpotWallet(currency: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/wallets/spot/${currency}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return await response
  }

  async function createSpotWallet(currency: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/wallets/spot/${currency}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return await response
  }

  async function getSpotTransaction(trx: string): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/wallets/spot/transactions/${trx}`,
      {
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )
    return await response
  }

  async function createSpotDepositTransaction(
    wallet_id: string,
    trx: string,
    chain: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/wallets/spot/deposit', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        wallet_id: wallet_id,
        trx: trx,
        chain: chain,
      },
    })
    return await response
  }

  async function createSpotWithdrawTransaction(
    currency: string,
    chain: string,
    amount: number,
    address: string,
    memo?: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/wallets/spot/withdraw', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        currency: currency,
        chain: chain,
        amount: amount,
        address: address,
        memo: memo,
      },
    })
    return await response
  }

  async function verifySpotDepositTransaction(
    trx: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/wallets/spot/deposit/verify/${trx}`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )
    return await response
  }

  async function cancelSpotDepositTransaction(
    trx: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/wallets/spot/deposit/cancel/${trx}`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )
    return await response
  }
}
