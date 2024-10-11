"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRewardCondition = exports.showReward = exports.listAllRewards = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function listAllRewards() {
    return prisma_1.default.mlm_referral_reward.findMany({
        include: {
            condition: true,
            referrer: {
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
exports.listAllRewards = listAllRewards;
async function showReward(id) {
    return prisma_1.default.mlm_referral_reward.findUnique({
        where: { id },
        include: {
            condition: true,
            referrer: {
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
exports.showReward = showReward;
async function deleteRewardCondition(id) {
    return prisma_1.default.mlm_referral_reward.delete({
        where: { id },
    });
}
exports.deleteRewardCondition = deleteRewardCondition;
