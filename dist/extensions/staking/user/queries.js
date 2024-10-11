"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.releaseStake = exports.processStakingLogs = exports.getStakeById = exports.listUserStakes = exports.withdrawStake = exports.stakeTokens = void 0;
const affiliate_1 = require("~~/utils/affiliate");
const logger_1 = require("../../../logger");
const emails_1 = require("../../../utils/emails");
const passwords_1 = require("../../../utils/passwords");
const prisma_1 = __importDefault(require("../../../utils/prisma"));
const logger = (0, logger_1.createLogger)('Staking');
// Stake tokens
async function stakeTokens(userId, poolId, amount, durationId) {
    const pool = await prisma_1.default.staking_pool.findUnique({
        where: { id: poolId },
    });
    if (!pool)
        throw new Error('Staking pool not found');
    const wallet = await prisma_1.default.wallet.findFirst({
        where: {
            user_id: userId,
            currency: pool.currency,
            type: pool.type,
        },
    });
    if (!wallet)
        throw new Error('Wallet not found');
    const duration = await prisma_1.default.staking_duration.findUnique({
        where: { id: durationId },
    });
    if (!duration)
        throw new Error('Staking duration not found');
    // Calculate new balance and release date
    const balance = wallet.balance - amount;
    if (balance < 0) {
        throw new Error('Insufficient balance');
    }
    const releaseDate = new Date();
    releaseDate.setDate(releaseDate.getDate() + duration.duration);
    // Start transaction
    return (await prisma_1.default.$transaction(async (prisma) => {
        // Update wallet balance
        await prisma.wallet.update({
            where: { id: wallet.id },
            data: { balance },
        });
        // Create staking log entry
        const newStake = await prisma.staking_log.create({
            data: {
                uuid: (0, passwords_1.makeUuid)(),
                user_id: userId,
                pool_id: poolId,
                amount,
                stake_date: new Date(),
                release_date: releaseDate,
                status: 'ACTIVE',
            },
        });
        // Calculate reward
        const reward = (amount * duration.duration * duration.interest_rate) / 100;
        // Create transaction
        await prisma.transaction.create({
            data: {
                uuid: (0, passwords_1.makeUuid)(),
                user_id: userId,
                wallet_id: wallet.id,
                amount,
                description: `Staked ${amount} ${pool.currency} for ${duration.duration} days at ${duration.interest_rate}% interest`,
                status: 'COMPLETED',
                fee: 0,
                type: 'STAKING',
                reference_id: newStake.uuid,
                metadata: {
                    pool_id: poolId,
                    duration_id: durationId,
                    reward: reward.toString(),
                },
            },
        });
        // Send email notification (if applicable)
        try {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user) {
                await (0, emails_1.sendStakingInitiationEmail)(user, newStake, pool, reward.toString());
            }
        }
        catch (error) {
            console.error('Error sending staking initiation email:', error);
        }
        return newStake;
    }));
}
exports.stakeTokens = stakeTokens;
async function withdrawStake(userId, stakeId) {
    return prisma_1.default.$transaction(async (prisma) => {
        try {
            // Update the staking log status to WITHDRAWN
            const existingStake = await prisma.staking_log.findFirst({
                where: { id: stakeId, user_id: userId },
                include: {
                    pool: true,
                },
            });
            if (!existingStake)
                throw new Error('Stake not found');
            if (existingStake.status === 'WITHDRAWN')
                throw new Error('Stake already collected');
            const stake = (await prisma.staking_log.update({
                where: { id: stakeId, user_id: userId },
                data: {
                    status: 'WITHDRAWN',
                },
                include: {
                    pool: true,
                },
            }));
            const transaction = (await prisma.transaction.findFirst({
                where: {
                    reference_id: stake.uuid,
                },
            }));
            const reward = parseFloat(transaction?.metadata?.reward || '0');
            const amount = stake.amount + reward;
            // Create a transaction record for the withdrawal
            await prisma.transaction.create({
                data: {
                    uuid: (0, passwords_1.makeUuid)(),
                    user_id: userId,
                    wallet_id: transaction.wallet_id,
                    amount: amount,
                    description: `Collected ${amount} ${stake.pool.currency} from staking`,
                    status: 'COMPLETED',
                    fee: 0,
                    type: 'STAKING_REWARD',
                    metadata: {
                        pool_id: stake.pool_id,
                        duration_id: transaction.metadata.duration_id,
                    },
                },
            });
            // Retrieve the wallet and calculate the new balance
            const wallet = await prisma.wallet.findUnique({
                where: {
                    id: transaction.wallet_id,
                },
            });
            if (!wallet)
                throw new Error('Wallet not found');
            // Update the wallet balance
            await prisma.wallet.update({
                where: {
                    id: transaction.wallet_id,
                },
                data: {
                    balance: wallet.balance + amount,
                },
            });
            // Return the updated staking log
            return stake;
        }
        catch (error) {
            // Handle any errors that occurred during the transaction
            console.error('Error collecting stake:', error);
            throw new Error(`Error collecting stake: ${error.message}`);
        }
    });
}
exports.withdrawStake = withdrawStake;
// List stakes for a user
async function listUserStakes(userId) {
    return prisma_1.default.staking_log.findMany({
        where: { user_id: userId },
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
exports.listUserStakes = listUserStakes;
// Get a user's staking log by ID
async function getStakeById(userId, id) {
    return prisma_1.default.staking_log.findUnique({
        where: { id, user_id: userId },
        include: {
            pool: {
                select: {
                    durations: true,
                },
            },
        },
    });
}
exports.getStakeById = getStakeById;
async function processStakingLogs() {
    // Get all staking logs where release_date has passed and status is ACTIVE
    const stakingLogsToRelease = (await prisma_1.default.staking_log.findMany({
        where: {
            release_date: {
                lt: new Date(),
            },
            status: 'ACTIVE',
        },
        include: {
            pool: {
                select: {
                    name: true,
                    currency: true,
                    chain: true,
                    type: true,
                },
            },
            user: {
                select: {
                    id: true,
                    email: true,
                    first_name: true,
                    last_name: true,
                },
            },
        },
    }));
    for (const log of stakingLogsToRelease) {
        try {
            await releaseStake(log.id);
            await (0, emails_1.sendStakingRewardEmail)(log.user, log, log.pool, log.transaction.metadata.reward);
            await (0, affiliate_1.processRewards)(log.user.uuid, log.amount, 'STAKING_LOYALTY', log.pool.currency);
        }
        catch (error) {
            logger.error(`Failed to release stake for log ${log.id}:`, error);
        }
    }
}
exports.processStakingLogs = processStakingLogs;
async function releaseStake(stakeId) {
    return prisma_1.default.staking_log.update({
        where: { id: stakeId },
        data: { status: 'RELEASED' },
    });
}
exports.releaseStake = releaseStake;
