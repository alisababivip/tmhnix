import type { HttpRequest, HttpResponse } from 'uWebSockets.js'
import ClientConnectionManager from './ClientConnectionManager'
import ClientHandler from './ClientHandler'
import ExchangeConnectionManager from './ExchangeConnectionManager'

const clientConnectionManager = ClientConnectionManager.getInstance()
const exchangeConnectionManager = ExchangeConnectionManager.getInstance(
  clientConnectionManager,
)
export type ConnectionType = 'trade' | 'tickers'

// Start watching all tickers
try {
  exchangeConnectionManager.watchAllTickers()
} catch (error) {
  console.log('Error watching all tickers:', error.message)
}
// Start flushing the buffer
exchangeConnectionManager.flushBuffer()

export function setupExchangeWebsocket(app) {
  const wsBehavior = {
    /* Handle WebSocket upgrade */
    upgrade: (res: HttpResponse, req: HttpRequest, context) => {
      const type = req.getUrl().replace('/exchange/', '') as ConnectionType

      // Initialize the client handler here (adapt as needed)
      const id = Math.random()
      const clientHandler = new ClientHandler(
        Number(id),
        clientConnectionManager,
        exchangeConnectionManager,
        type,
      )

      // Attach the clientHandler to the WebSocket context
      const extraData = { clientHandler, type }

      res.upgrade(
        extraData,
        req.getHeader('sec-websocket-key'),
        req.getHeader('sec-websocket-protocol'),
        req.getHeader('sec-websocket-extensions'),
        context,
      )
    },

    /* Handle new WebSocket messages */
    message: (ws: any, message: ArrayBuffer, isBinary: boolean) => {
      const { clientHandler } = ws
      try {
        clientHandler.handleClientMessage(message)
      } catch (error) {
        console.log('Error handling client message:', error.message)
      }
    },

    /* Handle new WebSocket connections */
    open: (ws: any) => {
      const { clientHandler } = ws
      try {
        clientHandler.initialize(ws) // Initialize the ws here
        clientConnectionManager.addClient(
          clientHandler.id.toString(),
          clientHandler,
        )
      } catch (error) {
        console.log('Error handling client connection:', error.message)
      }
    },

    /* Handle WebSocket disconnections */
    close: (ws: any) => {
      const { clientHandler } = ws
      try {
        clientHandler.handleClientDisconnection()
      } catch (error) {
        console.log('Error handling client disconnection:', error.message)
      }
    },
  }

  // Set up the WebSocket routes
  app.ws('/exchange/trade', wsBehavior)
  app.ws('/exchange/tickers', wsBehavior)
}

async function checkAndReconnectExchange() {
  if (exchangeConnectionManager) {
    if (!(await exchangeConnectionManager.validateConnection())) {
      exchangeConnectionManager.reconnect()
    }
  }
}

let isValidationProcessRunning = false

if (!isValidationProcessRunning) {
  isValidationProcessRunning = true
  setInterval(async () => {
    await checkAndReconnectExchange()
  }, 180 * 1000)
}
