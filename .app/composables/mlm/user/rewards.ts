import type { JSONResponse } from '~~/types'

export default function useMlmRewards() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getRewards,
    claimReward,
  }

  async function getRewards(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/affiliate/rewards`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function claimReward(uuid: string): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/affiliate/rewards/${uuid}/claim`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )
    return response
  }
}
