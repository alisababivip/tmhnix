export const useEcosystemSocketStore = defineStore('ecosystemSocket', {
  state: () => ({
    sockets: {} as Record<string, WebSocket>,
    deposits: null as any,
    depositConnected: false,
    orders: null as any,
    orderbook: null as any,
    candles: null as any,
    tickers: null as any,
    ticker: null as any,
    intentionalClosure: {} as Record<string, boolean>,
    isSocketOpen: {} as Record<string, boolean>,
    subscriptions: {} as Record<string, any[]>,
  }),
  actions: {
    createSocket(endpoint: string) {
      this.intentionalClosure[endpoint] = false
      if (this.isSocketOpen[endpoint]) {
        return
      }
      const config = useRuntimeConfig()
      const newSocket = new WebSocket(
        `${config.public.appWebSocketUrl}/ecosystem/${endpoint}`,
      )
      newSocket.onopen = () => {
        this.isSocketOpen = {
          ...this.isSocketOpen,
          [endpoint]: true,
        }
      }
      newSocket.onmessage = (event) => {
        const response = JSON.parse(event.data)
        if (endpoint === 'deposits') {
          if (response.status && response.status === 'subscribed') {
            this.depositConnected = true
          }
          if (response.result && response.result.hash) {
            this.deposits = response.result
          }
        } else {
          const type = response.type || response.data.type
          const result = response.result || response.data.result
          if (type && result) {
            this[type] = result
          }
        }
      }
      newSocket.onclose = () => {
        this.isSocketOpen = {
          ...this.isSocketOpen,
          [endpoint]: false,
        }
        if (!this.intentionalClosure[endpoint]) {
          console.log(
            `WebSocket connection for ${endpoint} closed. Reconnecting...`,
          )
          setTimeout(() => {
            this.createSocket(endpoint)
          }, 5000)
        }
      }
      this.sockets = {
        ...this.sockets,
        [endpoint]: newSocket,
      }
      this.subscriptions = {
        ...this.subscriptions,
        [endpoint]: [],
      }
    },
    sendData(endpoint: string, data: any) {
      const socket = this.sockets[endpoint]
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data))
      }
    },
    subscribe(endpoint: string, subscription: any) {
      const socket = this.sockets[endpoint]
      subscription.type = endpoint

      // Check for duplicate subscriptions
      const existingSubscription = this.subscriptions[endpoint]?.find(
        (sub) => JSON.stringify(sub) === JSON.stringify(subscription),
      )

      if (existingSubscription) {
        return
      }

      if (socket) {
        const sendDataOnOpen = () => {
          this.sendData(endpoint, {
            method: 'SUBSCRIBE',
            params: subscription,
          })
          // Add to the list of active subscriptions for the endpoint
          this.subscriptions[endpoint].push(subscription)

          // Remove the event listener to avoid memory leaks
          socket.removeEventListener('open', sendDataOnOpen)
        }

        // Ensure that the socket is open before sending data
        if (socket.readyState === WebSocket.OPEN) {
          sendDataOnOpen()
        } else {
          // If the socket is not open yet, wait for it to open and then send the data
          socket.addEventListener('open', sendDataOnOpen)
        }
      }
    },

    unsubscribe(endpoint: string, subscription: any) {
      subscription.type = endpoint
      if (this.sockets[endpoint]?.readyState === WebSocket.OPEN) {
        this.sendData(endpoint, {
          method: 'UNSUBSCRIBE',
          params: subscription,
        })
        const index = this.subscriptions[endpoint].indexOf(subscription)
        if (index > -1) {
          this.subscriptions[endpoint].splice(index, 1)
        }
      }
    },
    closeSocket(endpoint: string) {
      this.intentionalClosure[endpoint] = true
      if (this.sockets[endpoint]) {
        this.sockets[endpoint].close()
        delete this.sockets[endpoint]
        delete this.isSocketOpen[endpoint]
        delete this.subscriptions[endpoint]
      }
    },
  },
})
