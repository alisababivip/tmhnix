"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogById = exports.listLogs = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
// List all staking logs
async function listLogs() {
    return prisma_1.default.staking_log.findMany({
        include: {
            pool: {
                select: {
                    name: true,
                    currency: true,
                    chain: true,
                    type: true,
                    durations: true,
                },
            },
        },
    });
}
exports.listLogs = listLogs;
// Get staking log details by ID
async function getLogById(id) {
    return prisma_1.default.staking_log.findUnique({
        where: { id },
        include: {
            pool: {
                select: {
                    name: true,
                    currency: true,
                    chain: true,
                    type: true,
                    durations: true,
                },
            },
        },
    });
}
exports.getLogById = getLogById;
