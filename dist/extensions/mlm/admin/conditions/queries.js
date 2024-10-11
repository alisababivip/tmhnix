"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReferralConditionById = exports.updateReferralConditionStatus = exports.getReferralConditionById = exports.listReferralConditions = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
// List all referral conditions
async function listReferralConditions() {
    return prisma_1.default.mlm_referral_condition.findMany();
}
exports.listReferralConditions = listReferralConditions;
// Get a referral condition by ID
async function getReferralConditionById(id) {
    return prisma_1.default.mlm_referral_condition.findUnique({
        where: {
            id: id,
        },
    });
}
exports.getReferralConditionById = getReferralConditionById;
async function updateReferralConditionStatus(id, status) {
    return prisma_1.default.mlm_referral_condition.update({
        where: {
            id: id,
        },
        data: {
            status,
        },
    });
}
exports.updateReferralConditionStatus = updateReferralConditionStatus;
// Update a referral condition by ID
async function updateReferralConditionById(id, title, description, reward, reward_type, reward_currency) {
    return prisma_1.default.mlm_referral_condition.update({
        where: {
            id: id,
        },
        data: {
            title,
            description,
            reward,
            reward_type,
            reward_currency,
        },
    });
}
exports.updateReferralConditionById = updateReferralConditionById;
