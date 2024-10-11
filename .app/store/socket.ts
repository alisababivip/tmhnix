export const useSocketStore = defineStore('socket', {
  state: () => ({
    sockets: {} as Record<string, WebSocket>,
    tradeData: null as any,
    tickersData: null as any,
    subscriptions: {} as Record<string, any[]>,
    isSocketOpen: {} as Record<string, boolean>,
    intentionalClosure: {} as Record<string, boolean>,
    isConnected: false,
  }),
  actions: {
    createSocket(link: string) {
      this.intentionalClosure[link] = false
      if (this.isSocketOpen[link]) {
        console.log(`WebSocket connection for ${link} is already open`)
        return
      }
      const config = useRuntimeConfig()
      const newSocket = new WebSocket(
        `${config.public.appWebSocketUrl}/exchange/${link}`,
      )
      newSocket.onopen = () => {
        this.isSocketOpen = {
          ...this.isSocketOpen,
          [link]: true,
        }

        if (link === 'tickers') {
          this.sendData(link, { method: 'SUBSCRIBE' })
        }
      }
      newSocket.onmessage = (event) => {
        if (link === 'trade') {
          this.tradeData = event.data
        } else if (link === 'tickers') {
          this.tickersData = event.data
        }
      }
      newSocket.onclose = () => {
        this.isSocketOpen = {
          ...this.isSocketOpen,
          [link]: false,
        }
        if (!this.intentionalClosure[link]) {
          console.log(
            `WebSocket connection for ${link} closed. Reconnecting...`,
          )
          setTimeout(() => {
            this.createSocket(link)
          }, 5000)
        }
      }
      this.sockets = {
        ...this.sockets,
        [link]: newSocket,
      }
      this.subscriptions = {
        ...this.subscriptions,
        [link]: [],
      }
    },
    sendData(link: string, data: any) {
      const socket = this.sockets[link]
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data))
      }
    },
    subscribe(link: string, subscription: any) {
      if (this.sockets[link]?.readyState === WebSocket.OPEN) {
        this.sendData(link, {
          method: 'SUBSCRIBE',
          params: subscription,
        })
        this.subscriptions[link].push(subscription)
      }
    },
    unsubscribe(link: string, subscription: any) {
      if (this.sockets[link]?.readyState === WebSocket.OPEN) {
        this.sendData(link, {
          method: 'UNSUBSCRIBE',
          params: subscription,
        })
        const index = this.subscriptions[link].indexOf(subscription)
        if (index > -1) {
          this.subscriptions[link].splice(index, 1)
        }
      }
    },
    closeSocket(link: string) {
      this.intentionalClosure[link] = true
      if (this.sockets[link]) {
        if (link === 'tickers') {
          this.sendData(link, { method: 'UNSUBSCRIBE' })
        }
        this.sockets[link].close()
        delete this.sockets[link]
        delete this.isSocketOpen[link]
        delete this.subscriptions[link]
      }
    },
  },
})
