"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        try {
            const totalStakingPools = await (0, queries_1.getTotalStakingPools)();
            const activeStakingPools = await (0, queries_1.getActiveStakingPools)();
            const totalStakes = await (0, queries_1.getTotalStakes)();
            const activeStakes = await (0, queries_1.getActiveStakes)();
            return {
                metrics: [
                    { metric: 'Total Staking Pools', value: totalStakingPools },
                    { metric: 'Active Staking Pools', value: activeStakingPools },
                    { metric: 'Total Stakes', value: totalStakes },
                    { metric: 'Active Stakes', value: activeStakes },
                ],
            };
        }
        catch (error) {
            throw new Error(`Failed to fetch staking analytics data: ${error.message}`);
        }
    }),
};
