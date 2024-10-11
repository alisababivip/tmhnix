"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    analytics: (0, utils_1.handleController)(async () => {
        try {
            const totalReferrals = await (0, queries_1.getTotalReferrals)();
            const activeReferrals = await (0, queries_1.getActiveReferrals)();
            const totalRewards = await (0, queries_1.getTotalRewards)();
            const claimedRewards = await (0, queries_1.getClaimedRewards)();
            return {
                metrics: [
                    { metric: 'Total Referrals', value: totalReferrals },
                    { metric: 'Active Referrals', value: activeReferrals },
                    { metric: 'Total Rewards', value: totalRewards },
                    { metric: 'Claimed Rewards', value: claimedRewards },
                ],
            };
        }
        catch (error) {
            throw new Error(`Failed to fetch MLM analytics data: ${error.message}`);
        }
    }),
};
