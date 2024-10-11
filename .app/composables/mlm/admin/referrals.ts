export default function useAdminReferrals() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getAllReferrals = async () => {
    return await $fetch(`${apiPath}/api/admin/affiliate/referral`, {
      credentials: 'include',
    })
  }

  const getReferralById = async (id: number) => {
    return await $fetch(`${apiPath}/api/admin/affiliate/referral/${id}`, {
      credentials: 'include',
    })
  }

  const getAllNodes = async () => {
    return await $fetch(`${apiPath}/api/admin/affiliate/referral/nodes`, {
      credentials: 'include',
    })
  }

  const getNodeByUserId = async (userId) => {
    return await $fetch(
      `${apiPath}/api/admin/affiliate/referral/nodes/${userId}`,
      {
        credentials: 'include',
      },
    )
  }

  const updateReferralStatus = async (id: number, status: string) => {
    return await $fetch(
      `${apiPath}/api/admin/affiliate/referral/${id}/status`,
      {
        method: 'PUT',
        body: { status },
        credentials: 'include',
      },
    )
  }

  const getReferralStats = async () => {
    return await $fetch(`${apiPath}/api/admin/affiliate/referral/stats`, {
      credentials: 'include',
    })
  }

  return {
    getAllReferrals,
    getReferralById,
    updateReferralStatus,
    getReferralStats,
    getAllNodes,
    getNodeByUserId,
  }
}
