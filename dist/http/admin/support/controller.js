"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        return (0, queries_1.listTickets)();
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        return (0, queries_1.getTicket)(params.ticketId);
    }),
    open: (0, utils_1.handleController)(async (_, __, params) => {
        try {
            const ticket = await (0, queries_1.openTicket)(params.ticketId);
            return {
                ...ticket,
                message: 'Ticket opened successfully',
            };
        }
        catch (error) {
            throw new Error('Ticket not found');
        }
    }),
    assign: (0, utils_1.handleController)(async (_, __, params, ___, ____, user) => {
        if (!user) {
            throw new Error('User not found');
        }
        try {
            await (0, queries_1.assignTicket)(user.id, params.ticketId);
            return {
                agent_id: user.id,
                message: 'Ticket assigned successfully',
            };
        }
        catch (error) {
            throw new Error('Ticket not found');
        }
    }),
    delete: (0, utils_1.handleController)(async (_, __, params, ___, ____) => {
        try {
            await (0, queries_1.deleteTicket)(params.ticketId);
            return {
                message: 'Ticket deleted successfully',
            };
        }
        catch (error) {
            throw new Error('Ticket not found');
        }
    }),
};
