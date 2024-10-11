export async function isProviderHealthy(provider: any): Promise<boolean> {
  try {
    // Simple operation to check the provider's health, like fetching the latest block number
    const blockNumber = await provider.getBlockNumber()
    return blockNumber > 0
  } catch (error) {
    return false
  }
}
