"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupExchangeWebsocket = void 0;
const ClientConnectionManager_1 = __importDefault(require("./ClientConnectionManager"));
const ClientHandler_1 = __importDefault(require("./ClientHandler"));
const ExchangeConnectionManager_1 = __importDefault(require("./ExchangeConnectionManager"));
const clientConnectionManager = ClientConnectionManager_1.default.getInstance();
const exchangeConnectionManager = ExchangeConnectionManager_1.default.getInstance(clientConnectionManager);
// Start watching all tickers
try {
    exchangeConnectionManager.watchAllTickers();
}
catch (error) {
    console.log('Error watching all tickers:', error.message);
}
// Start flushing the buffer
exchangeConnectionManager.flushBuffer();
function setupExchangeWebsocket(app) {
    const wsBehavior = {
        /* Handle WebSocket upgrade */
        upgrade: (res, req, context) => {
            const type = req.getUrl().replace('/exchange/', '');
            // Initialize the client handler here (adapt as needed)
            const id = Math.random();
            const clientHandler = new ClientHandler_1.default(Number(id), clientConnectionManager, exchangeConnectionManager, type);
            // Attach the clientHandler to the WebSocket context
            const extraData = { clientHandler, type };
            res.upgrade(extraData, req.getHeader('sec-websocket-key'), req.getHeader('sec-websocket-protocol'), req.getHeader('sec-websocket-extensions'), context);
        },
        /* Handle new WebSocket messages */
        message: (ws, message, isBinary) => {
            const { clientHandler } = ws;
            try {
                clientHandler.handleClientMessage(message);
            }
            catch (error) {
                console.log('Error handling client message:', error.message);
            }
        },
        /* Handle new WebSocket connections */
        open: (ws) => {
            const { clientHandler } = ws;
            try {
                clientHandler.initialize(ws); // Initialize the ws here
                clientConnectionManager.addClient(clientHandler.id.toString(), clientHandler);
            }
            catch (error) {
                console.log('Error handling client connection:', error.message);
            }
        },
        /* Handle WebSocket disconnections */
        close: (ws) => {
            const { clientHandler } = ws;
            try {
                clientHandler.handleClientDisconnection();
            }
            catch (error) {
                console.log('Error handling client disconnection:', error.message);
            }
        },
    };
    // Set up the WebSocket routes
    app.ws('/exchange/trade', wsBehavior);
    app.ws('/exchange/tickers', wsBehavior);
}
exports.setupExchangeWebsocket = setupExchangeWebsocket;
async function checkAndReconnectExchange() {
    if (exchangeConnectionManager) {
        if (!(await exchangeConnectionManager.validateConnection())) {
            exchangeConnectionManager.reconnect();
        }
    }
}
let isValidationProcessRunning = false;
if (!isValidationProcessRunning) {
    isValidationProcessRunning = true;
    setInterval(async () => {
        await checkAndReconnectExchange();
    }, 180 * 1000);
}
