"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePool = exports.updatePool = exports.createPool = exports.getPoolById = exports.listPools = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
// List all staking pools
async function listPools() {
    return prisma_1.default.staking_pool.findMany();
}
exports.listPools = listPools;
// Get pool details by ID
async function getPoolById(id) {
    return prisma_1.default.staking_pool.findUnique({
        where: { id },
    });
}
exports.getPoolById = getPoolById;
// Create a new staking pool
async function createPool(name, currency, chain, type, min_stake, max_stake, status, description) {
    return prisma_1.default.staking_pool.create({
        data: {
            name,
            currency,
            chain,
            type,
            min_stake,
            max_stake,
            status,
            description,
        },
    });
}
exports.createPool = createPool;
// Update a staking pool
async function updatePool(id, name, currency, chain, type, min_stake, max_stake, status, description) {
    return prisma_1.default.staking_pool.update({
        where: { id },
        data: {
            name,
            currency,
            chain,
            type,
            min_stake,
            max_stake,
            status,
            description,
        },
    });
}
exports.updatePool = updatePool;
// Delete a staking pool
async function deletePool(id) {
    await prisma_1.default.staking_pool.delete({
        where: { id },
    });
}
exports.deletePool = deletePool;
