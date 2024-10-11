import type { MailWizardCampaign } from '~~/types'

export const useAdminMailWizardCampaignsStore = defineStore({
  id: 'adminMailWizardCampaigns',

  state: () => ({
    campaigns: [] as MailWizardCampaign[],
    loading: false,
    selectedCampaign: null as MailWizardCampaign | null,
  }),

  getters: {
    getCampaignById: (state) => (id: number) =>
      state.campaigns.find((campaign) => campaign.id === id),
  },

  actions: {
    async fetchCampaigns() {
      this.loading = true
      try {
        const { getCampaigns } = useMailwizard()
        const response = await getCampaigns()
        this.campaigns = response.data.result
      } catch (error) {
        console.error('Error fetching admin campaigns:', error)
      }
      this.loading = false
    },
    async addCampaign(campaign: MailWizardCampaign) {
      this.campaigns.push(campaign)
    },
    async updateCampaign(updatedCampaign: MailWizardCampaign) {
      const index = this.campaigns.findIndex(
        (campaign) => campaign.id === updatedCampaign.id,
      )
      if (index !== -1) {
        this.campaigns[index] = updatedCampaign
      }
    },
    async removeCampaign(id: number) {
      const index = this.campaigns.findIndex((campaign) => campaign.id === id)
      if (index !== -1) {
        this.campaigns.splice(index, 1)
      }
    },
    async selectCampaign(campaign: MailWizardCampaign) {
      this.selectedCampaign = campaign
    },
    async selectCampaignById(id: number) {
      this.selectedCampaign = this.getCampaignById(id)
    },
  },
})
