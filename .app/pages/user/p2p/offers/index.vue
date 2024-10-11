<script setup lang="ts">
import { useUserP2POffersStore } from '~~/store/extensions/p2p/user/offers'
import type { P2POffer } from '~~/types'

definePageMeta({
  title: 'P2P Offers',
})

const p2pOfferStore = useUserP2POffersStore()
const { updateP2POffer } = useP2P()
const route = useRoute()

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const items = computed(() =>
  p2pOfferStore.userOffers
    .filter((offer) => offer.currency?.includes(filter.value))
    .map((offer) => {
      const reviews = offer.reviews || []
      const totalRating = reviews.reduce(
        (acc, review) => acc + review.rating,
        0,
      )
      const avgRating = reviews.length ? totalRating / reviews.length : 0
      return {
        ...offer,
        avgRating,
      }
    }),
)

const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

onMounted(async () => {
  if (p2pOfferStore.userOffers.length === 0) {
    p2pOfferStore.loading = true
    await p2pOfferStore.fetchUserP2POffers()
    p2pOfferStore.loading = false
  }
})

const { toast } = useUtils()

// Update modal
const isUpdateOpen = ref(false)
const isUpdating = ref(false)
const selectedItem = ref<P2POffer | null>(null)

function openUpdateModal(offer: P2POffer) {
  selectedItem.value = offer
  isUpdateOpen.value = true
}

async function updateOffer() {
  if (!selectedItem.value) return
  isUpdating.value = true
  try {
    const response = await updateP2POffer(
      selectedItem.value?.uuid,
      selectedItem.value.status === 'PENDING' ? 'ACTIVE' : 'PENDING',
    )
    toast.response(response)
    if (response.status === 'success') {
      await p2pOfferStore.fetchUserP2POffers()
      await p2pOfferStore.fetchP2POffers()
    }
  } catch (error) {
    toast.danger(error)
  }
  isUpdateOpen.value = false
  isUpdating.value = false
  selectedItem.value = null
}

const statusClass = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'ACTIVE':
      return 'success'
    case 'COMPLETED':
      return 'success'
    case 'CANCELLED':
      return 'danger'
    default:
      return 'info'
  }
}

