"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupEcosystemWebsocket = void 0;
const uuid_1 = require("uuid");
const logger_1 = require("../../../logger"); // Assuming you have a logger setup similar to other parts
const matchingEngine_1 = require("../user/exchange/matchingEngine");
const client_1 = require("../utils/scylla/client");
const ClientConnection_1 = __importDefault(require("./ClientConnection"));
const ClientHandler_1 = __importDefault(require("./ClientHandler"));
const DataManager_1 = __importDefault(require("./DataManager"));
const logger = (0, logger_1.createLogger)('WebSocket');
const clientConnection = ClientConnection_1.default.getInstance();
const baseBehavior = (endpoint) => {
    const dataManager = DataManager_1.default.getInstance();
    return {
        upgrade: (res, req, context) => {
            const id = (0, uuid_1.v4)(); // Using UUID for better uniqueness
            const clientHandler = new ClientHandler_1.default(id, clientConnection, dataManager, endpoint);
            res.upgrade({ clientHandler }, req.getHeader('sec-websocket-key'), req.getHeader('sec-websocket-protocol'), req.getHeader('sec-websocket-extensions'), context);
        },
        message: (ws, message, isBinary) => {
            const { clientHandler } = ws;
            try {
                clientHandler.handleClientMessage(message);
            }
            catch (error) {
                logger.error('Error handling client message:', error.message);
            }
        },
        open: (ws) => {
            const { clientHandler } = ws;
            try {
                clientHandler.initialize(ws);
                clientConnection.addClient(clientHandler.id.toString(), clientHandler);
            }
            catch (error) {
                logger.error('Error during WebSocket open:', error.message);
            }
        },
        close: async (ws) => {
            const { clientHandler } = ws;
            try {
                await clientHandler.handleClientDisconnection();
            }
            catch (error) {
                logger.error('Error during WebSocket close:', error.message);
            }
        },
    };
};
async function setupEcosystemWebsocket(app) {
    await (0, client_1.initialize)();
    matchingEngine_1.MatchingEngine.getInstance();
    app.ws('/ecosystem/deposits', baseBehavior('deposits'));
    app.ws('/ecosystem/exchange', baseBehavior('exchange'));
}
exports.setupEcosystemWebsocket = setupEcosystemWebsocket;
