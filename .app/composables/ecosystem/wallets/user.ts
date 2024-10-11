import type { JSONResponse } from '~~/types'

// Composable to make ecosystem-related tasks easier
export default function useEcosystemWallets() {
  const apiPath = useRuntimeConfig().public.apiPath

  return {
    getWallets,
    getWallet,
    createWallet,
    withdraw,
    transferFunds,
    getDepositAddress,
    unlockDepositAddress,
  }

  async function getWallets(
    transactions: boolean,
    addresses: boolean,
  ): Promise<JSONResponse> {
    return await $fetch(`${apiPath}/api/ecosystem/wallets`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      query: {
        transactions: transactions,
        addresses: addresses,
      },
    })
  }

  async function getWallet(currency: string): Promise<JSONResponse> {
    return await $fetch(`${apiPath}/api/ecosystem/wallets/${currency}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
  }

  async function getDepositAddress(chain: string): Promise<JSONResponse> {
    return await $fetch(`${apiPath}/api/ecosystem/wallets/${chain}/address`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
  }

  async function createWallet(currency: string): Promise<JSONResponse> {
    return await $fetch(`${apiPath}/api/ecosystem/wallets/${currency}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
  }

  async function withdraw(
    uuid: string,
    chain: string,
    amount: string,
    toAddress: string,
  ): Promise<JSONResponse> {
    return await $fetch(`${apiPath}/api/ecosystem/wallets/${uuid}/withdraw`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        chain: chain,
        amount: amount,
        toAddress: toAddress,
      },
    })
  }

  async function transferFunds(
    uuid: string,
    currency: string,
    amount: number,
  ): Promise<JSONResponse> {
    return await $fetch(`${apiPath}/api/ecosystem/wallets/${uuid}/transfer`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        currency: currency,
        amount: amount,
      },
    })
  }

  async function unlockDepositAddress(address: string): Promise<JSONResponse> {
    return await $fetch(
      `${apiPath}/api/ecosystem/wallets/${address}/unlock-deposit-address`,
      {
        method: 'get',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )
  }
}
