"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveStakes = exports.getTotalStakes = exports.getActiveStakingPools = exports.getTotalStakingPools = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getTotalStakingPools() {
    return await prisma_1.default.staking_pool.count();
}
exports.getTotalStakingPools = getTotalStakingPools;
async function getActiveStakingPools() {
    return await prisma_1.default.staking_pool.count({
        where: {
            status: 'ACTIVE',
        },
    });
}
exports.getActiveStakingPools = getActiveStakingPools;
async function getTotalStakes() {
    return await prisma_1.default.staking_log.count();
}
exports.getTotalStakes = getTotalStakes;
async function getActiveStakes() {
    return await prisma_1.default.staking_log.count({
        where: {
            status: 'ACTIVE',
        },
    });
}
exports.getActiveStakes = getActiveStakes;
