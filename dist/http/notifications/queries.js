"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.createNotification = exports.getNotifications = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
// Get all notifications for a specific user
async function getNotifications(userId) {
    return (await prisma_1.default.notification.findMany({
        where: { user_id: userId },
        include: {
            user: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    avatar: true,
                },
            },
        },
    }));
}
exports.getNotifications = getNotifications;
// Create a new notification
async function createNotification(userId, data) {
    return (await prisma_1.default.notification.create({
        data: {
            ...data,
            user_id: userId,
        },
    }));
}
exports.createNotification = createNotification;
// Delete a notification
async function deleteNotification(userId, id) {
    await prisma_1.default.notification.delete({
        where: { user_id: userId, id },
    });
}
exports.deleteNotification = deleteNotification;
