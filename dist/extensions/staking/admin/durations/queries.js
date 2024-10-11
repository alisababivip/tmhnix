"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDuration = exports.updateDuration = exports.createDuration = exports.getDuration = exports.getDurations = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
// Get all staking durations
async function getDurations() {
    return prisma_1.default.staking_duration.findMany({
        include: {
            pool: true,
        },
    });
}
exports.getDurations = getDurations;
// Get a staking duration
async function getDuration(id) {
    return prisma_1.default.staking_duration.findUnique({
        where: { id },
        include: {
            pool: true,
        },
    });
}
exports.getDuration = getDuration;
// Create a new staking duration
async function createDuration(pool_id, duration, interest_rate) {
    const existingDuration = await prisma_1.default.staking_duration.findFirst({
        where: { pool_id, duration },
    });
    if (existingDuration) {
        throw new Error('Staking duration already exists');
    }
    return prisma_1.default.staking_duration.create({
        data: {
            pool_id,
            duration,
            interest_rate,
        },
        include: {
            pool: true,
        },
    });
}
exports.createDuration = createDuration;
// Update a staking duration
async function updateDuration(id, duration, interest_rate) {
    return prisma_1.default.staking_duration.update({
        where: { id },
        data: {
            duration,
            interest_rate,
        },
        include: {
            pool: true,
        },
    });
}
exports.updateDuration = updateDuration;
// Delete a staking duration
async function deleteDuration(id) {
    await prisma_1.default.staking_duration.delete({
        where: { id },
    });
}
exports.deleteDuration = deleteDuration;
