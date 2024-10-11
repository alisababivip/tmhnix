"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeTicket = exports.createTicket = exports.getTicket = exports.getTickets = void 0;
const passwords_1 = require("~~/utils/passwords");
const prisma_1 = __importDefault(require("~~/utils/prisma"));
// Get all tickets for a user
async function getTickets(userId) {
    return (await prisma_1.default.support_ticket.findMany({
        where: { user_id: userId },
        include: {
            chat: {
                select: {
                    agent: {
                        select: {
                            avatar: true,
                            first_name: true,
                            last_name: true,
                        },
                    },
                },
            },
        },
    }));
}
exports.getTickets = getTickets;
// Get a specific ticket
async function getTicket(userId, ticketId) {
    return (await prisma_1.default.support_ticket.findUnique({
        where: { id: ticketId, user_id: userId },
        include: {
            chat: {
                include: {
                    user: {
                        select: {
                            id: true,
                            uuid: true,
                            avatar: true,
                            first_name: true,
                            last_name: true,
                            last_login: true,
                            is_active: true,
                        },
                    },
                },
            },
        },
    }));
}
exports.getTicket = getTicket;
// Create a new ticket
async function createTicket(userId, ticket) {
    const chat = await prisma_1.default.support_chat.create({
        data: {
            uuid: (0, passwords_1.makeUuid)(),
            user_id: userId,
            messages: [
                {
                    type: 'client',
                    text: ticket.message,
                    time: new Date(),
                    user_id: userId,
                    attachments: [],
                },
            ],
        },
    });
    if (!chat)
        throw new Error('Failed to create chat');
    return (await prisma_1.default.support_ticket.create({
        data: {
            uuid: (0, passwords_1.makeUuid)(),
            user_id: userId,
            subject: ticket.subject,
            message: ticket.message,
            importance: ticket.importance,
            status: 'PENDING',
            chat_id: chat.id,
        },
    }));
}
exports.createTicket = createTicket;
// Close a ticket
async function closeTicket(ticketId) {
    return (await prisma_1.default.support_ticket.update({
        where: { uuid: ticketId },
        data: {
            status: 'CLOSED',
        },
    }));
}
exports.closeTicket = closeTicket;
