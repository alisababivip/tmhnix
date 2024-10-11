<script setup lang="ts">
import { useUserSupportStore } from '~~/store/support/user'
import { useAdminSupportStore } from '~~/store/support/admin'
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

const props = defineProps({
  isSupport: {
    type: Boolean,
    required: true,
  },
})

const { sendMessage, closeTicket, openTicket, getMetadata } = useSupport()

let supportStore: any
if (props.isSupport) {
  supportStore = useAdminSupportStore()
} else {
  supportStore = useUserSupportStore()
}

const userStore = useUserStore()
const user = computed(() => userStore.getProfile)
const { toast } = useUtils()
const route = useRoute()
const { uuid } = route.params
const ticket = computed(() => supportStore.tickets.find((t) => t.uuid === uuid))
const chat = computed(() => supportStore?.chat)
const chatUuid = computed(() => chat?.value?.uuid)
const client_id = computed(() => chat.value?.user_id)
const agent_id = computed(() => chat.value?.agent_id)
const { assignAgent } = useSupport()
const isSender = (message: {
  type: string
  user_id: number
  agent_id: number
}) => {
  if (props.isSupport) {
    const agentIsSender =
      (message.agent_id === user.value?.id && message.type === 'agent') ||
      (message.agent_id !== user.value?.id && message.type === 'client')
    return agentIsSender
  } else {
    const userIsSender =
      (message.user_id === user.value?.id && message.type === 'client') ||
      (message.user_id !== user.value?.id && message.type === 'agent')
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
  if (supportStore.tickets.length === 0) {
    await supportStore.fetchTickets()
  }
  if (props.isSupport && ticket.value?.chat?.agent_id === null) {
    const response = await assignAgent(ticket.value?.uuid)
    toast.response(response)
    if (response.status === 'success') {
      supportStore.tickets.find((t) => t.uuid === uuid).chat.agent_id =
        response.data.result.agent_id
    }
  }
  if (supportStore.chat === null) {
    await supportStore.fetchChat(uuid)
  }

  setupChat()
})

