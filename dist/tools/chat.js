"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupChat = void 0;
const logger_1 = require("../logger");
const logger = (0, logger_1.createLogger)('ChatManager');
const AGENT = 'agent';
const CLIENT = 'client';
class ChatManager {
    chats = {};
    createChat(chatUuid) {
        const chat = {
            id: chatUuid,
        };
        this.chats[chatUuid] = chat;
        return chat;
    }
    getChat(chatUuid) {
        return this.chats[chatUuid];
    }
    addUserToChat(chat, user, role) {
        chat[role] = user;
    }
}
const chatManager = new ChatManager();
function setupChat(app) {
    app.ws('/chat/*', {
        upgrade: (res, req, context) => {
            const chatUuid = req.getQuery('chatUuid');
            const clientId = Number(req.getQuery('clientId'));
            const agentId = Number(req.getQuery('agentId'));
            const isSupport = req.getQuery('isSupport') === 'true';
            if (!clientId || !agentId || !chatUuid) {
                res.close();
                return;
            }
            let chat = chatManager.getChat(chatUuid);
            if (!chat) {
                chat = chatManager.createChat(chatUuid);
            }
            const userRole = isSupport ? 'agent' : 'client';
            const user = { id: isSupport ? agentId : clientId };
            chatManager.addUserToChat(chat, user, userRole);
            res.upgrade({ chat, userRole }, req.getHeader('sec-websocket-key'), req.getHeader('sec-websocket-protocol'), req.getHeader('sec-websocket-extensions'), context);
        },
        message: (ws, message, isBinary) => {
            const { chat, userRole } = ws;
            let parsedMessage;
            const messageString = Buffer.from(message).toString();
            if (messageString === 'heartbeat') {
                return;
            }
            try {
                parsedMessage = JSON.parse(messageString);
            }
            catch (error) {
                logger.error(`Failed to parse message: ${error}`);
                return;
            }
            if (chat[CLIENT] && chat[AGENT]) {
                const targetRole = userRole === AGENT ? CLIENT : AGENT;
                const target = chat[targetRole];
                if (target && target.ws) {
                    target.ws.send(JSON.stringify(parsedMessage), isBinary);
                }
            }
        },
        open: (ws) => {
            const { chat, userRole } = ws;
            chat[userRole].ws = ws;
        },
        close: (ws) => {
            const { chat, userRole } = ws;
            chat[userRole].ws = null;
        },
    });
}
exports.setupChat = setupChat;
