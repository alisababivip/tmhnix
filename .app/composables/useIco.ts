import useAdminIco from './ico/admin'
import useAdminIcoAllocation from './ico/admin/allocations'
import useAdminIcoContribution from './ico/admin/contributions'
import useAdminIcoPhase from './ico/admin/phases'
import useAdminIcoProject from './ico/admin/projects'
import useAdminIcoToken from './ico/admin/tokens'
import useIcoAllocation from './ico/user/allocations'
import useIcoContribution from './ico/user/contributions'
import useIcoPhase from './ico/user/phases'
import useIcoProject from './ico/user/projects'
import useIcoToken from './ico/user/tokens'

// Composable to make blog tasks easier
export default function useIco() {
  // Get all functions from individual composables
  const adminIcoAllocation = useAdminIcoAllocation()
  const adminIcoContribution = useAdminIcoContribution()
  const adminIcoPhase = useAdminIcoPhase()
  const adminIcoProject = useAdminIcoProject()
  const adminIcoToken = useAdminIcoToken()
  const adminIco = useAdminIco()
  const icoAllocation = useIcoAllocation()
  const icoContribution = useIcoContribution()
  const icoPhase = useIcoPhase()
  const icoProject = useIcoProject()
  const icoToken = useIcoToken()

  return {
    ...adminIcoAllocation,
    ...adminIcoContribution,
    ...adminIcoPhase,
    ...adminIcoProject,
    ...adminIcoToken,
    ...adminIco,
    ...icoAllocation,
    ...icoContribution,
    ...icoPhase,
    ...icoProject,
    ...icoToken,
  }
}
