"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAdminToken = exports.updateStatusBulk = exports.getNoPermitTokens = exports.getTokenDecimal = exports.updateAdminTokenIcon = exports.importEcosystemToken = exports.createEcosystemToken = exports.getEcosystemTokensByChain = exports.getEcosystemTokenById = exports.getEcosystemTokensAll = exports.getAllEcosystemTokens = void 0;
const prisma_1 = __importDefault(require("../../../../utils/prisma"));
async function getAllEcosystemTokens(filter = '', perPage = 10, page = 1) {
    const skip = (page - 1) * perPage;
    // Find the filtered result and the total count
    const [tokens, totalCount] = await prisma_1.default.$transaction([
        prisma_1.default.ecosystem_token.findMany({
            where: {
                OR: [
                    {
                        name: {
                            contains: filter,
                        },
                    },
                    {
                        currency: {
                            contains: filter.toUpperCase(),
                        },
                    },
                ],
            },
            take: perPage,
            skip: skip,
        }),
        prisma_1.default.ecosystem_token.count({
            where: {
                OR: [
                    {
                        name: {
                            contains: filter,
                        },
                    },
                    {
                        currency: {
                            contains: filter.toUpperCase(),
                        },
                    },
                ],
            },
        }),
    ]);
    // Calculate the total number of pages
    const totalPages = Math.ceil(totalCount / perPage);
    // Format the response to include pagination metadata
    const paginatedResponse = {
        data: tokens,
        pagination: {
            totalItems: totalCount,
            currentPage: page,
            pageSize: perPage,
            totalPages: totalPages,
        },
    };
    return paginatedResponse;
}
exports.getAllEcosystemTokens = getAllEcosystemTokens;
async function getEcosystemTokensAll() {
    return (await prisma_1.default.ecosystem_token.findMany());
}
exports.getEcosystemTokensAll = getEcosystemTokensAll;
// Fetch a single token by ID
async function getEcosystemTokenById(chain, currency) {
    return (await prisma_1.default.ecosystem_token.findFirst({
        where: {
            chain,
            currency,
        },
    }));
}
exports.getEcosystemTokenById = getEcosystemTokenById;
// Fetch a single token by ID
async function getEcosystemTokensByChain(chain) {
    return (await prisma_1.default.ecosystem_token.findMany({
        where: {
            chain,
            network: process.env[`${chain}_NETWORK`],
        },
    }));
}
exports.getEcosystemTokensByChain = getEcosystemTokensByChain;
// Create a new token
async function createEcosystemToken(chain, name, currency, contract, decimals, type, network) {
    return (await prisma_1.default.ecosystem_token.create({
        data: {
            chain,
            name,
            currency,
            contract,
            decimals,
            type,
            network,
            status: true,
            contractType: 'PERMIT',
        },
    }));
}
exports.createEcosystemToken = createEcosystemToken;
async function importEcosystemToken(name, currency, chain, network, type, contract, decimals, contractType) {
    return (await prisma_1.default.ecosystem_token.create({
        data: {
            name,
            currency,
            chain,
            network,
            type,
            contract,
            decimals,
            status: true,
            contractType,
        },
    }));
}
exports.importEcosystemToken = importEcosystemToken;
async function updateAdminTokenIcon(id, icon) {
    return (await prisma_1.default.ecosystem_token.update({
        where: {
            id: Number(id),
        },
        data: {
            icon,
        },
    }));
}
exports.updateAdminTokenIcon = updateAdminTokenIcon;
async function getTokenDecimal() {
    const tokens = await prisma_1.default.ecosystem_token.findMany({
        select: {
            currency: true,
            decimals: true,
        },
    });
    // Create an object to hold token:decimal pairs
    const tokenDecimals = {};
    for (const { currency, decimals } of tokens) {
        tokenDecimals[currency] = decimals;
    }
    return tokenDecimals;
}
exports.getTokenDecimal = getTokenDecimal;
async function getNoPermitTokens(chain) {
    return (await prisma_1.default.ecosystem_token.findMany({
        where: {
            chain,
            contractType: 'NO_PERMIT',
            network: process.env[`${chain}_NETWORK`],
            status: true,
        },
    }));
}
exports.getNoPermitTokens = getNoPermitTokens;
async function updateStatusBulk(ids, status) {
    await prisma_1.default.ecosystem_token.updateMany({
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
exports.updateStatusBulk = updateStatusBulk;
async function updateAdminToken(id, precision, limits, fees) {
    return (await prisma_1.default.ecosystem_token.update({
        where: {
            id: Number(id),
        },
        data: {
            precision,
            limits,
            fees,
        },
    }));
}
exports.updateAdminToken = updateAdminToken;
