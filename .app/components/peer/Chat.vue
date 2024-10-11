<script setup lang="ts">
import { useUserP2PTradesStore } from '~~/store/extensions/p2p/user/trades'
import EmojiPicker from 'vue3-emoji-picker'
import moment from 'moment'
import 'vue3-emoji-picker/css'

const tradeStore = useUserP2PTradesStore()
const { getMetadata } = useSupport()
const {
  cancelTrade,
  markAsPaidTrade,
  disputeTrade,
  releaseTrade,
  refundTrade,
  sendMessage,
  cancelDisputeTrade,
} = useP2P()

const userStore = useUserStore()
const user = computed(() => userStore.getProfile)
const { toast } = useUtils()
const route = useRoute()
const { uuid } = route.params
const trade = computed(() => tradeStore.trade)
const openDispute = computed(() => {
  const firstDispute = trade.value?.disputes?.find(
    (d) => d.status !== 'RESOLVED' && d.status !== 'CANCELLED',
  )
  return firstDispute
})
const buyer_id = computed(() => trade.value?.user_id)
const seller_id = computed(() => trade.value?.seller_id)
const isSeller = computed(() => trade.value?.seller_id === user.value?.id)
const isSender = (message: {
  type: string
  user_id: number
  seller_id: number
}) => {
  if (isSeller.value) {
    const sellerIsSender =
      (message.seller_id === user.value?.id && message.type === 'seller') ||
      (message.seller_id !== user.value?.id && message.type === 'buyer')
    return sellerIsSender
  } else {
    const userIsSender =
      (message.user_id === user.value?.id && message.type === 'buyer') ||
      (message.user_id !== user.value?.id && message.type === 'seller')
    return userIsSender
  }
}

const config = useRuntimeConfig()
let socket: WebSocket

const SearchElement = ref<HTMLElement>()
const ChatBody = ref<HTMLElement>()
const viewport = useViewport()
const expanded = ref(viewport.isGreaterOrEquals('sm') ? false : true)
const loading = ref(false)
const message = ref('')
const messageLoading = ref(false)
const inputFile = ref<FileList | null>(null)
let oldId: any = null

onMounted(async () => {
  await tradeStore.fetchP2PTrade(uuid)
  setupChat()
})

function setupChat() {
  if (trade.value) {
    if (!trade.value.messages) {
      trade.value.messages = {}
    }

    for (const item of Object.values(trade.value.messages)) {
      if (item.attachments && item.attachments[0]) {
        checkImageSize(item.attachments[0].image)
      }
    }

    setTimeout(scrollToEnd, 300)
  }
}

onBeforeUnmount(() => {
  if (socket) {
    socket.close()
  }
})

watch(
  () => trade.value?.id,
  (newId) => {
    if (newId !== oldId) {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close()
      }
      initSocket()
      oldId = newId
    }
  },
)

watch(inputFile, (value) => {
  if (value?.length) {
    upload(value)
  }
})

function scrollToEnd() {
  if (ChatBody.value) {
    ChatBody.value.scrollTo({
      top: ChatBody.value.scrollHeight,
      behavior: 'smooth',
    })
  } else {
    console.error('ChatBody.value is null')
  }
}

function initSocket() {
  if (!socket) {
    createWebSocketConnection()
  }
  if (socket) {
    startHeartbeat()

    socket.addEventListener('message', (event) => {
      if (event.data instanceof Blob) {
        processBlobMessage(event)
      } else if (typeof event.data === 'string') {
        processStringMessage(event)
      } else {
        console.error('Received non-string, non-blob message:', event.data)
      }
    })
  }
}

function createWebSocketConnection() {
  if (seller_id.value !== null) {
    const chatUrl = `${config.public.appWebSocketUrl}/chat/?chatUuid=${trade.value?.uuid}&clientId=${buyer_id.value}&agentId=${seller_id.value}&isSupport=${isSeller.value}`
    socket = new WebSocket(chatUrl)
    socket.onopen = () => {
      console.log('WebSocket is open now.')
    }
    socket.onerror = (error) => {
      console.log('WebSocket Error: ', error)
    }
  } else {
    console.error('No seller assigned to this chat.')
  }
}

function startHeartbeat() {
  setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send('heartbeat')
    }
  }, 30000)
}

///////////// Start Messages ///////////////

const processMessage = (message: { attachments: any; type: string }) => {
  let attachments: (
    | {
        type: string
        image: any
        text: any
        url?: undefined
        title?: undefined
        description?: undefined
      }
    | {
        type: string
        url: any
        image: any
        title: any
        description: any
        text?: undefined
      }
    | undefined
  )[] = []
  if (message.attachments && Array.isArray(message.attachments)) {
    attachments = processAttachments(message.attachments)
  }

  const newMessage = createNewMessageFromIncoming(message, attachments)
  updateLocalConversations(newMessage)

  setTimeout(scrollToEnd, 300)
}

function processBlobMessage(event: MessageEvent<any>) {
  let reader = new FileReader()
  reader.addEventListener('loadend', () => {
    const message = JSON.parse(reader.result)
    processMessage(message)
  })
  reader.readAsText(event.data)
}

function processStringMessage(event: MessageEvent<any>) {
  const message = JSON.parse(event.data)

  processMessage(message)
}

function processAttachments(attachments: any[]) {
  return attachments.map(
    (attachment: {
      type: string
      image: any
      text: any
      url: any
      title: any
      description: any
    }) => {
      if (attachment.type === 'image') {
        return {
          type: 'image',
          image: attachment.image,
          text: attachment.text || '',
        }
      } else if (attachment.type === 'link') {
        return {
          type: 'link',
          url: attachment.url,
          image: attachment.image,
          title: attachment.title,
          description: attachment.description,
        }
      }
    },
  )
}

