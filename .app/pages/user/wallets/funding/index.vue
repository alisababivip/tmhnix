<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useEcosystemWalletStore } from '~~/store/extensions/ecosystem/wallets/user'
import { useEcosystemCurrencyStore } from '~~/store/extensions/ecosystem/tokens/user'

definePageMeta({
  title: 'Funding Wallets',
})

const route = useRoute()
const ecosystemCurrencyStore = useEcosystemCurrencyStore()
const ecosystemWalletStore = useEcosystemWalletStore()

// Fetch data on component mount
onMounted(async () => {
  if (ecosystemCurrencyStore.items.length === 0) {
    await ecosystemCurrencyStore.fetchCurrencies()
  }
  await ecosystemWalletStore.fetchWallets(false, false)
})

const currencies = computed(() => ecosystemCurrencyStore.items)
const wallets = computed(() => ecosystemWalletStore.wallets)
const hideSmallBalances = ref(false)

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) || '1'))

const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

const seenCurrencies = new Set()

const items = computed(() => {
  if (!Array.isArray(currencies.value)) return []

  seenCurrencies.clear()

  return currencies.value
    .map((token) => {
      let wallet = wallets.value ? wallets.value[token.currency] : null
      return { ...token, wallet }
    })
    .filter((item) => {
      if (seenCurrencies.has(item.currency)) return false
      seenCurrencies.add(item.currency)

      if (hideSmallBalances.value) {
        return (
          item.wallet?.balance > 0 &&
          item.currency.toLowerCase().includes(filter.value.toLowerCase())
        )
      }
      return item.currency.toLowerCase().includes(filter.value.toLowerCase())
    })
})
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          placeholder="Search Coin"
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
        />
      </template>
      <template #right>
        <BaseCheckbox
          v-model="hideSmallBalances"
          value="no-balance"
          label="Hide Small Balances"
          shape="rounded"
          color="primary"
        />
      </template>
      <div class="pb-10">
        <div v-if="!paginatedItems || paginatedItems.length === 0">
          <BasePlaceholderPage
            :title="
              filter && filter !== '' ? 'No matching results' : 'No results'
            "
            :subtitle="
              filter && filter !== ''
                ? 'Looks like we couldn\'t find any matching results for your search terms. Try other search terms.'
                : 'Looks like we don\'t have any data here yet.'
            "
          >
            <template #image>
              <img
                loading="lazy"
                class="block dark:hidden"
                src="/img/illustrations/placeholders/flat/placeholder-search-4.svg"
                alt="Placeholder image"
              />
              <img
                loading="lazy"
                class="hidden dark:block"
                src="/img/illustrations/placeholders/flat/placeholder-search-4-dark.svg"
                alt="Placeholder image"
              />
            </template>
          </BasePlaceholderPage>
        </div>
        <div v-else class="space-y-2 xs:pt-0 sm:pt-5">
          <TransitionGroup
            enter-active-class="transform-gpu"
            enter-from-class="opacity-0 -translate-x-full"
            enter-to-class="opacity-100 translate-x-0"
            leave-active-class="absolute transform-gpu"
            leave-from-class="opacity-100 translate-x-0"
            leave-to-class="opacity-0 -translate-x-full"
          >
            <TableFlexTableRow
              v-for="(item, index) in paginatedItems"
              :key="index"
              shape="rounded"
              spaced
            >
              <template #start>
                <TableFlexTableStart
                  label="Wallet"
                  :hide-label="index > 0"
                  :title="item.currency"
                  :subtitle="item.name"
                />
              </template>
              <template #end>
                <TableFlexTableCell
                  label="Balance"
                  :hide-label="index > 0"
                  class="w-full sm:w-40 xs:flex sm:hidden lg:flex"
                >
                  <span
                    class="font-sans text-sm"
                    :class="
                      Number(item.wallet?.balance) > 0
                        ? ''
                        : 'text-muted-500 dark:text-muted-400'
                    "
                  >
                    {{
                      Number(item.wallet?.balance ?? 0).toFixed(
                        item.precision?.amount ?? 8,
                      )
                    }}
                  </span>
                </TableFlexTableCell>
                <TableFlexTableCell label="action" :hide-label="index > 0">
                  <NuxtLink
                    :to="`/user/wallets/funding/${item.currency.toLowerCase()}`"
                  >
                    <BaseButtonAction
                      class="hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <span>{{ $t('View') }}</span>
                    </BaseButtonAction>
                  </NuxtLink>
                </TableFlexTableCell>
              </template>
            </TableFlexTableRow>
          </TransitionGroup>
        </div>
        <div class="mt-4">
          <BasePagination
            v-if="items.length > perPage"
            :total-items="items.length || 0"
            :item-per-page="perPage"
            :current-page="page"
            shape="curved"
          />
        </div>
      </div>
    </TairoContentWrapper>
  </div>
</template>
