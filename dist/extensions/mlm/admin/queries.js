"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClaimedRewards = exports.getTotalRewards = exports.getActiveReferrals = exports.getTotalReferrals = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
// Total number of referrals
async function getTotalReferrals() {
    return prisma_1.default.mlm_referral.count();
}
exports.getTotalReferrals = getTotalReferrals;
// Number of active referrals
async function getActiveReferrals() {
    return prisma_1.default.mlm_referral.count({
        where: {
            status: 'ACTIVE',
        },
    });
}
exports.getActiveReferrals = getActiveReferrals;
// Number of rewards given
async function getTotalRewards() {
    return prisma_1.default.mlm_referral_reward.count();
}
exports.getTotalRewards = getTotalRewards;
// Sum of all rewards
async function getClaimedRewards() {
    return prisma_1.default.mlm_referral_reward.count({
        where: {
            is_claimed: true,
        },
    });
}
exports.getClaimedRewards = getClaimedRewards;
