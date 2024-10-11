import type { JSONResponse, Message } from '~~/types'

// Composable to make chat tasks easier
export default function useChat() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getMessages,
    sendMessage,
    getMetadata,
  }

  /**
   * @desc Get messages of a conversation
   * @returns {Promise<JSONResponse>}
   */
  async function getMessages(ticket: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/support/chat`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      query: {
        ticket: ticket,
      },
    })

    return response
  }

  /**
   * @desc Send a message in a conversation
   * @returns {Promise<JSONResponse>}
   */
  async function sendMessage(
    ticket: string,
    message: Message,
    isSupport?: boolean,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/support/chat`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        ticket: ticket,
        message: message,
        isSupport: isSupport,
      },
    })

    return response
  }

  /**
   * get metadata of a message
   */

  async function getMetadata(url: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/support/chat/metadata`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        url: url,
      },
    })

    return response
  }
}
