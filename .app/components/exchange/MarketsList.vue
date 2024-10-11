<script setup lang="ts">
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
const props = defineProps<{
  list: Array<any>
  isLoggedIn: boolean
  uuid: string
  isFavorite?: boolean
}>()
const marketStore = useMarketStore()

// State
const searchTerm = ref('')
const filter = ref(0)
const route = useRoute()
const startUrl = route.path.split('/')[1]
const markets = computed(() => {
  try {
    if (!props.list) return []

    // Existing code for filtering based on searchTerm.
    const filteredList = searchTerm.value
      ? props.list.filter((e) =>
          e.symbol.toUpperCase().includes(searchTerm.value.toUpperCase()),
        )
      : props.list

    // Add this line to filter out markets without both base and quote currencies.
    const listWithCurrencies = filteredList.filter(
      (e) => e.symbol && e.symbol.includes('/'),
    )

    const sortedList = [...listWithCurrencies]
    const sortFunctions = [
      (a: any, b: any) => a.symbol.localeCompare(b.symbol),
      (a: any, b: any) => b.symbol.localeCompare(a.symbol),
      (a: any, b: any) => b.price - a.price,
      (a: any, b: any) => a.price - b.price,
      (a: any, b: any) => b.change - a.change,
      (a: any, b: any) => a.change - b.change,
    ]

    return filter.value
      ? sortedList.sort(sortFunctions[filter.value - 1])
      : sortedList
  } catch (error) {
    console.error(error)
  }
})

// Watchers
watch([searchTerm, filter], () => {
  markets.value
})

const { createWatchlist } = useExchange()
const { toast } = useUtils()

const addToWatchlist = async (symbol: string, type: string) => {
  try {
    await createWatchlist(symbol, type === 'AI-TRADING' ? 'AI_TRADING' : type)
    await marketStore.fetchWatchlists()
  } catch (error) {
    toast.danger(error as any)
  }
}

const isPractice = computed(() => route.query.isPractice === 'true')
const watchlistType = computed(() =>
  route.path.split('/')[1].toUpperCase() === 'AI-TRADING'
    ? 'AI_TRADING'
    : route.path.split('/')[1].toUpperCase(),
)

const isWatchlisted = (symbol: string) => {
  return marketStore.watchlists.some(
    (e) => e.symbol === symbol && e.type === watchlistType.value,
  )
}

