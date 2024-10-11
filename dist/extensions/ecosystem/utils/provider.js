"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProviderHealthy = void 0;
async function isProviderHealthy(provider) {
    try {
        // Simple operation to check the provider's health, like fetching the latest block number
        const blockNumber = await provider.getBlockNumber();
        return blockNumber > 0;
    }
    catch (error) {
        return false;
    }
}
exports.isProviderHealthy = isProviderHealthy;
