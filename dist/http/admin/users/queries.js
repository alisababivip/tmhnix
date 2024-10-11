"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserCountsPerDay = exports.updateUsersStatus = exports.deleteUsers = exports.deleteUser = exports.updateUser = exports.getUser = exports.getAllUsers = exports.getUsers = void 0;
const utils_1 = require("~~/utils");
const analytics_1 = require("~~/utils/analytics");
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getUsers(filter = '', perPage = 10, page = 1) {
    const skip = (page - 1) * perPage;
    const whereClause = filter
        ? {
            OR: [
                { email: { contains: filter } },
                { uuid: { contains: filter } },
                { first_name: { contains: filter } },
                { last_name: { contains: filter } },
            ],
        }
        : {};
    const [users, total] = await prisma_1.default.$transaction([
        prisma_1.default.user.findMany({
            where: whereClause,
            skip: skip,
            take: perPage,
            include: {
                role: true,
            },
        }),
        prisma_1.default.user.count({ where: whereClause }),
    ]);
    for (const user of users) {
        delete user.password;
        delete user.phone;
    }
    const totalPages = Math.ceil(total / perPage);
    return {
        data: users,
        pagination: {
            totalItems: total,
            currentPage: page,
            perPage: perPage,
            totalPages: totalPages,
        },
    };
}
exports.getUsers = getUsers;
async function getAllUsers() {
    const users = await prisma_1.default.user.findMany({
        select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
        },
    });
    return users;
}
exports.getAllUsers = getAllUsers;
async function getUser(uuid) {
    if (!uuid) {
        throw (0, utils_1.createError)({
            statusCode: 400,
            statusMessage: 'Missing user uuid',
        });
    }
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { uuid },
            include: {
                role: true,
            },
        });
        if (user === null || !('email' in user)) {
            throw (0, utils_1.createError)({
                statusCode: 404,
                statusMessage: 'User not found',
            });
        }
        delete user.password;
        delete user.phone;
        return user;
    }
    catch (error) {
        console.error(error);
        throw (0, utils_1.createError)({
            statusCode: 500,
            statusMessage: 'Server error',
        });
    }
}
exports.getUser = getUser;
async function updateUser(uuid, userId, first_name, last_name, email, role_id) {
    try {
        // Check if user exists
        const user = await prisma_1.default.user.findUnique({
            where: { uuid },
        });
        if (!user) {
            throw (0, utils_1.createError)({
                statusCode: 404,
                statusMessage: 'User not found',
            });
        }
        if (user.id === userId) {
            throw (0, utils_1.createError)({
                statusCode: 400,
                statusMessage: 'You cannot update your own account',
            });
        }
        await prisma_1.default.user.update({
            where: { uuid },
            data: {
                first_name,
                last_name,
                email,
                role_id,
            },
        });
        return {
            message: 'User updated successfully',
        };
    }
    catch (error) {
        throw error;
    }
}
exports.updateUser = updateUser;
async function deleteUser(uuid) {
    await prisma_1.default.user.delete({ where: { uuid: uuid } });
}
exports.deleteUser = deleteUser;
async function deleteUsers(userIds) {
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        throw (0, utils_1.createError)({
            statusCode: 400,
            statusMessage: 'Missing user ids',
        });
    }
    // Delete each user from the database
    try {
        await prisma_1.default.user.deleteMany({
            where: {
                id: {
                    in: userIds,
                },
            },
        });
    }
    catch (error) {
        console.error(error);
        throw (0, utils_1.createError)({
            statusCode: 500,
            statusMessage: 'Server error',
        });
    }
}
exports.deleteUsers = deleteUsers;
async function updateUsersStatus(userIds, status) {
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        console.log('Missing user ids');
        throw (0, utils_1.createError)({
            statusCode: 400,
            statusMessage: 'Missing user ids',
        });
    }
    // Check if status is provided
    if (!status) {
        console.log('Missing status');
        throw (0, utils_1.createError)({
            statusCode: 400,
            statusMessage: 'Missing status',
        });
    }
    // Update each user status
    try {
        await prisma_1.default.user.updateMany({
            where: {
                id: {
                    in: userIds,
                },
            },
            data: {
                status: status,
            },
        });
    }
    catch (error) {
        console.error(error);
        throw (0, utils_1.createError)({
            statusCode: 500,
            statusMessage: error.message,
        });
    }
}
exports.updateUsersStatus = updateUsersStatus;
async function getUserCountsPerDay() {
    // Get the current date and subtract 30 days to get the start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    // Fetch all users created within the last 30 days
    const users = await prisma_1.default.user.findMany({
        where: {
            created_at: {
                gte: startDate,
            },
        },
        select: {
            created_at: true,
            status: true,
            email_verified: true,
        },
    });
    // Initialize the counts object
    const counts = {
        registrations: {},
        activeUsers: {},
        bannedUsers: {},
        verifiedEmails: {},
    };
    // Populate counts
    users.forEach((user) => {
        const date = user.created_at.toISOString().split('T')[0];
        // Increment registration count
        counts.registrations[date] = (counts.registrations[date] || 0) + 1;
        // Increment active users count
        if (user.status === 'ACTIVE') {
            counts.activeUsers[date] = (counts.activeUsers[date] || 0) + 1;
        }
        // Increment banned users count
        if (user.status === 'BANNED') {
            counts.bannedUsers[date] = (counts.bannedUsers[date] || 0) + 1;
        }
        // Increment verified emails count
        if (user.email_verified) {
            counts.verifiedEmails[date] = (counts.verifiedEmails[date] || 0) + 1;
        }
    });
    // Convert counts to arrays and sort by date
    const result = {
        registrations: (0, analytics_1.convertAndSortCounts)(counts.registrations),
        activeUsers: (0, analytics_1.convertAndSortCounts)(counts.activeUsers),
        bannedUsers: (0, analytics_1.convertAndSortCounts)(counts.bannedUsers),
        verifiedEmails: (0, analytics_1.convertAndSortCounts)(counts.verifiedEmails),
    };
    return result;
}
exports.getUserCountsPerDay = getUserCountsPerDay;
