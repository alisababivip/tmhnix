import type { MailWizardBlock } from '~~/types'

export const useAdminMailWizardBlocksStore = defineStore({
  id: 'adminMailWizardBlocks',

  state: () => ({
    blocks: [] as MailWizardBlock[],
    loading: false,
    selectedBlock: null as MailWizardBlock | null,
  }),

  getters: {
    getBlockById: (state) => (id: number) =>
      state.blocks.find((block) => block.id === id),
  },

  actions: {
    async fetchBlocks() {
      this.loading = true
      try {
        const { getBlocks } = useMailwizard()
        const response = await getBlocks()
        this.blocks = response.data.result
      } catch (error) {
        console.error('Error fetching admin blocks:', error)
      }
      this.loading = false
    },
    async addBlock(block: MailWizardBlock) {
      this.blocks.push(block)
    },
    async updateBlock(updatedBlock: MailWizardBlock) {
      const index = this.blocks.findIndex(
        (block) => block.id === updatedBlock.id,
      )
      if (index !== -1) {
        this.blocks[index] = updatedBlock
      }
    },
    async removeBlock(id: number) {
      const index = this.blocks.findIndex((block) => block.id === id)
      if (index !== -1) {
        this.blocks.splice(index, 1)
      }
    },
    async selectBlock(block: MailWizardBlock) {
      this.selectedBlock = block
    },
    async selectBlockById(id: number) {
      this.selectedBlock = this.getBlockById(id)
    },
  },
})
