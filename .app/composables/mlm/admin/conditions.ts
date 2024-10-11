export default function useAdminReferralConditions() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getReferralConditions = async () => {
    return await $fetch(`${apiPath}/api/admin/affiliate/conditions`, {
      credentials: 'include',
    })
  }

  const getReferralConditionById = async (id) => {
    return await $fetch(`${apiPath}/api/admin/affiliate/conditions/${id}`, {
      credentials: 'include',
    })
  }

  const updateReferralConditionStatus = async (id, status) => {
    return await $fetch(
      `${apiPath}/api/admin/affiliate/conditions/${id}/status`,
      {
        method: 'PUT',
        body: {
          status,
        },
        credentials: 'include',
      },
    )
  }

  const updateReferralCondition = async (
    id: number,
    title: string,
    description: string,
    reward: number,
    reward_type: 'FIXED' | 'PERCENTAGE',
    reward_currency: string,
  ) => {
    return await $fetch(`${apiPath}/api/admin/affiliate/conditions/${id}`, {
      method: 'PUT',
      body: {
        title,
        description,
        reward,
        reward_type,
        reward_currency,
      },
      credentials: 'include',
    })
  }

  const deleteReferralCondition = async (id) => {
    return await $fetch(`${apiPath}/api/admin/affiliate/conditions/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
  }

  return {
    getReferralConditions,
    getReferralConditionById,
    updateReferralCondition,
    deleteReferralCondition,
    updateReferralConditionStatus,
  }
}
