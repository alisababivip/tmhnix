import useCampaignAnalytics from './mailwizard/admin'
import useAdminBlocks from './mailwizard/admin/blocks'
import useAdminCampaigns from './mailwizard/admin/campaigns'
import useAdminTemplates from './mailwizard/admin/templates'

// Composable to make MailWizard tasks easier
export default function useMailwizard() {
  const adminCampaigns = useAdminCampaigns()
  const adminTemplates = useAdminTemplates()
  const adminBlocks = useAdminBlocks()
  const campaignAnalytics = useCampaignAnalytics()

  return {
    ...adminCampaigns,
    ...adminTemplates,
    ...adminBlocks,
    ...campaignAnalytics,
  }
}