function setupChat() {
  if (chat.value) {
    if (!chat.value.messages) {
      chat.value.messages = {}
    }

    for (const item of Object.values(chat.value.messages)) {
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
  () => chat.value?.id,
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
  if (agent_id.value !== null) {
    const chatUrl = `${config.public.appWebSocketUrl}/chat/?chatUuid=${chatUuid.value}&clientId=${client_id.value}&agentId=${agent_id.value}&isSupport=${props.isSupport}`
    socket = new WebSocket(chatUrl)
    socket.onopen = () => {
      console.log('WebSocket is open now.')
    }
    socket.onerror = (error) => {
      console.log('WebSocket Error: ', error)
    }
  } else {
    console.error('No agent assigned to this chat.')
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

  supportStore.tickets.find((t) => t.uuid === uuid).status = 'REPLIED'

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
  message: { text: any; agent_id: any; user_id: any },
  attachments: any,
) {
  const now = new Date()
  const currentTime = now.toLocaleString()
  let type: string

  if (props.isSupport) {
    type = 'client'
  } else {
    type = 'agent'
  }

  return {
    type,
    text: message.text,
    time: currentTime,
    user_id: message.user_id,
    agent_id: message.agent_id,
    attachments,
  }
}

function createNewMessage({
  type,
  text,
  time,
  user_id,
  agent_id,
  attachments,
}) {
  return {
    type,
    text,
    time,
    user_id,
    agent_id,
    attachments,
  }
}

async function sendMessageToBackend(newMessage: {
  type: any
  text: any
  time: any
  user_id: any
  agent_id: any
  attachments: any
}) {
  if (!client_id.value || !agent_id.value) {
    return toast.dangerText('User ID or Agent ID is missing.')
  }

  if (ticket.value?.status === 'PENDING' && !props.isSupport) {
    return toast.dangerText('Please wait for a reply from the support team.')
  }

  if (ticket.value?.status === 'CLOSED') {
    return toast.dangerText(
      'You cannot send a message to a closed ticket. Please open a new ticket.',
    )
  }

  try {
    const response = await sendMessage(
      ticket.value?.uuid,
      newMessage,
      props.isSupport,
    )
    if (response.status === 'fail') {
      toast.danger(response)
      if (response.error.status === 404) {
        supportStore.tickets.find((t) => t.uuid === uuid).status = 'CLOSED'
      }
      return
    }
    try {
      socket.send(JSON.stringify(newMessage))
    } catch (error) {
      console.error('Error sending message to websocket:', error)
      toast.danger(error as any)
    }
    updateLocalConversations(newMessage)
    supportStore.tickets.find((t) => t.uuid === uuid).status = props.isSupport
      ? 'REPLIED'
      : 'OPEN'
  } catch (error) {
    toast.danger(error as any)
  }
}

function updateLocalConversations(newMessage: unknown) {
  let messagesArray = Object.values(supportStore.chat.messages)
  messagesArray.push(newMessage)
  supportStore.chat.messages = { ...messagesArray }
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
    const messages = chat.value?.messages || []
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

function timeAgo(date: any) {
  const now = new Date()
  const secondsPast: any = (now.getTime() - date.getTime()) / 1000

  if (secondsPast < 60) {
    return `${parseInt(secondsPast)} ${
      parseInt(secondsPast) === 1 ? 'second' : 'seconds'
    }`
  }
  if (secondsPast < 3600) {
    return `${parseInt(secondsPast / 60)} ${
      parseInt(secondsPast / 60) === 1 ? 'minute' : 'minutes'
    }`
  }
  if (secondsPast <= 86400) {
    return `${parseInt(secondsPast / 3600)} ${
      parseInt(secondsPast / 3600) === 1 ? 'hour' : 'hours'
    }`
  }
  if (secondsPast > 86400 && secondsPast <= 604800) {
    return `${parseInt(secondsPast / 86400)} ${
      parseInt(secondsPast / 86400) === 1 ? 'day' : 'days'
    }`
  }
  if (secondsPast > 604800 && secondsPast <= 2592000) {
    return `${parseInt(secondsPast / 604800)} ${
      parseInt(secondsPast / 604800) === 1 ? 'week' : 'weeks'
    }`
  }
  if (secondsPast > 2592000) {
    return 'long time'
  }
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

    const newMessage = createNewMessage({
      type: props.isSupport ? 'agent' : 'client',
      text: message.value,
      time: currentTime,
      user_id: client_id.value,
      agent_id: agent_id.value,
      attachments: attachment ? [attachment] : [],
    })

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

    formData.append('user_id', client_id.value)
    formData.append('agent_id', agent_id.value)
    formData.append('type', 'chat')

    const uploadResponse = await useFetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (uploadResponse && uploadResponse.status.value === 'success') {
      const newMessage = createNewMessage({
        type: props.isSupport ? 'agent' : 'client',
        text: '',
        time: new Date().toISOString(),
        user_id: client_id.value,
        agent_id: agent_id.value,
        attachments: uploadResponse.data.value.map((filePath: any) => ({
          type: 'image',
          image: filePath,
          text: '',
        })),
      })

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
      return 'warning'
    case 'OPEN':
      return 'success'
    case 'CLOSED':
      return 'danger'
    case 'REPLIED':
      return 'primary'
    default:
      return 'info'
  }
}

const importance = (importance: string) => {
  switch (importance) {
    case 'LOW':
      return 'info'
    case 'MEDIUM':
      return 'warning'
    case 'HIGH':
      return 'danger'
    default:
      return 'info'
  }
}

const close = async () => {
  try {
    const response = await closeTicket(uuid)
    toast.response(response)
    await supportStore.fetchTickets()
  } catch (error) {
    toast.danger(error as any)
  }
}

const open = async () => {
  try {
    const response = await openTicket(uuid)
    toast.response(response)
    await supportStore.fetchTickets()
  } catch (error) {
    toast.danger(error as any)
  }
}
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
                :to="isSupport ? '/admin/support' : '/user/support'"
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
              <div class="mt-12 space-y-12">
                <div class="flex w-full max-w-md gap-4">
                  <BasePlaceload
                    class="h-8 w-8 shrink-0 rounded-full"
                    :width="32"
                    :height="32"
                  />
                  <div class="grow space-y-2">
                    <BasePlaceload class="h-3 w-full max-w-[14rem] rounded" />
                    <BasePlaceload class="h-3 w-full max-w-[8rem] rounded" />
                  </div>
                </div>
                <div class="flex w-full max-w-md gap-4">
                  <BasePlaceload
                    class="h-8 w-8 shrink-0 rounded-full"
                    :width="32"
                    :height="32"
                  />
                  <div class="grow space-y-2">
                    <BasePlaceload class="h-3 w-full max-w-[16rem] rounded" />
                    <BasePlaceload class="h-3 w-full max-w-[12rem] rounded" />
                  </div>
                </div>
                <div
                  class="ms-auto flex w-full max-w-md flex-row-reverse justify-end gap-4"
                >
                  <BasePlaceload
                    class="h-8 w-8 shrink-0 rounded-full"
                    :width="32"
                    :height="32"
                  />
                  <div class="grow space-y-2">
                    <BasePlaceload
                      class="ms-auto h-3 w-full max-w-[16rem] rounded"
                    />
                    <BasePlaceload
                      class="ms-auto h-3 w-full max-w-[12rem] rounded"
                    />
                  </div>
                </div>
                <div
                  class="ms-auto flex w-full max-w-md flex-row-reverse justify-end gap-4"
                >
                  <BasePlaceload
                    class="h-8 w-8 shrink-0 rounded-full"
                    :width="32"
                    :height="32"
                  />
                  <div class="grow space-y-2">
                    <BasePlaceload
                      class="ms-auto h-3 w-full max-w-[14rem] rounded"
                    />
                    <BasePlaceload
                      class="ms-auto h-3 w-full max-w-[8rem] rounded"
                    />
                  </div>
                </div>
                <div class="flex w-full max-w-md gap-4">
                  <BasePlaceload
                    class="h-8 w-8 shrink-0 rounded-full"
                    :width="32"
                    :height="32"
                  />
                  <div class="grow space-y-2">
                    <BasePlaceload class="h-3 w-full max-w-[14rem] rounded" />
                    <BasePlaceload class="h-3 w-full max-w-[8rem] rounded" />
                  </div>
                </div>
                <div class="flex w-full max-w-md gap-4">
                  <BasePlaceload
                    class="h-8 w-8 shrink-0 rounded-full"
                    :width="32"
                    :height="32"
                  />
                  <div class="grow space-y-2">
                    <BasePlaceload class="h-3 w-full max-w-[16rem] rounded" />
                    <BasePlaceload class="h-3 w-full max-w-[12rem] rounded" />
                  </div>
                </div>
              </div>
            </div>
            <!-- Messages loop -->
            <div
              v-if="chat && chat.messages"
              class="space-y-8"
              ref="SearchElement"
            >
              <div
                v-for="(item, index) in chat?.messages"
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
                      :src="user?.avatar"
                      size="xs"
                    />
                    <BaseAvatar
                      v-else
                      :src="ticket?.user?.avatar || '/img/avatars/1.svg'"
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
                      {{ timeAgo(new Date(item.time)) }} ago
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
        class="ltablet:w-[310px] dark:bg-muted-800 fixed end-0 top-0 z-20 h-full w-[390px] bg-white transition-transform duration-500"
        :class="expanded ? 'translate-x-full' : 'translate-x-0'"
      >
        <div class="flex h-16 w-full items-center justify-between px-8">
          <BaseHeading
            tag="h3"
            size="lg"
            class="text-muted-800 dark:text-white"
          >
            <span>{{ $t('Ticket details') }}</span>
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
            <div class="flex items-center justify-center">
              <div class="flex flex-wrap items-end gap-4">
                <BaseAvatar
                  :src="
                    isSupport
                      ? ticket?.user?.avatar
                      : ticket?.agent?.avatar || '/img/avatars/1.svg'
                  "
                  size="2xl"
                  shape="full"
                />
              </div>
            </div>
            <div class="text-center space-y-5 mt-5" :key="ticket?.status">
              <div class="text-muted-600 dark:text-gray-300">
                <strong>{{ isSupport ? 'Client' : 'Agent' }}: </strong>
                <span class="">
                  {{
                    isSupport
                      ? ticket?.user?.first_name + ' ' + ticket?.user?.last_name
                      : ticket?.chat?.agent !== null
                      ? ticket?.chat?.agent?.first_name +
                        ' ' +
                        ticket?.chat?.agent?.last_name
                      : 'N/A'
                  }}</span
                >
              </div>
              <BaseHeading
                as="h4"
                size="lg"
                weight="semibold"
                class="text-muted-800 dark:text-white"
              >
                Ticket: #{{ ticket?.uuid }}
              </BaseHeading>
              <div class="flex justify-center items-center gap-2">
                <BaseTag :color="status(ticket?.status)" flavor="pastel">
                  {{ ticket?.status }}
                </BaseTag>
                <BaseTag
                  :color="importance(ticket?.importance)"
                  flavor="pastel"
                >
                  {{ ticket?.importance }}
                </BaseTag>
              </div>
              <div class="space-y-1">
                <div
                  class="col-span-2 lg:col-span-1 text-muted-600 dark:text-gray-300"
                >
                  <strong>{{ $t('Subject') }}:</strong>
                  <span class="block md:inline">{{ ticket?.subject }}</span>
                </div>

                <!-- Date created -->
                <div
                  class="col-span-2 lg:col-span-1 text-muted-600 dark:text-gray-300"
                >
                  <strong>{{ $t('Created At') }}:</strong>
                  <span class="block md:inline">{{
                    new Date(ticket?.created_at).toLocaleString()
                  }}</span>
                </div>
              </div>
              <div>
                <BaseButton
                  v-if="ticket?.status !== 'CLOSED'"
                  @click="close()"
                  class="w-full"
                  color="danger"
                >
                  <Icon name="line-md:close" class="h-4 w-4" />
                  <span class="mr-2">{{ $t('Close Ticket') }}</span>
                </BaseButton>
                <BaseButton
                  v-if="isSupport && ticket?.status === 'CLOSED'"
                  @click="open()"
                  class="w-full"
                  color="success"
                >
                  <Icon name="line-md:confirm" class="h-4 w-4" />
                  <span class="mr-2">{{ $t('Open Ticket') }}</span>
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <TairoPanels />

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
