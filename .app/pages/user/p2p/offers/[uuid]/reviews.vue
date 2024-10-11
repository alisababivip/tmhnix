<script setup lang="ts">
import type { P2POffer, P2PReview } from '~~/types'

definePageMeta({
  title: 'P2P Offer Reviews',
})

const { getP2POffer } = useP2P()
const route = useRoute()
const offer = ref<P2POffer | null>(null)

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const items = computed(
  () =>
    offer.value?.reviews?.filter(
      (review) =>
        review.comment?.toLowerCase().includes(filter.value.toLowerCase()),
    ),
)
const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value?.slice(start, end)
})

onMounted(async () => {
  const response = (await getP2POffer(route.params.uuid as string)) as any
  offer.value = response.data.result
})
</script>
<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          :classes="{ wrapper: 'w-full sm:w-auto' }"
          placeholder="Filter reviews..."
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
        <BaseButton
          type="button"
          color="muted"
          class="hover:bg-gray-300 dark:hover:bg-gray-800"
          to="/user/p2p/offers"
        >
          <Icon name="line-md:chevron-left" class="h-4 w-4 mr-2" />
          {{ $t('Back') }}
        </BaseButton></template
      >
      <div>
        <template v-if="paginatedItems?.length === 0 || !paginatedItems">
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
                  label="Review"
                  :hide-label="index > 0"
                  :image="item.reviewer?.avatar"
                  :title="
                    item.reviewer?.first_name + ' ' + item.reviewer?.last_name
                  "
                  :subtitle="item.comment"
                />
              </template>
              <template #end>
                <TableFlexTableCell
                  label="Rating"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                >
                  <div class="flex items-start">
                    <span>{{ item.rating }} / 5</span>
                    <Icon
                      name="uim:star"
                      class="w-5 h-5 text-warning-300 ml-1 mb-1"
                    />
                  </div>
                </TableFlexTableCell>
              </template>
            </TableFlexTableRow>
          </TairoFlexTable>
        </div>
        <div class="mt-6">
          <BasePagination
            v-if="items?.length > perPage"
            :total-items="items?.length"
            :current-page="page"
            :item-per-page="perPage"
          />
        </div>
      </div>
    </TairoContentWrapper>
  </div>
</template>
