<script setup lang="ts">
import { useAdminP2PDisputesStore } from '~~/store/extensions/p2p/admin/disputes'
import 'vue3-emoji-picker/css'

definePageMeta({
  permissions: ['View P2P Dispute Details'],
  title: 'P2P Disputes',
})

const p2pDisputeStore = useAdminP2PDisputesStore()
const route = useRoute()
const { id } = route.params
const dispute = computed(() => p2pDisputeStore.dispute)

const trade = computed(() => dispute.value?.trade)

const isSeller = (
  message: {
    type: string
    user_id: number
    seller_id: number
  },
  senderId: number,
) => {
  const sellerIsSeller =
    (message.seller_id === senderId && message.type === 'seller') ||
    (message.seller_id !== senderId && message.type === 'buyer')
  return sellerIsSeller
}

const isLoading = ref(false)
onMounted(async () => {
  isLoading.value = true
  await p2pDisputeStore.fetchP2PDispute(id)
  isLoading.value = false
})

const { toast } = useUtils()

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

const disputeStatus = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'IN_PROGRESS':
      return 'info'
    case 'RESOLVED':
      return 'success'
    case 'CANCELLED':
      return 'danger'
    default:
      return 'default'
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

const {
  cancelAdminP2PTrade,
  resolveAdminP2PDispute,
  completeAdminP2PTrade,
  markAdminP2PDisputeAsResolved,
} = useP2P()