function createNewMessageFromIncoming(
  message: { text: any; seller_id: any; user_id: any },
  attachments: any,
) {
  const now = new Date()
  const currentTime = now.toLocaleString()
  let type: string

  if (isSeller.value) {
    type = 'buyer'
  } else {
    type = 'seller'
  }

  return {
    type,
    text: message.text,
    time: currentTime,
    user_id: message.user_id,
    seller_id: message.seller_id,
    attachments,
  }
}

async function sendMessageToBackend(newMessage: {
  type: any
  text: any
  time: any
  user_id: any
  seller_id: any
  attachments: any
}) {
  if (trade.value?.status === 'CANCELLED') {
    return toast.dangerText(
      'You cannot send a message to a cancelled trade. Please start a new trade.',
    )
  }

  try {
    const response = await sendMessage(uuid, newMessage, isSeller.value)
    if (response.status === 'fail') {
      toast.danger(response)
      return
    }
    try {
      socket.send(JSON.stringify(newMessage))
    } catch (error) {
      console.error('Error sending message to websocket:', error)
      toast.danger(error as any)
    }
    updateLocalConversations(newMessage)
  } catch (error) {
    toast.danger(error as any)
  }
}

function updateLocalConversations(newMessage: unknown) {
  let messagesArray = Object.values(trade.value?.messages)
  messagesArray.push(newMessage)
  if (tradeStore.trade) {
    tradeStore.trade.messages = messagesArray
  }
}

///////////// End Messages ///////////////

const search = ref('')
const searchIndex = ref(0)
const searchResults = ref([])

function searchMessages() {
  const term = search.value?.trim().toLowerCase()
  if (term) {
    searchResults.value = []
    searchIndex.value = 0
    const messages = trade.value?.messages || []
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i]
      if (message.text && message.text.toLowerCase().includes(term)) {
        searchResults.value.push(i)
      } else if (message.attachments) {
        for (let j = 0; j < message.attachments.length; j++) {
          const attachment = message.attachments[j]
          if (
            attachment.type === 'file' &&
            attachment.name.toLowerCase().includes(term)
          ) {
            searchResults.value.push(i)
            break
          }
        }
      }
    }

    if (searchResults.value.length > 0) {
      navigateToSearchResult(searchResults.value[0])
    }
  }
}

function navigateToSearchResult(index: number) {
  const messageElements = Array.from(SearchElement.value?.children || [])
  const messageElement = messageElements.find(
    (el) => el.getAttribute('data-index') === String(index),
  )
  if (messageElement) {
    messageElement.scrollIntoView({ behavior: 'smooth' })
  }
}

function nextResult() {
  if (searchResults.value.length > 0) {
    searchIndex.value = (searchIndex.value + 1) % searchResults.value.length
    navigateToSearchResult(searchResults.value[searchIndex.value])
  }
}

function previousResult() {
  if (searchResults.value.length > 0) {
    searchIndex.value =
      (searchIndex.value - 1 + searchResults.value.length) %
      searchResults.value.length
    navigateToSearchResult(searchResults.value[searchIndex.value])
  }
}

function onEnterPress() {
  if (searchResults.value.length > 0) {
    nextResult()
  } else {
    searchMessages()
  }
}

const currentImage = ref<string | null>(null)
const isLightboxOpen = ref<boolean>(false)

function openLightbox(image: string) {
  currentImage.value = image
  isLightboxOpen.value = true
}

function closeLightbox() {
  isLightboxOpen.value = false
}

const showEmojiPicker = ref(false)

const onSelectEmoji = (emoji: any) => {
  message.value += emoji.i
  showEmojiPicker.value = false
}

const imageSizes = ref<any>({})

const checkImageSize = (imageUrl: any) => {
  let img = new Image()
  img.onload = function () {
    imageSizes.value[imageUrl] = { width: this.width, height: this.height }
  }
  img.src = imageUrl
}

const isSmallImage = (imageUrl: any) => {
  const size = imageSizes.value[imageUrl]
  return size && size.width <= 246 && size.height <= 246
}

function parseDate(dateString) {
  // Attempt to parse using moment.js
  const parsedDate = moment(dateString)
  if (!parsedDate.isValid()) {
    console.error(`Invalid date format: ${dateString}`)
    return null
  }
  return parsedDate.toDate()
}

function timeAgo(inputDate) {
  const date = parseDate(inputDate)
  if (!date) {
    return 'Invalid date'
  }

  const now = new Date()
  const secondsPast = (now.getTime() - date.getTime()) / 1000

  if (secondsPast < 0) {
    return 'in the future'
  }
  if (secondsPast < 60) {
    return `${parseInt(secondsPast)} seconds ago`
  }
  if (secondsPast < 3600) {
    return `${parseInt(secondsPast / 60)} minutes ago`
  }
  if (secondsPast <= 86400) {
    return `${parseInt(secondsPast / 3600)} hours ago`
  }
  if (secondsPast > 86400 && secondsPast <= 604800) {
    return `${parseInt(secondsPast / 86400)} days ago`
  }
  if (secondsPast > 604800 && secondsPast <= 2592000) {
    return `${parseInt(secondsPast / 604800)} weeks ago`
  }
  return `${parseInt(secondsPast / 2592000)} months ago`
}

