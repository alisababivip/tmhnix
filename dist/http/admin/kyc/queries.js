"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateKycStatus = exports.deleteKyc = exports.getKyc = exports.getKycs = void 0;
const emails_1 = require("~~/utils/emails");
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getKycs() {
    return (await prisma_1.default.kyc.findMany({
        include: {
            template: true,
            user: true,
        },
    }));
}
exports.getKycs = getKycs;
async function getKyc(id) {
    return (await prisma_1.default.kyc.findUnique({
        where: {
            id: id,
        },
        include: {
            template: true,
            user: true,
        },
    }));
}
exports.getKyc = getKyc;
async function deleteKyc(id) {
    if (!id) {
        throw new Error('Missing id');
    }
    await prisma_1.default.kyc.delete({
        where: {
            id: id,
        },
    });
}
exports.deleteKyc = deleteKyc;
async function updateKycStatus(id, status, message) {
    const kyc = await prisma_1.default.kyc.update({
        where: {
            id: id,
        },
        data: {
            status: status,
            notes: message,
        },
        include: {
            user: true,
        },
    });
    const user = await prisma_1.default.user.findUnique({
        where: {
            id: kyc.user_id,
        },
    });
    let emailType;
    switch (status) {
        case 'APPROVED':
            emailType = 'KycApproved';
            break;
        case 'REJECTED':
            emailType = 'KycRejected';
            break;
        default:
            throw new Error(`Unknown status: ${status}`);
    }
    await (0, emails_1.sendKycEmail)(user, kyc, emailType);
    return kyc;
}
exports.updateKycStatus = updateKycStatus;
