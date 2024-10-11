import type { HttpRequest, HttpResponse } from 'uWebSockets.js'
import { v4 as uuidv4 } from 'uuid'
import { createLogger } from '../../../logger' // Assuming you have a logger setup similar to other parts
import { MatchingEngine } from '../user/exchange/matchingEngine'
import { initialize } from '../utils/scylla/client'
import ClientConnection from './ClientConnection'
import ClientHandler from './ClientHandler'
import DataManager from './DataManager'

const logger = createLogger('WebSocket')
const clientConnection = ClientConnection.getInstance()

const baseBehavior = (endpoint: string) => {
  const dataManager = DataManager.getInstance()
  return {
    upgrade: (res: HttpResponse, req: HttpRequest, context) => {
      const id = uuidv4() // Using UUID for better uniqueness
      const clientHandler = new ClientHandler(
        id,
        clientConnection,
        dataManager,
        endpoint,
      )

      res.upgrade(
        { clientHandler },
        req.getHeader('sec-websocket-key'),
        req.getHeader('sec-websocket-protocol'),
        req.getHeader('sec-websocket-extensions'),
        context,
      )
    },
    message: (ws: any, message: ArrayBuffer, isBinary: boolean) => {
      const { clientHandler } = ws
      try {
        clientHandler.handleClientMessage(message)
      } catch (error) {
        logger.error('Error handling client message:', error.message)
      }
    },
    open: (ws: any) => {
      const { clientHandler } = ws
      try {
        clientHandler.initialize(ws)
        clientConnection.addClient(clientHandler.id.toString(), clientHandler)
      } catch (error) {
        logger.error('Error during WebSocket open:', error.message)
      }
    },
    close: async (ws: any) => {
      const { clientHandler } = ws
      try {
        await clientHandler.handleClientDisconnection()
      } catch (error) {
        logger.error('Error during WebSocket close:', error.message)
      }
    },
  }
}

export async function setupEcosystemWebsocket(app) {
  await initialize()
  MatchingEngine.getInstance()
  app.ws('/ecosystem/deposits', baseBehavior('deposits'))
  app.ws('/ecosystem/exchange', baseBehavior('exchange'))
}
