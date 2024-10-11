import type { DepositGateway, JSONResponse } from '~~/types'

export const useDepositGatewayStore = defineStore({
  id: 'DepositGateway',

  // State
  state: () => ({
    gateways: [] as DepositGateway[],
    loading: false,
    selectedGateway: null as DepositGateway | null,
  }),

  // Getters
  getters: {
    getGatewayById: (state) => (id: number) =>
      state.gateways.find((gateway) => gateway.id === id),
  },

  // Actions
  actions: {
    async fetchDepositGateways() {
      this.loading = true
      try {
        const { getDepositGateways } = useWallet()
        const response: JSONResponse = await getDepositGateways()
        this.gateways = response.data.result
      } catch (error) {
        console.error('Error fetching deposit gateways:', error)
      }
      this.loading = false
    },

    async selectGateway(gateway: DepositGateway) {
      this.selectedGateway = gateway
    },

    async selectGatewayById(id: number) {
      this.selectedGateway = this.gateways.find((g) => g.id === id) || null
    },

    async updateDepositGatewaysStatus(ids: number[], status: boolean) {
      try {
        const { updateDepositGatewayStatus } = useWallet()
        const response: JSONResponse = await updateDepositGatewayStatus(
          ids,
          status,
        )

        // Update the gateways in the state
        this.gateways = this.gateways.map((gateway) =>
          ids.includes(gateway.id) ? { ...gateway, status } : gateway,
        )

        return response
      } catch (error) {
        return error
      }
    },
  },
})