function starType(index: number, avgRating: any): 'full' | 'half' | 'empty' {
  const ratingFloor = Math.floor(avgRating)
  if (index <= ratingFloor) {
    return 'full'
  } else if (index === ratingFloor + 1 && avgRating % 1 >= 0.5) {
    return 'half'
  } else {
    return 'empty'
  }
}
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          :classes="{ wrapper: 'w-full sm:w-auto' }"
          placeholder="Filter offers..."
        />
        <BaseSelect
          v-model="perPage"
          label=""
          :classes="{ wrapper: 'w-full sm:w-40' }"
        >
          <option :value="10">10 {{ $t('per page') }}</option>
          <option :value="25">25 {{ $t('per page') }}</option>
          <option :value="50">50 {{ $t('per page') }}</option>
          <option :value="100">100 {{ $t('per page') }}</option>
        </BaseSelect>
      </template>
      <template #right>
        <NuxtLink to="/user/p2p/offers/create">
          <BaseButton color="primary" block>
            <Icon name="line-md:plus" class="h-4 w-4 mr-2" />
            {{ $t('Create Offer') }}
          </BaseButton>
        </NuxtLink>
      </template>
      <div>
        <template v-if="!p2pOfferStore.loading && paginatedItems.length === 0">
          <BasePlaceholderPage
            :title="
              filter && filter !== '' ? 'No matching results' : 'No results'
            "
            :subtitle="
              filter && filter !== ''
                ? 'Looks like we couldn\'t find any matching results for your search terms. Try other search terms.'
                : 'Looks like we don\'t have any offers here yet.'
            "
          >
            <template #image>
              <img
                class="block dark:hidden"
                src="/img/illustrations/placeholders/flat/placeholder-search-4.svg"
                alt="Placeholder image"
              />
              <img
                class="hidden dark:block"
                src="/img/illustrations/placeholders/flat/placeholder-search-4-dark.svg"
                alt="Placeholder image"
              />
            </template>
          </BasePlaceholderPage>
        </template>
        <div v-else class="w-full">
          <TairoFlexTable class="pt-5">
            <TableFlexTableRow
              v-for="(item, index) in paginatedItems"
              :key="item.id"
              spaced
            >
              <template #start>
                <TableFlexTableStart
                  label="Offer"
                  :hide-label="index > 0"
                  :logo="`/img/crypto/${item.currency.toLowerCase()}.png`"
                  :title="`${item.currency} (${item.wallet_type} Wallet)`"
                  :subtitle="item.uuid"
                />
              </template>
              <template #end>
                <TableFlexTableCell
                  label="Available"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full text-xs"
                  >{{ item.amount }}
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="Price"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full text-xs"
                  >{{ item.price }}
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="Rating"
                  :hide-label="index > 0"
                  class="w-24 xs:w-full text-xs"
                >
                  <span
                    :data-nui-tooltip="`${item.avgRating.toFixed(1)} (${
                      item.reviews.length
                    } ${item.reviews.length > 1 ? 'reviews' : 'review'})`"
                    class="flex"
                  >
                    <span v-for="i in 5" :key="i">
                      <Icon
                        v-if="starType(i, item.avgRating) === 'full'"
                        name="uim:star"
                        class="w-4 h-4 text-yellow-400"
                      />
                      <Icon
                        v-else-if="starType(i, item.avgRating) === 'half'"
                        name="uim:star-half-alt"
                        class="w-4 h-4 text-yellow-400"
                      />
                      <Icon
                        v-else
                        name="uim:star"
                        class="w-4 h-4 text-gray-300"
                      /> </span
                  ></span>
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="Status"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                >
                  <BaseTag
                    :color="statusClass(item.status)"
                    flavor="pastel"
                    condensed
                    >{{ item.status }}</BaseTag
                  >
                </TableFlexTableCell>
                <TableFlexTableCell label="Actions" :hide-label="index > 0">
                  <BaseDropdown
                    flavor="context"
                    label="Dropdown"
                    orientation="end"
                  >
                    <BaseDropdownItem
                      :to="`/user/p2p/offers/${item.uuid}/reviews`"
                      :title="`Reviews`"
                    >
                      <template #start>
                        <Icon
                          name="line-md:star-twotone"
                          class="h-4 w-4 mr-2"
                        />
                      </template>
                    </BaseDropdownItem>
                    <BaseDropdownItem
                      @click="openUpdateModal(item)"
                      :title="`${
                        item.status === 'PENDING' ? 'Activate' : 'Disable'
                      } Offer`"
                    >
                      <template #start>
                        <Icon
                          :name="`mdi:eye${
                            item.status === 'PENDING' ? '' : '-off'
                          }`"
                          class="h-4 w-4 mr-2"
                        />
                      </template>
                    </BaseDropdownItem>

                    <BaseDropdownItem
                      :to="`/user/p2p/offers/edit/${item.uuid}`"
                      title="Edit Offer"
                    >
                      <template #start>
                        <Icon
                          name="line-md:edit-twotone"
                          class="h-4 w-4 mr-2"
                        />
                      </template>
                    </BaseDropdownItem>
                  </BaseDropdown>
                </TableFlexTableCell>
              </template>
            </TableFlexTableRow>
          </TairoFlexTable>
        </div>

        <div class="mt-6">
          <BasePagination
            v-if="items.length > perPage"
            :total-items="items.length"
            :current-page="page"
            :item-per-page="perPage"
          />
        </div>
      </div>
    </TairoContentWrapper>

    <TairoModal
      :open="isUpdateOpen"
      size="sm"
      @close="() => (isUpdateOpen = false)"
    >
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Update Offer') }}
          </h3>
          <BaseButtonClose @click="() => (isUpdateOpen = false)" />
        </div>
      </template>

      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Are you sure?') }}
          </h3>
          <p
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5 mb-3"
          >
            {{
              `Do you really want to ${
                selectedItem?.status === 'PENDING' ? 'activate' : 'disable'
              } this offer?`
            }}
          </p>
        </div>
      </div>

      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="() => (isUpdateOpen = false)">
              {{ $t('Cancel') }}
            </BaseButton>
            <BaseButton
              color="primary"
              flavor="solid"
              @click="updateOffer"
              :disabled="isUpdating"
              :loading="isUpdating"
            >
              {{ $t('Update') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
