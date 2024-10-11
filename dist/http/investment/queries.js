"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkInvestments = exports.deleteInvestments = exports.deleteInvestment = exports.updateInvestment = exports.cancelInvestment = exports.createInvestment = exports.getUserInvestment = exports.getInvestment = exports.getInvestments = void 0;
const logger_1 = require("~~/logger");
const affiliate_1 = require("~~/utils/affiliate");
const emails_1 = require("../../utils/emails");
const passwords_1 = require("../../utils/passwords");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const logger = (0, logger_1.createLogger)('User Investment');
// Constants for repeated query clauses
const userSelect = {
    first_name: true,
    last_name: true,
    uuid: true,
    avatar: true,
};
const investmentInclude = {
    plan: true,
    user: { select: userSelect },
};
// Constants for Error Messages
const INVESTMENT_NOT_FOUND = 'Investment not found';
const WALLET_NOT_FOUND = 'Wallet not found';
async function findWallet(userId, currency) {
    const wallet = await prisma_1.default.wallet.findFirst({
        where: { user_id: userId, currency },
    });
    if (!wallet)
        throw new Error(WALLET_NOT_FOUND);
    return wallet;
}
async function findInvestmentByUuid(uuid) {
    const investment = await prisma_1.default.investment.findUnique({
        where: { uuid },
        include: {
            plan: true,
            wallet: true,
            user: {
                select: {
                    first_name: true,
                    last_name: true,
                    uuid: true,
                    avatar: true,
                },
            },
        },
    });
    if (!investment)
        throw new Error(INVESTMENT_NOT_FOUND);
    return investment;
}
async function getInvestments() {
    return (await prisma_1.default.investment.findMany({
        include: investmentInclude,
    }));
}
exports.getInvestments = getInvestments;
async function getInvestment(uuid) {
    return (await prisma_1.default.investment.findUnique({
        where: { uuid },
        include: investmentInclude,
    }));
}
exports.getInvestment = getInvestment;
async function getUserInvestment(userId) {
    return (await prisma_1.default.investment.findFirst({
        where: {
            user_id: userId,
            status: 'ACTIVE',
        },
        include: {
            plan: true,
            user: {
                select: {
                    first_name: true,
                    last_name: true,
                    uuid: true,
                    avatar: true,
                },
            },
        },
    }));
}
exports.getUserInvestment = getUserInvestment;
async function createInvestment(userId, planId, amount) {
    const user = (await prisma_1.default.user.findUnique({
        where: {
            id: userId,
        },
    }));
    if (!user) {
        throw new Error('User not found');
    }
    const existingInvestment = await prisma_1.default.investment.findFirst({
        where: {
            user_id: user.id,
            status: 'ACTIVE',
        },
    });
    if (existingInvestment) {
        if (existingInvestment.plan_id !== planId) {
            try {
                await cancelInvestment(userId, existingInvestment.uuid);
            }
            catch (error) {
                throw new Error('Failed to cancel existing investment');
            }
        }
        else {
            throw new Error('You already have an active investment in this plan');
        }
    }
    const investmentPlan = await prisma_1.default.investment_plan.findUnique({
        where: { id: planId },
    });
    if (!investmentPlan) {
        throw new Error('Investment plan not found');
    }
    const wallet = await findWallet(user.id, investmentPlan.currency);
    const balance = wallet.balance - amount;
    if (balance < 0) {
        throw new Error('Insufficient balance');
    }
    const walletUpdate = prisma_1.default.wallet.update({
        where: {
            id: wallet.id,
        },
        data: {
            balance: balance,
        },
    });
    const investmentCreate = prisma_1.default.investment.create({
        data: {
            uuid: (0, passwords_1.makeUuid)(),
            user_id: user.id,
            plan_id: investmentPlan.id,
            wallet_id: wallet.id,
            amount: amount,
            roi: investmentPlan.roi,
            duration: investmentPlan.duration,
            status: 'ACTIVE',
        },
    });
    // First, update wallet and create investment
    const [updatedWallet, newInvestment] = await prisma_1.default.$transaction([
        walletUpdate,
        investmentCreate,
    ]);
    // Now, create transaction with reference_id set to new investment's ID
    const transactionCreate = prisma_1.default.transaction.create({
        data: {
            uuid: (0, passwords_1.makeUuid)(),
            user_id: user.id,
            wallet_id: wallet.id,
            amount: amount,
            description: `Investment in ${investmentPlan.name} plan for ${investmentPlan.duration} days`,
            status: 'COMPLETED',
            fee: 0,
            type: 'INVESTMENT',
            reference_id: newInvestment.uuid, // Use the ID of the newly created investment
        },
    });
    await prisma_1.default.$transaction([transactionCreate]);
    const investment = await prisma_1.default.investment.findFirst({
        where: {
            user_id: user.id,
            status: 'ACTIVE',
        },
        include: {
            plan: true,
            user: {
                select: {
                    first_name: true,
                    last_name: true,
                    uuid: true,
                    avatar: true,
                },
            },
        },
    });
    await (0, emails_1.sendInvestmentEmail)(user, investment, 'NewInvestmentCreated');
    return investment;
}
exports.createInvestment = createInvestment;
async function cancelInvestment(userId, investmentUuid) {
    const user = (await prisma_1.default.user.findUnique({
        where: {
            id: userId,
        },
    }));
    if (!user) {
        throw new Error('User not found');
    }
    const investment = await findInvestmentByUuid(investmentUuid);
    const wallet = await findWallet(user.id, investment.plan.currency);
    // Check if the transaction exists
    const existingTransaction = await prisma_1.default.transaction.findFirst({
        where: { reference_id: investment.uuid },
    });
    await prisma_1.default.$transaction(async (prisma) => {
        await prisma.wallet.update({
            where: { id: wallet.id },
            data: { balance: wallet.balance + investment.amount },
        });
        await prisma.investment.delete({
            where: { id: investment.id },
        });
        if (existingTransaction) {
            await prisma.transaction.delete({
                where: { reference_id: investment.uuid },
            });
        }
    });
    await (0, emails_1.sendInvestmentEmail)(user, investment, 'InvestmentCanceled');
}
exports.cancelInvestment = cancelInvestment;
async function updateInvestment(id, data) {
    const updatedInvestment = await prisma_1.default.investment.update({
        where: {
            id: id,
        },
        data: data.investment,
    });
    // Fetch the user associated with the updated investment
    const user = (await prisma_1.default.user.findUnique({
        where: {
            id: updatedInvestment.user_id,
        },
    }));
    // Now, you have the user and can send the email
    await (0, emails_1.sendInvestmentEmail)(user, updatedInvestment, 'InvestmentUpdated');
    return updatedInvestment;
}
exports.updateInvestment = updateInvestment;
async function deleteInvestment(id) {
    const deleteInvestment = prisma_1.default.investment.delete({
        where: {
            id: id,
        },
    });
    await prisma_1.default.$transaction([deleteInvestment]);
}
exports.deleteInvestment = deleteInvestment;
async function deleteInvestments(ids) {
    const deleteInvestment = prisma_1.default.investment.deleteMany({
        where: {
            id: { in: ids },
        },
    });
    await prisma_1.default.$transaction([deleteInvestment]);
}
exports.deleteInvestments = deleteInvestments;
async function checkInvestments() {
    const investments = await prisma_1.default.investment.findMany({
        where: {
            status: 'ACTIVE',
        },
        include: {
            plan: true,
        },
    });
    for (const investment of investments) {
        const endDate = new Date(investment.created_at.getTime() +
            investment.duration * 24 * 60 * 60 * 1000);
        const currentDate = new Date();
        if (currentDate.getTime() < endDate.getTime()) {
            continue;
        }
        const wallet = await prisma_1.default.wallet.findFirst({
            where: {
                id: investment.wallet_id,
            },
        });
        if (!wallet) {
            throw new Error('Wallet not found');
        }
        const roi = investment.amount + investment.amount * (investment.roi / 100);
        const balance = wallet.balance + roi;
        await prisma_1.default.$transaction([
            prisma_1.default.wallet.update({
                where: {
                    id: wallet.id,
                },
                data: {
                    balance: balance,
                },
            }),
            prisma_1.default.transaction.create({
                data: {
                    uuid: (0, passwords_1.makeUuid)(),
                    user_id: investment.user_id,
                    wallet_id: wallet.id,
                    amount: roi,
                    reference_id: (0, passwords_1.makeUuid)(),
                    description: `Investment ROI: Plan "${investment.plan.title}" | Duration: ${investment.plan.duration} days`,
                    status: 'COMPLETED',
                    fee: 0,
                    type: 'INVESTMENT_ROI',
                },
            }),
            prisma_1.default.investment.update({
                where: {
                    id: investment.id,
                },
                data: {
                    status: 'COMPLETED',
                },
            }),
        ]);
        const user = (await prisma_1.default.user.findUnique({
            where: {
                id: investment.user_id,
            },
        }));
        try {
            await (0, affiliate_1.processRewards)(user.uuid, investment.amount, 'INVESTMENT', wallet?.currency);
        }
        catch (error) {
            logger.error(`Error processing rewards: ${error.message}`);
        }
    }
}
exports.checkInvestments = checkInvestments;
