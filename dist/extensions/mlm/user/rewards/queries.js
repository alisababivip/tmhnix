"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimReward = exports.listMyRewards = void 0;
const passwords_1 = require("~~/utils/passwords");
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function listMyRewards(userId) {
    const user = await prisma_1.default.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user) {
        throw new Error('User not found');
    }
    return (await prisma_1.default.mlm_referral_reward.findMany({
        where: {
            referrerUuid: user.uuid,
        },
        include: {
            condition: true,
        },
    }));
}
exports.listMyRewards = listMyRewards;
async function claimReward(userId, rewardId) {
    const reward = await prisma_1.default.mlm_referral_reward.findUnique({
        where: {
            id: rewardId,
        },
        include: {
            condition: true,
        },
    });
    if (reward && reward.is_claimed) {
        throw new Error('Reward already claimed');
    }
    const wallet = await prisma_1.default.wallet.findUnique({
        where: {
            wallet_user_id_currency_type_unique: {
                user_id: userId,
                currency: reward.condition.reward_currency,
                type: reward.condition.reward_wallet_type,
            },
        },
    });
    if (!wallet) {
        throw new Error('Wallet not found');
    }
    const balance = wallet.balance + reward.reward;
    const updatedReward = await prisma_1.default.$transaction([
        prisma_1.default.mlm_referral_reward.update({
            where: {
                id: reward.id,
            },
            data: {
                is_claimed: true,
            },
        }),
        prisma_1.default.wallet.update({
            where: {
                id: wallet.id,
            },
            data: {
                balance: balance,
            },
        }),
        prisma_1.default.transaction.create({
            data: {
                uuid: (0, passwords_1.makeUuid)(),
                user_id: userId,
                wallet_id: wallet.id,
                type: 'REFERRAL_REWARD',
                status: 'COMPLETED',
                amount: reward.reward,
                description: `Reward for ${reward.condition.type}`,
                metadata: {
                    reward_id: reward.id,
                },
            },
        }),
    ]);
    return updatedReward[0];
}
exports.claimReward = claimReward;