const router = useRouter()
const marketClick = (symbol: string) => {
  marketStore.selectMarketBySymbol(symbol)
  const queryParam = isPractice.value ? { isPractice: 'true' } : {}
  router.push({
    path: `/${startUrl}/${symbol}`,
    query: queryParam,
  })
}
</script>
<template>
  <div>
    <div class="mb-3 flex items-center">
      <label for="simple-search" class="sr-only">{{ $t('Search') }}</label>
      <div class="relative w-full">
        <div
          class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
        >
          <svg
            aria-hidden="true"
            class="h-4 w-4 text-gray-500 dark:text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <input
          id="simple-search"
          v-model="searchTerm"
          type="text"
          class="block w-full rounded border border-gray-300 bg-gray-50 p-1 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          placeholder="Search"
        />
      </div>
    </div>
    <div class="mb-2 flex justify-between text-start text-xs w-full">
      <a
        class="flex items-center w-[45%]"
        @click="
          filter != 1
            ? filter == 2
              ? (filter = 0)
              : (filter = 1)
            : (filter = 2)
        "
      >
        <div class="flex flex-col">
          <Icon
            class="h-3 w-3"
            :class="filter == 1 ? 'text-yellow-500' : ''"
            style="line-height: 0px !important"
            :name="
              filter == 1
                ? 'fluent:caret-up-12-filled'
                : 'fluent:caret-up-12-regular'
            "
          />
          <Icon
            class="h-3 w-3"
            :class="filter == 2 ? 'text-yellow-500' : ''"
            style="line-height: 0px !important"
            :name="
              filter == 2
                ? 'fluent:caret-down-12-filled'
                : 'fluent:caret-down-12-regular'
            "
          />
        </div>
        <span class="pl-1">{{ $t('Market') }}</span>
      </a>
      <a
        class="flex items-center w-[35%]"
        @click="
          filter != 3
            ? filter == 4
              ? (filter = 0)
              : (filter = 3)
            : (filter = 4)
        "
      >
        <div class="flex flex-col">
          <Icon
            class="h-3 w-3"
            :class="filter == 3 ? 'text-yellow-500' : ''"
            style="line-height: 0px !important"
            :name="
              filter == 3
                ? 'fluent:caret-up-12-filled'
                : 'fluent:caret-up-12-regular'
            "
          />
          <Icon
            class="h-3 w-3"
            :class="filter == 4 ? 'text-yellow-500' : ''"
            style="line-height: 0px !important"
            :name="
              filter == 4
                ? 'fluent:caret-down-12-filled'
                : 'fluent:caret-down-12-regular'
            "
          />
        </div>
        <span class="pl-1">{{ $t('Price') }}</span>
      </a>
      <a
        class="flex items-center w-[20%] justify-end"
        @click="
          filter != 5
            ? filter == 6
              ? (filter = 0)
              : (filter = 5)
            : (filter = 6)
        "
      >
        <div class="flex flex-col">
          <Icon
            class="h-3 w-3"
            :class="filter == 5 ? 'text-yellow-500' : ''"
            style="line-height: 0px !important"
            :name="
              filter == 5
                ? 'fluent:caret-up-12-filled'
                : 'fluent:caret-up-12-regular'
            "
          />
          <Icon
            class="h-3 w-3"
            :class="filter == 6 ? 'text-yellow-500' : ''"
            style="line-height: 0px !important"
            :name="
              filter == 6
                ? 'fluent:caret-down-12-filled'
                : 'fluent:caret-down-12-regular'
            "
          />
        </div>
        <span class="pl-1">{{ $t('Change') }} %</span>
      </a>
    </div>
    <RecycleScroller
      v-slot="{ item }"
      class="h-72 text-xs"
      style="margin-right: -10px"
      :items="markets"
      :item-size="22"
      key-field="symbol"
    >
      <div class="flex justify-between text-start">
        <div class="flex items-center justify-start gap-2 w-[45%]">
          <Icon
            v-if="isLoggedIn"
            @click.prevent="addToWatchlist(item.symbol, watchlistType)"
            :name="
              isFavorite || isWatchlisted(item.symbol)
                ? 'ph:star-fill'
                : 'ph:star-light'
            "
            class="h-4 w-4 cursor-pointer"
            :class="{
              'hover:text-danger-500 text-yellow-500':
                isFavorite || isWatchlisted(item.symbol),
              'hover:text-yellow-500': !isFavorite,
            }"
          />
          <span @click="marketClick(item.symbol)" class="cursor-pointer">
            <span class="text-gray-800 dark:text-gray-200 fw-bold">{{
              isFavorite || item.is_eco
                ? item.symbol.split('/')[0]
                : item.metadata.base
            }}</span
            ><span class="text-gray-500 dark:text-gray-500 fw-bold"
              >/{{
                isFavorite || item.is_eco
                  ? item.symbol.split('/')[1]
                  : item.metadata.quote
              }}</span
            >
          </span>
        </div>
        <span class="text-left w-[35%]" :class="item.priceStatus">{{
          item.price
        }}</span>
        <span class="text-end pr-2 w-[20%]" :class="item.changeStatus">{{
          item.change
        }}</span>
      </div>
    </RecycleScroller>
  </div>
</template>
<style>
.vue-recycle-scroller {
  position: relative;
}
.vue-recycle-scroller.direction-vertical:not(.page-mode) {
  overflow-y: auto;
}
.vue-recycle-scroller.direction-horizontal:not(.page-mode) {
  overflow-x: auto;
}
.vue-recycle-scroller.direction-horizontal {
  display: flex;
}
.vue-recycle-scroller__slot {
  flex: auto 0 0;
}
.vue-recycle-scroller__item-wrapper {
  flex: 1;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}
.vue-recycle-scroller.ready .vue-recycle-scroller__item-view {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
}
.vue-recycle-scroller.direction-vertical .vue-recycle-scroller__item-wrapper {
  width: 100%;
}
.vue-recycle-scroller.direction-horizontal .vue-recycle-scroller__item-wrapper {
  height: 100%;
}
.vue-recycle-scroller.ready.direction-vertical
  .vue-recycle-scroller__item-view {
  width: 100%;
}
.vue-recycle-scroller.ready.direction-horizontal
  .vue-recycle-scroller__item-view {
  height: 100%;
}
.resize-observer[data-v-b329ee4c] {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  pointer-events: none;
  display: block;
  overflow: hidden;
  opacity: 0;
}
.resize-observer[data-v-b329ee4c] object {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: -1;
}
</style>
