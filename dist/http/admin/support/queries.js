"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTicket = exports.assignTicket = exports.openTicket = exports.getTicket = exports.listTickets = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
// Get all tickets for admin
async function listTickets() {
    return (await prisma_1.default.support_ticket.findMany({
        include: {
            chat: {
                select: {
                    id: true,
                    uuid: true,
                    user_id: true,
                    agent_id: true,
                },
            },
            user: {
                select: {
                    id: true,
                    uuid: true,
                    avatar: true,
                    first_name: true,
                    last_name: true,
                },
            },
        },
    }));
}
exports.listTickets = listTickets;
// Get a specific ticket for admin
async function getTicket(ticketId) {
    return (await prisma_1.default.support_ticket.findUnique({
        where: { uuid: ticketId },
    }));
}
exports.getTicket = getTicket;
// Admin reopen a ticket
async function openTicket(ticketId) {
    return (await prisma_1.default.support_ticket.update({
        where: { uuid: ticketId },
        data: {
            status: 'OPEN',
        },
    }));
}
exports.openTicket = openTicket;
// Admin assign a ticket to himself
async function assignTicket(agentId, ticketId) {
    const ticket = await prisma_1.default.support_ticket.findUnique({
        where: { uuid: ticketId },
    });
    if (!ticket) {
        throw new Error('Ticket not found');
    }
    const chat = await prisma_1.default.support_chat.findUnique({
        where: { id: ticket.chat_id },
    });
    if (!chat) {
        throw new Error('Chat not found');
    }
    return await prisma_1.default.support_chat.update({
        where: { id: chat.id },
        data: {
            agent_id: agentId,
        },
    });
}
exports.assignTicket = assignTicket;
// Admin delete a ticket
async function deleteTicket(ticketId) {
    const ticket = await prisma_1.default.support_ticket.findUnique({
        where: { uuid: ticketId },
    });
    if (!ticket) {
        throw new Error('Ticket not found');
    }
    const chat = await prisma_1.default.support_chat.findUnique({
        where: { id: ticket.chat_id },
    });
    if (!chat) {
        throw new Error('Chat not found');
    }
    return await prisma_1.default.support_chat.delete({
        where: { id: chat.id },
    });
}
exports.deleteTicket = deleteTicket;
