<script setup lang="ts">
import { useUserP2POffersStore } from '~~/store/extensions/p2p/user/offers'

definePageMeta({
  title: 'P2P Offers',
})

const p2pOfferStore = useUserP2POffersStore()
const route = useRoute()

const router = useRouter()
const oldFilter = ref('')
const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const items = computed(() =>
  p2pOfferStore.offers
    .filter((offer) => {
      // Date Range Filter
      if (
        fromDate.value &&
        new Date(offer.created_at) < new Date(fromDate.value)
      )
        return false
      if (toDate.value && new Date(offer.created_at) > new Date(toDate.value))
        return false

      // Currency Filter
      if (
        filter.value &&
        filter.value !== '' &&
        filter.value !== undefined &&
        filter.value !== oldFilter.value
      ) {
        router.push({
          query: {
            ...route.query,
            page: '1',
            filter: filter.value,
          },
        })
        oldFilter.value = filter.value
      }
      return !filter.value || offer.currency?.includes(filter.value)
    })
    .sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    .map((offer) => {
      const reviews = offer.reviews || []
      const totalRating = reviews.reduce(
        (acc, review) => acc + review.rating,
        0,
      )
      const avgRating = reviews.length ? totalRating / reviews.length : 0
      return {
        ...offer,
        avgRating, // Adding the average rating to each offer
      }
    }),
)
const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

onMounted(async () => {
  if (p2pOfferStore.offers.length === 0) {
    p2pOfferStore.loading = true
    await p2pOfferStore.fetchP2POffers()
    p2pOfferStore.loading = false
  }
})

const filters = ref(false)
const fromDate = ref('')
const toDate = ref('')
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
  <div class="relative">
    <div
      class="bg-primary-800 flex flex-col items-center rounded-2xl p-4 sm:flex-row w-full mb-10"
    >
      <div
        class="relative w-[320px]"
        :class="{
          'h-[170px]': $viewport.isLessThan('sm'),
          'h-[175px]': $viewport.isGreaterOrEquals('sm'),
        }"
      >
        <LottieTransfer
          classes="pointer-events-none absolute -top-6 start-3 sm:-start-5 sm:-top-8"
          height="280px"
        />
      </div>
      <div class="mt-20 grow sm:mt-0">
        <div
          class="pb-4 text-center sm:pb-0 sm:text-left max-w-xs md:max-w-md lg:max-w-2xl"
        >
          <BaseHeading tag="h1" class="mb-2 text-white opacity-90">
            <span>
              {{ $t('Check out our latest offers') }}
              <span class="text-3xl">📈</span>
            </span>
          </BaseHeading>
          <BaseParagraph size="sm" class="text-white opacity-70">
            <span>
              {{
                $t(
                  'We have a wide range of offers available for you to choose from. Check them out below.',
                )
              }}
            </span>
          </BaseParagraph>
        </div>
      </div>
    </div>
    <div class="relative pt-2">
      <TairoContentWrapper>
        <template #left>
          <div class="w-full flex gap-2 xs:flex-col sm:flex-row">
            <BaseInput
              v-model="filter"
              icon="lucide:search"
              :classes="{ wrapper: 'w-full sm:w-auto' }"
              placeholder="Filter currency..."
            />
            <BaseButton @click="filters = !filters" color="muted" block>
              <Icon
                v-if="filters"
                name="line-md:arrow-up"
                class="h-4 w-4 mr-2"
              />
              <Icon v-else name="line-md:arrow-down" class="h-4 w-4 mr-2" />
              {{ $t('Filters') }}
            </BaseButton>
          </div>
        </template>
        <template #right>
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
        <div>
          <TransitionGroup
            enter-active-class="transform-gpu"
            enter-from-class="opacity-0 -translate-y-4"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="absolute transform-gpu"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-4"
          >
            <BaseCard
              :class="`grid gap-4 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-6 p-5`"
              v-if="filters"
            >
              <!-- Date Range Inputs -->
              <BaseInput v-model="fromDate" type="date" label="From" />
              <BaseInput v-model="toDate" type="date" label="To" />
            </BaseCard>
          </TransitionGroup>
          <template
            v-if="!p2pOfferStore.loading && paginatedItems.length === 0"
          >
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
                    >{{ item.amount }} {{ item.currency }}
                  </TableFlexTableCell>
                  <TableFlexTableCell
                    label="Price"
                    :hide-label="index > 0"
                    class="w-20 xs:w-full text-xs"
                    >{{ item.price }} {{ item.payment_method?.currency }}
                  </TableFlexTableCell>
                  <TableFlexTableCell
                    label="Rating"
                    :hide-label="index > 0"
                    class="w-20 xs:w-full text-xs"
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
                  <TableFlexTableCell label="Actions" :hide-label="index > 0">
                    <TairoButtonIcon
                      :to="`/user/p2p/offers/${item.uuid}`"
                      color="info"
                      condensed
                    >
                      <Icon name="mdi-eye" class="h-4 w-4" />
                    </TairoButtonIcon>
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
    </div>
    <Faqs category="P2P" />
  </div>
</template>
