"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDurationsByPoolId = exports.getPoolDetailsById = exports.listActivePools = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
// List all active staking pools
async function listActivePools() {
    return prisma_1.default.staking_pool.findMany({
        where: { status: 'ACTIVE' },
        include: {
            durations: true, // Include the staking durations related to the pool
        },
    });
}
exports.listActivePools = listActivePools;
// Get details of a specific staking pool by ID
async function getPoolDetailsById(id) {
    return prisma_1.default.staking_pool.findUnique({
        where: { id },
        include: {
            durations: true, // Include the staking durations related to the pool
        },
    });
}
exports.getPoolDetailsById = getPoolDetailsById;
// Get staking durations for a specific pool
async function getDurationsByPoolId(poolId) {
    return prisma_1.default.staking_duration.findMany({
        where: { pool_id: poolId },
    });
}
exports.getDurationsByPoolId = getDurationsByPoolId;
