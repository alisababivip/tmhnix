import type { JSONResponse } from '~~/types'

export default function useMlmReferral() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getReferrals,
    getReferralTree,
    getUserAnalytics,
  }

  async function getReferrals(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/affiliate/referrals`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getReferralTree(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/affiliate/referrals/list`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getUserAnalytics(): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/affiliate/referrals/analytics`,
      {
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )
    return response
  }
}