async function submitMessage() {
  if (!message.value || messageLoading.value) return

  searchResults.value = []
  searchIndex.value = 0

  messageLoading.value = true

  try {
    const now = new Date()
    const currentTime = now.toLocaleString()

    const urlRegex = /(https?:\/\/[^\s]+)/g
    const urls = message.value.match(urlRegex)
    const firstUrl = urls && urls.length > 0 ? urls[0] : null

    let attachment = null
    if (firstUrl) {
      const response = await getMetadata(firstUrl)
      const metadata = response.data.result

      if (metadata.title && metadata.image) {
        attachment = {
          type: 'link',
          image: metadata.image,
          url: firstUrl,
          title: metadata.title,
          description: metadata.description,
        }

        if (message.value.trim() === firstUrl) {
          message.value = ''
        }
      }
    }

    const newMessage = {
      type: isSeller.value ? 'seller' : 'buyer',
      text: message.value,
      time: currentTime,
      user_id: buyer_id.value,
      seller_id: seller_id.value,
      attachments: attachment ? [attachment] : [],
    }

    await sendMessageToBackend(newMessage)

    message.value = ''
    messageLoading.value = false

    await nextTick()

    let inputElement = document.getElementById('messageInput')
    if (inputElement) {
      inputElement.focus()
    }

    scrollToEnd()
  } catch (error) {
    console.log(error)

    toast.danger(error as any)
  } finally {
    messageLoading.value = false
  }
}

async function upload(fileList: FileList) {
  if (messageLoading.value) return

  messageLoading.value = true

  try {
    const formData = new FormData()
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList.item(i)
      if (file) {
        formData.append('files', file)
      }
    }

    formData.append('user_id', buyer_id.value)
    formData.append('seller_id', seller_id.value)
    formData.append('type', 'chat')

    const uploadResponse = await useFetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (uploadResponse && uploadResponse.status.value === 'success') {
      const newMessage = {
        type: isSeller.value ? 'seller' : 'buyer',
        text: '',
        time: new Date().toISOString(),
        user_id: buyer_id.value,
        seller_id: seller_id.value,
        attachments: uploadResponse.data.value.map((filePath: any) => ({
          type: 'image',
          image: filePath,
          text: '',
        })),
      }

      await sendMessageToBackend(newMessage)

      inputFile.value = null

      await nextTick()

      scrollToEnd()
    } else {
      throw new Error(uploadResponse.error.message)
    }
  } catch (error) {
    toast.danger(error as any)
  } finally {
    messageLoading.value = false
  }
}

const status = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'warning' // Trade is open but not yet actioned
    case 'PAID':
      return 'info' // Payment has been made, awaiting further action
    case 'DISPUTE_OPEN':
      return 'danger' // Trade is in dispute
    case 'ESCROW_REVIEW':
      return 'info' // Under review by escrow
    case 'CANCELLED':
      return 'danger' // Trade has been cancelled
    case 'RELEASED':
      return 'primary' // Funds have been released by the seller
    case 'COMPLETED':
      return 'success' // Trade is completed successfully
    case 'REFUNDED':
      return 'secondary' // Trade has been refunded
    default:
      return 'default' // Default status for any other cases
  }
}

