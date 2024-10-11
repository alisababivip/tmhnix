import type { HttpRequest, HttpResponse } from 'uWebSockets.js'
import { createLogger } from '../logger'
const logger = createLogger('ChatManager')

interface Chat {
  id: string
  client?: any
  agent?: any
}

const AGENT = 'agent'
const CLIENT = 'client'

class ChatManager {
  chats: { [key: string]: Chat } = {}

  createChat(chatUuid: string): Chat {
    const chat = {
      id: chatUuid,
    }
    this.chats[chatUuid] = chat
    return chat
  }

  getChat(chatUuid: string): Chat | undefined {
    return this.chats[chatUuid]
  }

  addUserToChat(chat: Chat, user: any, role: string): void {
    chat[role] = user
  }
}

const chatManager = new ChatManager()

export function setupChat(app: any) {
  app.ws('/chat/*', {
    upgrade: (res: HttpResponse, req: HttpRequest, context) => {
      const chatUuid = req.getQuery('chatUuid')
      const clientId = Number(req.getQuery('clientId'))
      const agentId = Number(req.getQuery('agentId'))
      const isSupport = req.getQuery('isSupport') === 'true'

      if (!clientId || !agentId || !chatUuid) {
        res.close()
        return
      }

      let chat = chatManager.getChat(chatUuid)
      if (!chat) {
        chat = chatManager.createChat(chatUuid)
      }

      const userRole = isSupport ? 'agent' : 'client'
      const user = { id: isSupport ? agentId : clientId }

      chatManager.addUserToChat(chat, user, userRole)

      res.upgrade(
        { chat, userRole },
        req.getHeader('sec-websocket-key'),
        req.getHeader('sec-websocket-protocol'),
        req.getHeader('sec-websocket-extensions'),
        context,
      )
    },
    message: (ws: any, message: ArrayBuffer, isBinary: boolean) => {
      const { chat, userRole } = ws
      let parsedMessage: any

      const messageString = Buffer.from(message).toString()

      if (messageString === 'heartbeat') {
        return
      }

      try {
        parsedMessage = JSON.parse(messageString)
      } catch (error) {
        logger.error(`Failed to parse message: ${error}`)
        return
      }

      if (chat[CLIENT] && chat[AGENT]) {
        const targetRole = userRole === AGENT ? CLIENT : AGENT
        const target = chat[targetRole]

        if (target && target.ws) {
          target.ws.send(JSON.stringify(parsedMessage), isBinary)
        }
      }
    },
    open: (ws: any) => {
      const { chat, userRole } = ws
      chat[userRole].ws = ws
    },
    close: (ws: any) => {
      const { chat, userRole } = ws
      chat[userRole].ws = null
    },
  })
}
