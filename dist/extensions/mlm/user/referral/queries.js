"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listReferrals = exports.getAnalyticsPerDay = exports.listMyReferrals = void 0;
const affiliate_1 = require("~~/utils/affiliate");
const analytics_1 = require("~~/utils/analytics");
const prisma_1 = __importDefault(require("~~/utils/prisma"));
const utils_1 = require("../../utils");
async function listMyReferrals(userId) {
    const user = await prisma_1.default.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user) {
        throw new Error('User not found');
    }
    return prisma_1.default.mlm_referral.findMany({
        where: {
            referrerUuid: user.uuid,
        },
        include: {
            referred: {
                select: {
                    uuid: true,
                    first_name: true,
                    last_name: true,
                    avatar: true,
                },
            },
        },
    });
}
exports.listMyReferrals = listMyReferrals;
async function getAnalyticsPerDay(userId) {
    const user = await prisma_1.default.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user) {
        throw new Error('User not found');
    }
    const referrerUuid = user.uuid;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    // Concurrently fetch rewards and referrals
    const [rewards, referrals] = await Promise.all([
        prisma_1.default.mlm_referral_reward.findMany({
            where: {
                created_at: {
                    gte: startDate,
                },
                referrerUuid: referrerUuid,
            },
        }),
        prisma_1.default.mlm_referral.findMany({
            where: {
                created_at: {
                    gte: startDate,
                },
                referrerUuid: referrerUuid,
            },
        }),
    ]);
    // Initialize the counts object
    const counts = {
        referrals: {},
        activeReferrals: {},
        claimedRewards: {},
        totalRewards: {},
    };
    referrals.forEach((referral) => {
        const referralDate = referral.created_at.toISOString().split('T')[0];
        counts.referrals[referralDate] = (counts.referrals[referralDate] || 0) + 1;
        if (referral.status === 'ACTIVE') {
            counts.activeReferrals[referralDate] =
                (counts.activeReferrals[referralDate] || 0) + 1;
        }
    });
    rewards.forEach((reward) => {
        const rewardDate = reward.created_at.toISOString().split('T')[0];
        counts.totalRewards[rewardDate] = (counts.totalRewards[rewardDate] || 0) + 1;
        if (reward.is_claimed) {
            counts.claimedRewards[rewardDate] =
                (counts.claimedRewards[rewardDate] || 0) + 1;
        }
    });
    // Convert counts to arrays and sort by date
    const result = {
        referrals: (0, analytics_1.convertAndSortCounts)(counts.referrals),
        activeReferrals: (0, analytics_1.convertAndSortCounts)(counts.activeReferrals),
        claimedRewards: (0, analytics_1.convertAndSortCounts)(counts.claimedRewards),
        totalRewards: (0, analytics_1.convertAndSortCounts)(counts.totalRewards),
    };
    return result;
}
exports.getAnalyticsPerDay = getAnalyticsPerDay;
async function listReferrals(userId) {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new Error('User not found');
    }
    const settings = await (0, affiliate_1.getMlmSettings)();
    const mlmSettings = JSON.parse(settings['mlm_settings']);
    switch (settings['mlm_system']) {
        case 'DIRECT':
            return (0, utils_1.listDirectReferrals)(user);
        case 'BINARY':
            return (0, utils_1.listBinaryReferrals)(user, mlmSettings);
        case 'UNILEVEL':
            return (0, utils_1.listUnilevelReferrals)(user, mlmSettings);
        default:
            return (0, utils_1.listDirectReferrals)(user);
    }
}
exports.listReferrals = listReferrals;
