"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePlanStatus = exports.deletePlans = exports.deletePlan = exports.updatePlan = exports.createPlan = exports.getPlan = exports.getPlans = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getPlans() {
    return (await prisma_1.default.investment_plan.findMany({
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
async function createPlan(data) {
    return (await prisma_1.default.investment_plan.create({
        data: {
            ...data,
            status: true,
        },
    }));
}
exports.createPlan = createPlan;
async function updatePlan(id, data) {
    return (await prisma_1.default.investment_plan.update({
        where: {
            id: id,
        },
        data: data,
    }));
}
exports.updatePlan = updatePlan;
async function deletePlan(id) {
    const deleteInvestmentPlan = prisma_1.default.investment_plan.delete({
        where: {
            id: id,
        },
    });
    await prisma_1.default.$transaction([deleteInvestmentPlan]);
}
exports.deletePlan = deletePlan;
async function deletePlans(ids) {
    const deleteInvestmentPlan = prisma_1.default.investment_plan.deleteMany({
        where: {
            id: { in: ids },
        },
    });
    await prisma_1.default.$transaction([deleteInvestmentPlan]);
}
exports.deletePlans = deletePlans;
async function updatePlanStatus(ids, status) {
    await prisma_1.default.investment_plan.updateMany({
        where: {
            id: {
                in: ids,
            },
        },
        data: {
            status: status,
        },
    });
}
exports.updatePlanStatus = updatePlanStatus;
