export default function useAdminMailWizardCampaigns() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getCampaigns = async () => {
    return await $fetch(`${apiPath}/api/admin/mailwizard/campaigns`, {
      credentials: 'include',
    })
  }

  const getCampaign = async (id) => {
    return await $fetch(`${apiPath}/api/admin/mailwizard/campaigns/${id}`, {
      credentials: 'include',
    })
  }

  const createCampaign = async (name, subject, speed, templeteId, targets) => {
    return await $fetch(`${apiPath}/api/admin/mailwizard/campaigns`, {
      method: 'POST',
      body: { name, subject, speed, templeteId, targets },
      credentials: 'include',
    })
  }

  const updateCampaign = async (
    id,
    name,
    subject,
    speed,
    templeteId,
    targets,
  ) => {
    return await $fetch(`${apiPath}/api/admin/mailwizard/campaigns/${id}`, {
      method: 'PUT',
      body: { name, subject, speed, templeteId, targets },
      credentials: 'include',
    })
  }

  const deleteCampaign = async (id) => {
    return await $fetch(`${apiPath}/api/admin/mailwizard/campaigns/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
  }

  const updateCampaignStatus = async (id, status) => {
    return await $fetch(
      `${apiPath}/api/admin/mailwizard/campaigns/${id}/status`,
      {
        method: 'PUT',
        body: { status },
        credentials: 'include',
      },
    )
  }

  return {
    getCampaigns,
    getCampaign,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    updateCampaignStatus,
  }
}