const isCancellingOpen = ref(false)
const isCancellingLoading = ref(false)
const cancel = async () => {
  try {
    const response = await cancelTrade(uuid)
    isCancellingOpen.value = false
    toast.response(response)
    if (response.status === 'success') {
      await tradeStore.fetchP2PTrade(uuid)
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isCancellingLoading.value = false
}

const isPayingOpen = ref(false)
const txHash = ref('')
const isLoading = ref(false)

const pay = async () => {
  isLoading.value = true
  try {
    const response = await markAsPaidTrade(uuid, txHash.value)
    isPayingOpen.value = false
    toast.response(response)
    if (response.status === 'success') {
      await tradeStore.fetchP2PTrade(uuid)
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isLoading.value = false
  txHash.value = ''
}

const isDisputingOpen = ref(false)
const disputeReason = ref('')
const isDisputingLoading = ref(false)

const dispute = async () => {
  isDisputingLoading.value = true
  try {
    const response = await disputeTrade(uuid, disputeReason.value)
    isDisputingOpen.value = false
    toast.response(response)
    if (response.status === 'success') {
      await tradeStore.fetchP2PTrade(uuid)
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isDisputingLoading.value = false
  disputeReason.value = ''
}

const isCancelDisputeOpen = ref(false)
const isCancelDisputeLoading = ref(false)

const cancelDispute = async () => {
  isCancelDisputeLoading.value = true
  try {
    const response = await cancelDisputeTrade(uuid)
    isCancelDisputeOpen.value = false
    toast.response(response)
    if (response.status === 'success') {
      await tradeStore.fetchP2PTrade(uuid)
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isCancelDisputeLoading.value = false
}

const isReleasingOpen = ref(false)
const isReleasingLoading = ref(false)

const release = async () => {
  isReleasingLoading.value = true
  try {
    const response = await releaseTrade(uuid)
    isReleasingOpen.value = false
    toast.response(response)
    if (response.status === 'success') {
      await tradeStore.fetchP2PTrade(uuid)
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isReleasingLoading.value = false
}

const isRefundingOpen = ref(false)
const isRefundingLoading = ref(false)

const refund = async () => {
  isRefundingLoading.value = true
  try {
    const response = await refundTrade(uuid)
    isRefundingOpen.value = false
    toast.response(response)
    if (response.status === 'success') {
      await tradeStore.fetchP2PTrade(uuid)
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isRefundingLoading.value = false
}

const avgRating = computed(() => {
  const reviews = trade.value?.offer?.reviews || []
  const total = reviews.reduce((acc, review) => acc + review.rating, 0)
  return reviews.length ? total / reviews.length : 0
})

function starType(index: number): 'full' | 'half' | 'empty' {
  const ratingFloor = Math.floor(avgRating.value)
  if (index <= ratingFloor) {
    return 'full'
  } else if (index === ratingFloor + 1 && avgRating.value % 1 >= 0.5) {
    return 'half'
  } else {
    return 'empty'
  }
}

const isReviewingOpen = ref(false)
const closeReviewing = () => {
  isReviewingOpen.value = false
}

const hasReviewed = computed(() => {
  const reviews = trade.value?.offer?.reviews || []
  return reviews.some((review) => review.reviewer?.uuid === user.value?.uuid)
})
</script>

<template>
  <div class="relative">
    <div class="bg-muted-100 dark:bg-muted-900 flex min-h-screen">
      <!-- Sidebar -->
      <div
        class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative z-10 hidden h-screen w-20 border-r bg-white sm:block"
      >
        <div class="flex h-full flex-col justify-between">
          <div class="flex flex-col">
            <div
              class="ltablet:w-full flex h-16 w-16 shrink-0 items-center justify-center lg:w-full"
            >
              <NuxtLink to="/" class="flex items-center justify-center">
                <Logo class="text-primary-600 h-10" />
              </NuxtLink>
            </div>
            <div
              class="ltablet:w-full flex h-16 w-16 shrink-0 items-center justify-center lg:w-full"
            >
              <NuxtLink
                to="/user/p2p/trades"
                data-nui-tooltip="Back"
                data-nui-tooltip-position="right"
                class="text-muted-400 hover:text-primary-500 hover:bg-primary-500/20 flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-300"
              >
                <Icon name="lucide:arrow-left" class="h-5 w-5" />
              </NuxtLink>
            </div>
          </div>
          <div class="flex flex-col">
            <div class="flex h-16 w-full items-center justify-center">
              <AccountMenu />
            </div>
          </div>
        </div>
      </div>
      <!-- Current conversation -->
      <div
        class="relative w-full transition-all duration-500"
        :class="
          expanded
            ? ''
            : 'ltablet:max-w-[calc(100%_-_470px)] lg:max-w-[calc(100%_-_470px)]'
        "
      >
        <div class="flex w-full flex-col">
          <!-- Header -->
          <div
            class="flex h-16 w-full items-center justify-between px-4 sm:px-8 gap-4"
          >
            <div class="flex items-center gap-2">
              <NuxtLink
                v-if="$viewport.isLessThan('sm')"
                to="/user/p2p/trades"
                data-nui-tooltip="Back"
                data-nui-tooltip-position="right"
                class="text-muted-400 hover:text-primary-500 hover:bg-primary-500/20 flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-300"
              >
                <Icon name="lucide:arrow-left" class="h-5 w-5" />
              </NuxtLink>
              <BaseInput
                v-model="search"
                shape="curved"
                icon="lucide:search"
                placeholder="Search"
                @change="searchMessages"
                @keyup.enter="onEnterPress"
              />

              <BaseButtonIcon
                v-if="searchResults.length > 0"
                class="hidden sm:block"
                shape="curved"
                @click="previousResult"
              >
                <Icon name="lucide:arrow-left" class="h-5 w-5" />
              </BaseButtonIcon>
              <BaseButtonIcon
                v-if="searchResults.length > 0"
                class="hidden sm:block"
                shape="curved"
                @click="nextResult"
              >
                <Icon name="lucide:arrow-right" class="h-5 w-5" />
              </BaseButtonIcon>
            </div>

            <TairoSidebarTools
              class="relative -end-4 z-20 flex h-16 w-full scale-90 items-center justify-end gap-2 sm:end-0 sm:scale-100"
            />
            <BaseButton
              v-if="$viewport.isGreaterOrEquals('sm') && expanded"
              @click="expanded = false"
            >
              <span class="mr-2">{{ $t('Details') }}</span>
              <Icon name="lucide:arrow-right" class="h-4 w-4" />
            </BaseButton>
            <span
              v-if="$viewport.isLessThan('sm') && expanded"
              @click="expanded = false"
              class="disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-none false text-primary-500 border-2 border-primary-500 hover:bg-primary-500/20 false rounded-full h-8 w-8 p-2 nui-focus relative inline-flex items-center justify-center space-x-1 font-sans text-sm font-normal leading-5 no-underline outline-none transition-all duration-300"
            >
              <Icon name="line-md:chevron-right" class="h-5 w-5" />
            </span>
          </div>

          <!-- Body -->
          <div
            ref="ChatBody"
            class="relative h-[calc(100vh_-_128px)] w-full p-4 sm:p-8"
            :class="loading ? 'overflow-hidden' : 'overflow-y-auto slimscroll'"
          >
            <!-- Loader-->
            <div
              class="bg-muted-100 dark:bg-muted-900 pointer-events-none absolute inset-0 z-10 h-full w-full p-8 transition-opacity duration-300"
              :class="loading ? 'opacity-100' : 'opacity-0 pointer-events-none'"
            >
              <ChatLoader />
            </div>
            <!-- Messages loop -->
            <div
              v-if="trade && trade.messages"
              class="space-y-8"
              ref="SearchElement"
            >
              <div
                v-for="(item, index) in trade?.messages"
                :key="index"
                :data-index="index"
                class="relative flex w-full gap-4"
                :class="[
                  isSender(item) ? 'flex-row-reverse' : 'flex-row',
                  item.type === 'separator' ? 'justify-center' : '',
                ]"
              >
                <template v-if="item.type !== 'separator'">
                  <div class="shrink-0">
                    <BaseAvatar
                      v-if="isSender(item)"
                      :src="user?.avatar || '/img/avatars/1.svg'"
                      size="xs"
                    />
                    <BaseAvatar
                      v-else
                      :src="
                        isSeller
                          ? trade?.user?.avatar || '/img/avatars/1.svg'
                          : trade?.seller?.avatar || '/img/avatars/1.svg'
                      "
                      size="xs"
                    />
                  </div>
                  <div class="flex max-w-md flex-col">
                    <template v-if="item.attachments?.length > 0">
                      <!-- For single image -->
                      <div
                        v-if="item.attachments.length === 1"
                        :class="
                          isSender(item)
                            ? 'text-right rounded-se-none'
                            : 'text-left rounded-ss-none'
                        "
                      >
                        <div
                          v-if="item.attachments[0].type === 'image'"
                          class="max-w-xs"
                        >
                          <div class="image-container">
                            <img
                              loading="lazy"
                              :src="item.attachments[0].image"
                              :alt="item.attachments[0].text"
                              class="dark:bg-muted-800 rounded-2xl bg-white p-1"
                              @click="openLightbox(item.attachments[0].image)"
                            />
                            <div
                              class="overlay"
                              @click="openLightbox(item.attachments[0].image)"
                            >
                              <Icon
                                name="lucide:zoom-in"
                                class="h-5 w-5 zoom-icon"
                              />
                            </div>
                          </div>
                        </div>
                        <template v-else>
                          <div
                            v-if="item.text"
                            class="bg-muted-200 dark:bg-muted-800 rounded-xl p-4 mb-2 text-left"
                            :class="
                              isSender(item)
                                ? 'rounded-se-none'
                                : 'rounded-ss-none'
                            "
                          >
                            <p class="font-sans text-sm">{{ item.text }}</p>
                          </div>

                          <div>
                            <NuxtLink
                              :to="item.attachments[0].url"
                              target="_blank"
                              class="flex text-left"
                              :class="
                                isSender(item) ? 'justify-end' : 'justify-start'
                              "
                            >
                              <div
                                v-if="isSmallImage(item.attachments[0].image)"
                                class="flex max-w-sm rounded-2xl bg-white dark:bg-muted-800 p-2 overflow-hidden"
                                :class="
                                  isSender(item)
                                    ? 'rounded-se-none '
                                    : 'rounded-ss-none'
                                "
                              >
                                <div class="w-full rounded-xl overflow-hidden">
                                  <img
                                    loading="lazy"
                                    :src="item.attachments[0].image"
                                    :alt="item.attachments[0].title"
                                    class="w-24 h-24 transform transition-all duration-300 hover:scale-105"
                                  />
                                </div>
                                <div class="pl-2">
                                  <p
                                    v-if="item.attachments[0].title"
                                    class="text-muted-800 dark:text-muted-100 font-sans text-sm mb-1"
                                  >
                                    {{ item.attachments[0].title }}
                                  </p>
                                  <p
                                    v-else
                                    class="text-muted-800 dark:text-muted-100 font-sans"
                                  >
                                    {{
                                      item.attachments[0].url?.replace(
                                        /(^\w+:|^)\/\//,
                                        '',
                                      )
                                    }}
                                  </p>
                                  <p class="text-muted-400 font-sans text-xs">
                                    {{ item.attachments[0].description }}
                                  </p>
                                </div>
                              </div>

                              <div
                                v-else
                                class="max-w-xs rounded-2xl bg-white dark:bg-muted-800 p-2"
                                :class="
                                  isSender(item)
                                    ? 'rounded-se-none '
                                    : 'rounded-ss-none'
                                "
                              >
                                <div class="rounded-xl overflow-hidden">
                                  <img
                                    loading="lazy"
                                    :src="item.attachments[0].image"
                                    :alt="item.attachments[0].title"
                                    class="transform transition-all duration-300 hover:scale-105"
                                  />
                                </div>
                                <div class="px-1 py-2">
                                  <p
                                    v-if="item.attachments[0].title"
                                    class="text-muted-800 dark:text-muted-100 font-sans text-sm mb-1"
                                  >
                                    {{ item.attachments[0].title }}
                                  </p>
                                  <p
                                    v-else
                                    class="text-muted-800 dark:text-muted-100 font-sans"
                                  >
                                    {{
                                      item.attachments[0].url?.replace(
                                        /(^\w+:|^)\/\//,
                                        '',
                                      )
                                    }}
                                  </p>
                                  <p class="text-muted-400 font-sans text-xs">
                                    {{ item.attachments[0].description }}
                                  </p>
                                </div>
                              </div>
                            </NuxtLink>
                          </div>
                        </template>
                      </div>
                      <!-- For multiple images -->
                      <div
                        v-else
                        class="grid grid-cols-2 gap-2"
                        :class="[
                          isSender(item)
                            ? 'rounded-se-none'
                            : 'rounded-ss-none',
                        ]"
                      >
                        <template
                          v-for="(attachment, idx) in item.attachments"
                          :key="idx"
                        >
                          <div v-if="attachment.type === 'image'">
                            <div class="image-container">
                              <img
                                loading="lazy"
                                :src="attachment.image"
                                :alt="attachment.text"
                                class="dark:bg-muted-800 rounded-2xl bg-white p-1"
                                @click="openLightbox(attachment.image)"
                              />
                              <div
                                class="overlay"
                                @click="openLightbox(attachment.image)"
                              >
                                <Icon
                                  name="lucide:zoom-in"
                                  class="h-5 w-5 zoom-icon"
                                />
                              </div>
                            </div>
                          </div>
                        </template>
                      </div>
                    </template>

                    <div
                      v-else
                      class="bg-muted-200 dark:bg-muted-800 rounded-xl p-4 text-left"
                      :class="
                        isSender(item) ? 'rounded-se-none' : 'rounded-ss-none'
                      "
                    >
                      <p class="font-sans text-sm">{{ item.text }}</p>
                    </div>
                    <div
                      class="text-muted-400 mt-1 font-sans text-xs"
                      :class="isSender(item) ? 'text-right' : 'text-left'"
                    >
                      {{ timeAgo(item.time) }}
                    </div>
                  </div>
                </template>
                <div v-else>
                  <div
                    class="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div
                      class="border-muted-300/50 dark:border-muted-800 w-full border-t"
                    ></div>
                  </div>
                  <div class="relative flex justify-center">
                    <span
                      class="bg-muted-100 dark:bg-muted-900 text-muted-400 px-3 font-sans text-xs uppercase"
                    >
                      {{ item.time }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Compose -->
          <form
            method="POST"
            action=""
            @submit.prevent="submitMessage"
            class="bg-muted-100 dark:bg-muted-900 flex h-16 w-full items-center px-4 sm:px-8"
          >
            <div class="relative w-full">
              <BaseInput
                id="messageInput"
                v-model.trim="message"
                :disabled="messageLoading"
                shape="full"
                :classes="{
                  input: 'h-12 ps-6 pe-24',
                }"
                placeholder="Write a message..."
              />
              <div
                v-if="showEmojiPicker"
                class="absolute bottom-12 right-0 z-50"
              >
                <EmojiPicker
                  :native="true"
                  @select="onSelectEmoji"
                  theme="auto"
                  :display-recent="true"
                  :disable-skin-tones="true"
                />
              </div>
              <div class="absolute end-2 top-0 flex h-12 items-center gap-1">
                <button
                  type="button"
                  class="text-muted-400 hover:text-primary-500 flex h-12 w-10 items-center justify-center transition-colors duration-300"
                  @click="showEmojiPicker = !showEmojiPicker"
                >
                  <Icon name="lucide:smile" class="h-5 w-5" />
                </button>

                <BaseFullscreenDropfile
                  icon="ph:image-duotone"
                  :filter-file-dropped="
                    (file: { type: string }) => file.type.startsWith('image')
                  "
                  @drop="
                    (
                      value: {
                        [x: number]: File
                        readonly length: number
                        item: (index: number) => File | null
                        [Symbol.iterator]: () => IterableIterator<File>
                      } | null,
                    ) => {
                      inputFile = value
                    }
                  "
                />
                <BaseInputFileHeadless
                  accept="image/*"
                  multiple
                  v-model="inputFile"
                  v-slot="{ open, remove, preview, files }"
                >
                  <div
                    data-nui-tooltip="Upload image"
                    class="text-muted-400 hover:text-primary-500 flex items-center justify-center transition-colors duration-300 mr-2"
                  >
                    <Icon
                      name="lucide:paperclip"
                      class="h-5 w-5"
                      @click="open"
                    />
                  </div>
                </BaseInputFileHeadless>
              </div>
            </div>
          </form>
        </div>
      </div>
      <!-- Current user -->
      <div
        class="ltablet:w-[310px] dark:bg-muted-800 fixed end-0 top-0 z-20 h-full w-[390px] bg-white transition-transform duration-500 max-h-screen overflow-y-auto"
        :class="expanded ? 'translate-x-full' : 'translate-x-0'"
      >
        <div class="flex h-16 w-full items-center justify-between px-8">
          <BaseHeading
            tag="h3"
            size="lg"
            class="text-muted-800 dark:text-white"
          >
            <span>{{ $t('Trade details') }}</span>
          </BaseHeading>
          <BaseButtonIcon small @click="expanded = true">
            <Icon
              name="lucide:arrow-right"
              class="pointer-events-none h-4 w-4"
            />
          </BaseButtonIcon>
        </div>
        <div class="relative flex w-full flex-col px-8">
          <!-- Loader -->
          <div v-if="loading" class="mt-8">
            <div class="mb-3 flex items-center justify-center">
              <BasePlaceload
                class="h-24 w-24 shrink-0 rounded-full"
                :width="96"
                :height="96"
              />
            </div>
            <div class="flex flex-col items-center">
              <BasePlaceload class="mb-2 h-3 w-full max-w-[10rem] rounded" />
              <BasePlaceload class="mb-2 h-3 w-full max-w-[6rem] rounded" />
              <div class="my-4 flex w-full flex-col items-center">
                <BasePlaceload class="mb-2 h-2 w-full max-w-[15rem] rounded" />
                <BasePlaceload class="mb-2 h-2 w-full max-w-[13rem] rounded" />
              </div>
              <div class="mb-6 flex w-full items-center justify-center">
                <div class="px-4">
                  <BasePlaceload class="h-3 w-[3.5rem] rounded" />
                </div>
                <div class="px-4">
                  <BasePlaceload class="h-3 w-[3.5rem] rounded" />
                </div>
              </div>
              <div class="w-full">
                <BasePlaceload class="h-10 w-full rounded-xl" />
                <BasePlaceload class="mx-auto mt-3 h-3 w-[7.5rem] rounded" />
              </div>
            </div>
          </div>
          <!-- User details -->
          <div v-else class="mt-8">
            <div class="flex items-center justify-center flex-col gap-3">
              <div class="flex flex-wrap items-end gap-4">
                <BaseAvatar
                  :src="
                    isSeller
                      ? trade?.user?.avatar || '/img/avatars/1.svg'
                      : trade?.seller?.avatar || '/img/avatars/1.svg'
                  "
                  size="2xl"
                  shape="full"
                />
              </div>

              <div class="mb-5 flex items-end">
                <span v-for="i in 5" :key="i">
                  <Icon
                    v-if="starType(i) === 'full'"
                    name="uim:star"
                    class="w-4 h-4 text-yellow-400"
                  />
                  <Icon
                    v-else-if="starType(i) === 'half'"
                    name="uim:star-half-alt"
                    class="w-4 h-4 text-yellow-400"
                  />
                  <Icon v-else name="uim:star" class="w-4 h-4 text-gray-300" />
                </span>
                <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">{{
                  avgRating.toFixed(1)
                }}</span>
              </div>
            </div>
            <div class="text-center space-y-5 mt-5" :key="trade?.status">
              <div class="space-y-2">
                <div class="flex justify-between items-center gap-2">
                  <strong class="text-muted-600 dark:text-gray-300"
                    >{{ isSeller ? 'Buyer' : 'Seller' }}:
                  </strong>
                  <span class="">
                    {{
                      isSeller
                        ? trade?.user?.first_name + ' ' + trade?.user?.last_name
                        : trade?.seller !== null
                          ? trade?.seller?.first_name +
                            ' ' +
                            trade?.seller?.last_name
                          : 'N/A'
                    }}</span
                  >
                </div>
                <div class="flex justify-between items-center gap-2">
                  <span class="text-muted-600 dark:text-gray-300">
                    <strong>{{ $t('Trade ID') }}:</strong>
                  </span>
                  <span class="text-xs">#{{ trade?.uuid }}</span>
                </div>
                <div class="flex justify-between items-center gap-2">
                  <span class="text-muted-600 dark:text-gray-300">
                    <strong>{{ $t('Offer ID') }}:</strong>
                  </span>
                  <span class="text-xs">#{{ trade?.offer?.uuid }}</span>
                </div>
                <div class="flex justify-between items-center gap-2">
                  <span class="text-muted-600 dark:text-gray-300">
                    <strong>{{ $t('Status') }}:</strong>
                  </span>
                  <BaseTag :color="status(trade?.status)" flavor="pastel">
                    {{ trade?.status }}
                  </BaseTag>
                </div>
                <div class="flex justify-between items-center gap-2">
                  <span class="text-muted-600 dark:text-gray-300">
                    <strong>{{ $t('Amount') }}:</strong>
                  </span>
                  <span>
                    {{ trade?.amount }} {{ trade?.offer?.currency }}
                  </span>
                </div>
                <div class="flex justify-between items-center gap-2">
                  <strong class="text-muted-600 dark:text-gray-300"
                    >{{ $t('Paid At') }}:</strong
                  >
                  <span class="block md:inline">{{
                    new Date(trade?.created_at).toLocaleString()
                  }}</span>
                </div>
                <div class="flex justify-between items-center gap-2">
                  <strong class="text-muted-600 dark:text-gray-300"
                    >{{ $t('Payment Method') }}:</strong
                  >
                  <span class="block md:inline">{{
                    trade?.offer?.payment_method?.name
                  }}</span>
                </div>
                <div
                  class="flex justify-between items-start gap-2 flex-col border-t border-b pb-2 border-gray-300 dark:border-gray-700 pt-2"
                >
                  <strong class="text-muted-600 dark:text-gray-300"
                    >{{ $t('Instructions') }}:</strong
                  >
                  <div
                    class="block md:inline"
                    v-html="trade?.offer?.payment_method?.instructions"
                  ></div>
                </div>
                <div
                  class="flex justify-between items-start gap-2 flex-col border-b pb-2 border-gray-300 dark:border-gray-700"
                  v-if="trade?.tx_hash"
                >
                  <strong class="text-muted-600 dark:text-gray-300"
                    >{{ $t('Transaction ID') }}:</strong
                  >
                  <span class="block md:inline">{{ trade?.tx_hash }}</span>
                </div>
              </div>

              <div v-if="trade?.status === 'DISPUTE_OPEN'" class="w-full">
                <BaseMessage
                  type="warning"
                  icon
                  v-if="openDispute?.status === 'PENDING'"
                >
                  <span>{{
                    $t('Trade is in dispute, please wait until it is reviewed.')
                  }}</span>
                </BaseMessage>
                <BaseMessage
                  type="info"
                  icon
                  v-if="openDispute?.status === 'IN_PROGRESS'"
                >
                  <span>{{ openDispute?.resolution }}</span>
                </BaseMessage>
              </div>
              <div class="flex flex-col gap-5">
                <!-- Cancel Trade Button -->
                <BaseButton
                  v-if="trade?.status === 'PENDING'"
                  @click="isCancellingOpen = true"
                  class="w-full"
                  color="danger"
                >
                  <Icon name="line-md:close" class="h-4 w-4" />
                  <span class="mr-2">{{ $t('Cancel Trade') }}</span>
                </BaseButton>

                <!-- Pay Button -->
                <BaseButton
                  v-if="!isSeller && trade?.status === 'PENDING'"
                  @click="isPayingOpen = true"
                  class="w-full"
                  color="success"
                >
                  <Icon name="line-md:confirm" class="h-4 w-4" />
                  <span class="mr-2">{{ $t('Submit Transaction ID') }}</span>
                </BaseButton>

                <!-- Dispute Trade Button -->
                <BaseButton
                  v-if="
                    trade?.status === 'PAID' && trade?.disputes?.length === 0
                  "
                  @click="isDisputingOpen = true"
                  class="w-full"
                  color="warning"
                >
                  <Icon name="line-md:alert-circle" class="h-4 w-4" />
                  <span class="mr-2">{{ $t('Dispute Trade') }}</span>
                </BaseButton>

                <!-- Cancel Dispute Trade Button -->
                <BaseButton
                  v-if="
                    trade?.status === 'DISPUTE_OPEN' &&
                    openDispute?.status === 'PENDING' &&
                    openDispute?.raised_by?.uuid === user?.uuid
                  "
                  @click="isCancelDisputeOpen = true"
                  class="w-full"
                  color="warning"
                >
                  <Icon name="line-md:alert-circle" class="h-4 w-4" />
                  <span class="mr-2">{{ $t('Cancel Dispute') }}</span>
                </BaseButton>

                <!-- Release Trade Button -->
                <BaseButton
                  v-if="
                    isSeller && ['DISPUTE_OPEN', 'PAID'].includes(trade?.status)
                  "
                  @click="isReleasingOpen = true"
                  class="w-full"
                  color="primary"
                >
                  <Icon name="mdi:account-payment" class="h-4 w-4" />
                  <span class="mr-2">{{ $t('Complete Trade') }}</span>
                </BaseButton>

                <BaseButton
                  v-if="
                    !isSeller &&
                    ['COMPLETED'].includes(trade?.status) &&
                    !hasReviewed
                  "
                  @click="isReviewingOpen = true"
                  class="w-full"
                  color="warning"
                >
                  <Icon name="solar:star-bold-duotone" class="h-4 w-4" />
                  <span class="mr-2">{{ $t('Review Offer') }}</span>
                </BaseButton>

                <!-- Refund Trade Button -->
                <!-- <BaseButton
                  v-if="isSeller && trade?.status === 'DISPUTE_OPEN'"
                  @click="isRefundingOpen = true"
                  class="w-full"
                  color="danger"
                >
                  <Icon name="tabler:credit-card-refund" class="h-4 w-4" />
                  <span class="mr-2">{{ $t('Refund Trade') }}</span>
                </BaseButton> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <TairoPanels />

    <TairoModal :open="isPayingOpen" size="sm" @close="isPayingOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Send Payment Transaction ID') }}
          </h3>
          <BaseButtonClose @click="isPayingOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <BaseInput
            v-model="txHash"
            shape="curved"
            placeholder="Transaction Hash"
            label="Transaction Hash"
            :disabled="isLoading"
          />
          <small
            ><span class="text-muted-400 dark:text-muted-600">
              {{
                $t(
                  'Please enter the transaction id of the payment, so the seller can verify it.',
                )
              }}
            </span>
          </small>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton
              color="success"
              flavor="solid"
              @click="pay"
              :disabled="isLoading"
              :loading="isLoading"
            >
              <span>{{ $t('Submit') }}</span>
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <TairoModal
      :open="isDisputingOpen"
      size="sm"
      @close="isDisputingOpen = false"
    >
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Dispute Trade') }}
          </h3>
          <BaseButtonClose @click="isDisputingOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <BaseTextarea
            v-model="disputeReason"
            shape="curved"
            placeholder="Reason"
            label="Reason"
            :disabled="isDisputingLoading"
          />
          <small
            ><span class="text-muted-400 dark:text-muted-600">
              {{
                $t(
                  'Please enter the reason for the dispute, we will review it and get back to you.',
                )
              }}
            </span>
          </small>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton
              color="warning"
              flavor="solid"
              @click="dispute"
              :disabled="isDisputingLoading"
              :loading="isDisputingLoading"
            >
              <span>{{ $t('Submit') }}</span>
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <TairoModal
      :open="isReleasingOpen"
      size="sm"
      @close="isReleasingOpen = false"
    >
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Release Funds') }}
          </h3>
          <BaseButtonClose @click="isReleasingOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <span class="text-muted-400 dark:text-muted-600">
            {{
              $t(
                'Are you sure you want to release the funds? This action cannot be undone.',
              )
            }}
          </span>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton
              color="primary"
              flavor="solid"
              @click="release"
              :disabled="isReleasingLoading"
              :loading="isReleasingLoading"
            >
              <span>{{ $t('Submit') }}</span>
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <TairoModal
      :open="isCancellingOpen"
      size="sm"
      @close="isCancellingOpen = false"
      ><template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Cancel Trade') }}
          </h3>
          <BaseButtonClose @click="isCancellingOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <span class="text-muted-400 dark:text-muted-600">
            {{
              $t(
                'Are you sure you want to cancel the trade? This action cannot be undone.',
              )
            }}
          </span>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton
              color="danger"
              flavor="solid"
              @click="cancel"
              :disabled="isCancellingLoading"
              :loading="isCancellingLoading"
            >
              <span>{{ $t('Submit') }}</span>
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <TairoModal
      :open="isRefundingOpen"
      size="sm"
      @close="isRefundingOpen = false"
    >
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Refund Funds') }}
          </h3>
          <BaseButtonClose @click="isRefundingOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <span class="text-muted-400 dark:text-muted-600">
            {{
              $t(
                'Are you sure you want to refund the funds? This action cannot be undone.',
              )
            }}
          </span>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton
              color="primary"
              flavor="solid"
              @click="refund"
              :disabled="isRefundingLoading"
              :loading="isRefundingLoading"
            >
              <span>{{ $t('Submit') }}</span>
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <TairoModal
      :open="isCancelDisputeOpen"
      size="sm"
      @close="isCancelDisputeOpen = false"
    >
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Cancel Dispute') }}
          </h3>
          <BaseButtonClose @click="isCancelDisputeOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <span class="text-muted-400 dark:text-muted-600">
            {{
              $t(
                'Are you sure you want to cancel the dispute? This action cannot be undone, and you will not be able to open a dispute again.',
              )
            }}
          </span>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton
              color="primary"
              flavor="solid"
              @click="cancelDispute"
              :disabled="isCancelDisputeLoading"
              :loading="isCancelDisputeLoading"
            >
              <span>{{ $t('Close Dispute') }}</span>
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <TairoModal
      :open="isReviewingOpen"
      size="sm"
      @close="isReviewingOpen = false"
    >
      <PeerReview
        :trade="trade"
        v-if="trade.status === 'COMPLETED'"
        :close-reviewing="closeReviewing"
      />
    </TairoModal>

    <VueEasyLightbox
      :visible="isLightboxOpen"
      :imgs="[currentImage]"
      @hide="closeLightbox"
    ></VueEasyLightbox>
  </div>
</template>

<style scoped>
.image-container {
  position: relative;
  display: inline-block;
}

.image-container:hover .overlay {
  opacity: 1;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
}

.zoom-icon {
  font-size: 2rem;
  color: white;
}
</style>
