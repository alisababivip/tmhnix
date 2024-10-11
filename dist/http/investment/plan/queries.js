"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlan = exports.getPlans = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getPlans() {
    return (await prisma_1.default.investment_plan.findMany({
        where: {
            status: true,
        },
        include: {
            investment: true,
        },
    }));
}
exports.getPlans = getPlans;
async function getPlan(id) {
    return (await prisma_1.default.investment_plan.findUnique({
        where: {
            id: id,
        },
        include: {
            investment: true,
        },
    }));
}
exports.getPlan = getPlan;
