"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, ____, _____, user) => {
        if (!user)
            throw new Error('User not found');
        return (0, queries_1.getTickets)(user.id);
    }),
    show: (0, utils_1.handleController)(async (_, __, params, ___, _____, user) => {
        if (!user)
            throw new Error('User not found');
        return (0, queries_1.getTicket)(user.id, params.ticketId);
    }),
    store: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        if (!user)
            throw new Error('User not found');
        return (0, queries_1.createTicket)(user.id, body.ticket);
    }),
    close: (0, utils_1.handleController)(async (_, __, params, ___, ____) => {
        try {
            const ticket = await (0, queries_1.closeTicket)(params.ticketId);
            return {
                ...ticket,
                message: 'Ticket closed successfully',
            };
        }
        catch (error) {
            throw new Error('Ticket not found');
        }
    }),
};
