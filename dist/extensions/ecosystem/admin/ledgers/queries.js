"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLedgers = void 0;
const prisma_1 = __importDefault(require("../../../../utils/prisma"));
async function getLedgers() {
    try {
        const ledgers = await prisma_1.default.ecosystem_private_ledger.findMany({
            select: {
                id: true,
                wallet_id: true,
                index: true,
                currency: true,
                chain: true,
                offchain_difference: true,
                network: true,
                wallet: {
                    select: {
                        uuid: true,
                        balance: true,
                        user: {
                            select: {
                                uuid: true,
                                first_name: true,
                                last_name: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });
        return ledgers.filter((ledger) => ledger.network === process.env[`${ledger.chain}_NETWORK`]);
    }
    catch (error) {
        console.error('Error fetching ledgers:', error);
        throw new Error('Could not fetch ledgers');
    }
}
exports.getLedgers = getLedgers;
