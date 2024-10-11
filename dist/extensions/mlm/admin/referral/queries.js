"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReferralStats = exports.updateReferralStatus = exports.getReferralById = exports.getAllReferrals = exports.getNodeById = exports.getAllNodes = void 0;
const affiliate_1 = require("~~/utils/affiliate");
const prisma_1 = __importDefault(require("~~/utils/prisma"));
const utils_1 = require("../../utils");
async function getAllNodes() {
    return prisma_1.default.user
        .findMany({
        where: {
            referrals: {
                some: {
                    mlm_binary_node: {
                        isNot: null,
                    },
                },
            },
        },
        select: {
            id: true,
            first_name: true,
            last_name: true,
            uuid: true,
            avatar: true,
            referrals: {
                where: {
                    mlm_binary_node: {
                        isNot: null,
                    },
                },
                select: {
                    id: true,
                },
            },
        },
    })
        .then((users) => users.map((user) => ({
        ...user,
        binaryReferralCount: user.referrals.length,
    })));
}
exports.getAllNodes = getAllNodes;
async function getNodeById(uuid) {
    const user = await prisma_1.default.user.findUnique({
        where: { uuid },
    });
    if (!user) {
        throw new Error('User not found');
    }
    const settings = await (0, affiliate_1.getMlmSettings)();
    const mlmSettings = JSON.parse(settings['mlm_settings']);
    switch (settings['mlm_system']) {
        case 'DIRECT':
            return (0, utils_1.listDirectReferrals)(user);
        case 'BINARY':
            return (0, utils_1.listBinaryReferrals)(user, mlmSettings);
        case 'UNILEVEL':
            return (0, utils_1.listUnilevelReferrals)(user, mlmSettings);
        default:
            return (0, utils_1.listDirectReferrals)(user);
    }
}
exports.getNodeById = getNodeById;
async function getAllReferrals() {
    return prisma_1.default.mlm_referral.findMany({
        include: {
            referrer: {
                select: {
                    uuid: true,
                    first_name: true,
                    last_name: true,
                    avatar: true,
                },
            },
            referred: {
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
exports.getAllReferrals = getAllReferrals;
async function getReferralById(id) {
    return prisma_1.default.mlm_referral.findUnique({
        where: {
            id: id,
        },
        include: {
            referrer: {
                select: {
                    uuid: true,
                    first_name: true,
                    last_name: true,
                    avatar: true,
                },
            },
            referred: {
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
exports.getReferralById = getReferralById;
async function updateReferralStatus(id, status) {
    return prisma_1.default.mlm_referral.update({
        where: {
            id: id,
        },
        data: {
            status: status,
        },
    });
}
exports.updateReferralStatus = updateReferralStatus;
async function getReferralStats() {
    return prisma_1.default.mlm_referral.groupBy({
        by: ['status'],
        _count: {
            status: true,
        },
    });
}
exports.getReferralStats = getReferralStats;
