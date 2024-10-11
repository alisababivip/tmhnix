export default function useAdminRewards() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getAllRewards = async () => {
    return await $fetch(`${apiPath}/api/admin/affiliate/rewards`, {
      credentials: 'include',
    })
  }

  const getRewardById = async (id: number) => {
    return await $fetch(`${apiPath}/api/admin/affiliate/rewards/${id}`, {
      credentials: 'include',
    })
  }

  const updateReward = async (id: number, rewardData: object) => {
    return await $fetch(`${apiPath}/api/admin/affiliate/rewards/${id}`, {
      method: 'PUT',
      body: rewardData,
      credentials: 'include',
    })
  }

  const deleteReward = async (id: number) => {
    return await $fetch(`${apiPath}/api/admin/affiliate/rewards/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
  }

  return {
    getAllRewards,
    getRewardById,
    updateReward,
    deleteReward,
  }
}