const isCancellingOpen = ref(false)
const isCancellingLoading = ref(false)
const cancelDispute = async () => {
  isCancellingLoading.value = true
  try {
    const response = await cancelAdminP2PTrade(dispute.value?.trade_id)
    isCancellingOpen.value = false
    toast.response(response)
    if (response.status === 'success') {
      await p2pDisputeStore.fetchP2PDispute(id)
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isCancellingLoading.value = false
}

const isResolvingOpen = ref(false)
const disputeResolution = ref('')
const isResolvingLoading = ref(false)

const resolve = async () => {
  isResolvingLoading.value = true
  try {
    const response = await resolveAdminP2PDispute(id, disputeResolution.value)
    isResolvingOpen.value = false
    toast.response(response)
    if (response.status === 'success') {
      await p2pDisputeStore.fetchP2PDispute(id)
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isResolvingLoading.value = false
  disputeResolution.value = ''
}

const isCompletingOpen = ref(false)
const isCompletingLoading = ref(false)

const release = async () => {
  isCompletingLoading.value = true
  try {
    const response = await completeAdminP2PTrade(dispute.value?.trade_id)
    isCompletingOpen.value = false
    toast.response(response)
    if (response.status === 'success') {
      await p2pDisputeStore.fetchP2PDispute(id)
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isCompletingLoading.value = false
}

const isMarkingDisputeAsResolved = ref(false)
const isMarkingDisputeAsResolvedLoading = ref(false)
const markDisputeResolved = async () => {
  isMarkingDisputeAsResolved.value = true
  try {
    const response = await markAdminP2PDisputeAsResolved(id)
    isMarkingDisputeAsResolvedLoading.value = false
    toast.response(response)
    if (response.status === 'success') {
      await p2pDisputeStore.fetchP2PDispute(id)
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isMarkingDisputeAsResolved.value = false
}
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseHeading size="lg">
          {{ $t('Dispute Details') }} #{{ dispute?.id }}
        </BaseHeading>
      </template>
      <template #right>
        <BaseButton
          type="button"
          color="muted"
          class="hover:bg-gray-300 dark:hover:bg-gray-800"
          to="/admin/extensions/p2p/disputes"
        >
          <Icon name="line-md:chevron-left" class="h-4 w-4 mr-2" />
          {{ $t('Back') }}
        </BaseButton>
      </template>
      <div class="mb-3 grid grid-cols-1 md:grid-cols-2 gap-2">
        <BaseCard
          class="p-2 grid gap-2 grid-cols-2"
          v-if="['PENDING', 'PAID', 'DISPUTE_OPEN'].includes(trade?.status)"
        >
          <template v-if="['PENDING', 'IN_PROGRESS'].includes(dispute?.status)">
            <BaseButton
              v-if="['DISPUTE_OPEN'].includes(trade?.status)"
              @click="isResolvingOpen = true"
              class="w-full"
              color="primary"
            >
              <Icon name="line-md:alert-circle" class="h-4 w-4" />
              <span class="mr-2">{{
                dispute?.resolution
                  ? $t('Edit Resolution')
                  : $t('Resolve Dispute')
              }}</span>
            </BaseButton>

            <BaseButton
              v-if="['DISPUTE_OPEN'].includes(trade?.status)"
              @click="isMarkingDisputeAsResolved = true"
              class="w-full"
              color="success"
              :loading="isMarkingDisputeAsResolved"
            >
              <Icon
                name="line-md:clipboard-to-clipboard-check-transition"
                class="h-4 w-4"
              />
              <span class="mr-2">{{ $t('Close Dispute') }}</span>
            </BaseButton></template
          >
          <span v-else class="text-gray-500 col-span-2 px-2">
            {{ $t('This dispute has been resolved.') }}
          </span>
        </BaseCard>
        <BaseCard
          class="p-2 grid grid-cols-2 gap-2"
          v-if="['PENDING', 'PAID', 'DISPUTE_OPEN'].includes(trade?.status)"
        >
          <BaseButton
            v-if="['PENDING', 'PAID', 'DISPUTE_OPEN'].includes(trade?.status)"
            @click="isCancellingOpen = true"
            class="w-full"
            color="danger"
          >
            <Icon name="line-md:close" class="h-4 w-4" />
            <span class="mr-2">{{ $t('Cancel Trade') }}</span>
          </BaseButton>
          <BaseButton
            v-if="['DISPUTE_OPEN', 'PAID'].includes(trade?.status)"
            @click="isCompletingOpen = true"
            class="w-full"
            color="success"
          >
            <Icon name="mdi:account-payment" class="h-4 w-4" />
            <span class="mr-2">{{ $t('Complete Trade') }}</span>
          </BaseButton>
        </BaseCard>
      </div>
      <div class="grid gap-3 gric-cols-1 md:grid-cols-2">
        <BaseCard>
          <div class="space-y-2 py-5">
            <div class="flex justify-between items-center gap-2 px-5">
              <strong class="text-muted-600 dark:text-gray-300"
                >Seller:
              </strong>
              <span>
                {{
                  trade?.seller?.first_name + ' ' + trade?.seller?.last_name
                }}</span
              >
            </div>
            <div class="flex justify-between items-center gap-2 px-5">
              <strong class="text-muted-600 dark:text-gray-300">Buyer: </strong>
              <span>
                {{
                  trade?.user?.first_name + ' ' + trade?.user?.last_name
                }}</span
              >
            </div>
            <div class="flex justify-between items-center gap-2 px-5">
              <span class="text-muted-600 dark:text-gray-300">
                <strong>{{ $t('Trade ID') }}:</strong>
              </span>
              <span class="text-xs">#{{ trade?.uuid }}</span>
            </div>
            <div class="flex justify-between items-center gap-2 px-5">
              <span class="text-muted-600 dark:text-gray-300">
                <strong>{{ $t('Offer ID') }}:</strong>
              </span>
              <span class="text-xs">#{{ trade?.offer?.uuid }}</span>
            </div>
            <div class="flex justify-between items-center gap-2 px-5">
              <span class="text-muted-600 dark:text-gray-300">
                <strong>{{ $t('Trade Status') }}:</strong>
              </span>
              <BaseTag :color="status(trade?.status)" flavor="pastel">
                {{ trade?.status }}
              </BaseTag>
            </div>
            <div class="flex justify-between items-center gap-2 px-5">
              <span class="text-muted-600 dark:text-gray-300">
                <strong>{{ $t('Amount') }}:</strong>
              </span>
              <span> {{ trade?.amount }} {{ trade?.offer?.currency }} </span>
            </div>
            <div class="flex justify-between items-center gap-2 px-5">
              <strong class="text-muted-600 dark:text-gray-300"
                >{{ $t('Paid At') }}:</strong
              >
              <span class="block md:inline">{{
                new Date(trade?.created_at).toLocaleString()
              }}</span>
            </div>
            <div class="flex justify-between items-center gap-2 px-5">
              <strong class="text-muted-600 dark:text-gray-300"
                >{{ $t('Payment Method') }}:</strong
              >
              <span class="block md:inline">{{
                trade?.offer?.payment_method?.name
              }}</span>
            </div>
            <div
              class="flex justify-between items-start gap-2 flex-col border-t border-b pb-2 border-gray-300 dark:border-gray-700 pt-2 px-5"
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
              class="flex justify-between items-start gap-2 flex-col px-5"
              v-if="trade?.tx_hash"
            >
              <strong class="text-muted-600 dark:text-gray-300"
                >{{ $t('Buyer Transaction ID') }}:</strong
              >
              <span class="block md:inline">{{ trade?.tx_hash }}</span>
            </div>
            <div
              class="flex justify-between items-center gap-2 border-t border-gray-300 dark:border-gray-700 pt-2 px-5"
            >
              <span class="text-muted-600 dark:text-gray-300">
                <strong>{{ $t('Dispute Status') }}:</strong>
              </span>
              <BaseTag :color="disputeStatus(dispute?.status)" flavor="pastel">
                {{ dispute?.status }}
              </BaseTag>
            </div>
            <div
              class="flex justify-between items-start gap-2 flex-col px-5"
              v-if="dispute?.reason"
            >
              <strong class="text-muted-600 dark:text-gray-300"
                >{{ $t('Dispute Reason') }}:</strong
              >
              <span class="block md:inline">{{ dispute?.reason }}</span>
            </div>
            <div
              class="flex justify-between items-start gap-2 flex-col px-5"
              v-if="dispute?.resolution"
            >
              <strong class="text-muted-600 dark:text-gray-300"
                >{{ $t('Dispute Resolution') }}:</strong
              >
              <span class="block md:inline">{{ dispute?.resolution }}</span>
            </div>
          </div>
        </BaseCard>
        <BaseCard
          ref="ChatBody"
          class="relative h-full w-full p-5 overflow-y-auto"
        >
          <!-- Loader-->
          <div
            class="bg-muted-100 dark:bg-muted-900 pointer-events-none absolute inset-0 z-10 h-full w-full p-8 transition-opacity duration-300 opacity-0"
          >
            <ChatLoader />
          </div>
          <!-- Messages loop -->
          <div
            v-if="trade && trade?.messages"
            class="space-y-8"
            ref="SearchElement"
          >
            <div
              v-for="(item, index) in trade?.messages"
              :key="index"
              :data-index="index"
              class="relative flex w-full gap-4"
              :class="[
                isSeller(item, trade?.seller?.id)
                  ? 'flex-row-reverse'
                  : 'flex-row',
                item.type === 'separator' ? 'justify-center' : '',
              ]"
            >
              <template v-if="item.type !== 'separator'">
                <div class="shrink-0">
                  <BaseAvatar
                    v-if="isSeller(item, trade?.seller?.id)"
                    :src="trade?.seller?.avatar"
                    size="xs"
                  />
                  <BaseAvatar
                    v-else
                    :src="trade?.user?.avatar || '/img/avatars/1.svg'"
                    size="xs"
                  />
                </div>
                <div class="flex max-w-md flex-col">
                  <template v-if="item.attachments?.length > 0">
                    <!-- For single image -->
                    <div
                      v-if="item.attachments.length === 1"
                      :class="
                        isSeller(item, trade?.seller?.id)
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
                            isSeller(item, trade?.seller?.id)
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
                              isSeller(item, trade?.seller?.id)
                                ? 'justify-end'
                                : 'justify-start'
                            "
                          >
                            <div
                              v-if="isSmallImage(item.attachments[0].image)"
                              class="flex max-w-sm rounded-2xl bg-white dark:bg-muted-800 p-2 overflow-hidden"
                              :class="
                                isSeller(item, trade?.seller?.id)
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
                                isSeller(item, trade?.seller?.id)
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
                        isSeller(item, trade?.seller?.id)
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
                      isSeller(item, trade?.seller?.id)
                        ? 'rounded-se-none'
                        : 'rounded-ss-none'
                    "
                  >
                    <p class="font-sans text-sm">{{ item.text }}</p>
                  </div>
                  <div
                    class="text-muted-400 mt-1 font-sans text-xs"
                    :class="
                      isSeller(item, trade?.seller?.id)
                        ? 'text-right'
                        : 'text-left'
                    "
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
          <div v-else-if="isLoading" class="space-y-5">
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
          </div>
          <div
            v-else-if="trade && !trade.messages"
            class="flex flex-col items-center justify-center h-full"
          >
            <div class="flex flex-col items-center justify-center gap-2">
              <Icon
                name="gridicons:chat"
                class="h-12 w-12 text-muted-400 dark:text-muted-600"
              />
              <span class="text-muted-400 dark:text-muted-600">
                {{ $t('No messages yet.') }}
              </span>
            </div>
          </div>
        </BaseCard>
      </div>
    </TairoContentWrapper>

    <TairoModal
      :open="isResolvingOpen"
      size="sm"
      @close="isResolvingOpen = false"
    >
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Resolve Dispute') }}
          </h3>
          <BaseButtonClose @click="isResolvingOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <BaseTextarea
            v-model="disputeResolution"
            shape="curved"
            placeholder="Resolution"
            label="Resolution"
            :disabled="isResolvingLoading"
          />
          <small
            ><span class="text-muted-400 dark:text-muted-600">
              {{
                $t(
                  'Please provide a resolution to the dispute. This will be sent to the buyer and seller.',
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
              @click="resolve"
              :disabled="isResolvingLoading"
              :loading="isResolvingLoading"
            >
              <span>{{ $t('Submit') }}</span>
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <TairoModal
      :open="isCompletingOpen"
      size="sm"
      @close="isCompletingOpen = false"
    >
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Complete Trade') }}
          </h3>
          <BaseButtonClose @click="isCompletingOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <span class="text-muted-400 dark:text-muted-600">
            {{
              $t(
                'Are you sure you want to complete the trade and release the funds to the buyer and resolve the dispute? This action cannot be undone.',
              )
            }}
          </span>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton
              color="success"
              flavor="solid"
              @click="release"
              :disabled="isCompletingLoading"
              :loading="isCompletingLoading"
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
              @click="cancelDispute"
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
      :open="isMarkingDisputeAsResolved"
      size="sm"
      @close="isMarkingDisputeAsResolved = false"
      ><template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Mark Dispute as Resolved') }}
          </h3>
          <BaseButtonClose @click="isMarkingDisputeAsResolved = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <span class="text-muted-400 dark:text-muted-600">
            {{
              $t(
                'Are you sure you want to close the dispute? This action cannot be undone.',
              )
            }}
          </span>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton
              color="success"
              flavor="solid"
              @click="markDisputeResolved"
              :disabled="isMarkingDisputeAsResolvedLoading"
              :loading="isMarkingDisputeAsResolvedLoading"
            >
              <span>{{ $t('Submit') }}</span>
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <VueEasyLightbox
      :visible="isLightboxOpen"
      :imgs="[currentImage]"
      @hide="closeLightbox"
    ></VueEasyLightbox>
  </div>
</template>
