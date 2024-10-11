"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.getMessages = void 0;
const utils_1 = require("~~/utils");
const emails_1 = require("~~/utils/emails");
const prisma_1 = __importDefault(require("~~/utils/prisma"));
// get messages of a conversation
async function getMessages(ticketId) {
    const ticket = await prisma_1.default.support_ticket.findUnique({
        where: { uuid: ticketId },
    });
    if (!ticket)
        throw (0, utils_1.createError)({
            statusMessage: 'Ticket not found',
            statusCode: 404,
        });
    return (await prisma_1.default.support_chat.findUnique({
        where: { id: ticket.chat_id },
    }));
}
exports.getMessages = getMessages;
async function sendMessage(userId, ticketId, message, isSupport) {
    // Fetch user and ticket in parallel
    const [user, ticket] = await Promise.all([
        prisma_1.default.user.findUnique({ where: { id: userId } }),
        prisma_1.default.support_ticket.findUnique({ where: { uuid: ticketId } }),
    ]);
    if (!user)
        throw (0, utils_1.createError)({
            statusMessage: 'User not found',
            statusCode: 404,
        });
    if (!ticket)
        throw (0, utils_1.createError)({
            statusMessage: 'Ticket not found',
            statusCode: 404,
        });
    if (ticket.status === 'CLOSED')
        throw (0, utils_1.createError)({
            statusMessage: 'Ticket is closed',
            statusCode: 404,
        });
    // Update ticket status
    const newStatus = isSupport ? 'REPLIED' : 'OPEN';
    await prisma_1.default.support_ticket.update({
        where: { id: ticket.id },
        data: { status: newStatus },
    });
    // Fetch associated chat
    const chat = await prisma_1.default.support_chat.findUnique({
        where: { id: ticket.chat_id },
    });
    if (!chat)
        throw (0, utils_1.createError)({
            statusMessage: 'Chat not found',
            statusCode: 404,
        });
    // Add new message
    const messageKey = Object.keys(chat.messages).length.toString();
    chat.messages[messageKey] = message;
    // Update chat
    const updateData = { messages: chat.messages };
    if (isSupport && chat.agent_id === null) {
        updateData.agent_id = user.id;
    }
    const chatUser = !isSupport
        ? user
        : await prisma_1.default.user.findUnique({ where: { id: chat.user_id } });
    const chatAgent = isSupport
        ? user
        : await prisma_1.default.user.findUnique({ where: { id: chat.agent_id } });
    if (chatAgent) {
        const sender = isSupport ? chatAgent : chatUser;
        const receiver = isSupport ? chatUser : chatAgent;
        await (0, emails_1.sendChatEmail)(sender, receiver, chat, message, isSupport ? 'UserMessage' : 'SupportMessage');
    }
    return (await prisma_1.default.support_chat.update({
        where: { id: chat.id },
        data: updateData,
    }));
}
exports.sendMessage = sendMessage;
