<script setup lang="ts">
import { useAdminReferralStore } from '~~/store/extensions/affiliate/admin/referrals'

definePageMeta({
  permissions: ['View MLM Referrals'],
  title: 'Referrals',
})

const adminReferralsStore = useAdminReferralStore()
const route = useRoute()

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const items = computed(
  () =>
    adminReferralsStore.referrals.filter((referral) =>
      referral.id.toString().includes(filter.value),
    ) ?? [],
)

const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

onMounted(async () => {
  if (adminReferralsStore.referrals.length === 0) {
    adminReferralsStore.loading = true
    await adminReferralsStore.fetchAllReferrals()
    adminReferralsStore.loading = false
  }
})

const statusClass = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'COMPLETED':
      return 'success'
    case 'ACTIVE':
      return 'success'
    case 'REJECTED':
      return 'danger'
    default:
      return 'secondary'
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
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
          placeholder="Filter referrals..."
        />
      </template>
      <template #right>
        <BaseSelect
          v-model="perPage"
          label=""
          :classes="{
            wrapper: 'w-full sm:w-40',
          }"
        >
          <option :value="10">10 {{ $t('per page') }}</option>
          <option :value="25">25 {{ $t('per page') }}</option>
          <option :value="50">50 {{ $t('per page') }}</option>
          <option :value="100">100 {{ $t('per page') }}</option>
        </BaseSelect>
      </template>
      <div>
        <template
          v-if="!adminReferralsStore?.loading && paginatedItems?.length === 0"
        >
          <BasePlaceholderPage
            :title="
              filter && filter !== ''
                ? 'No matching referrals'
                : 'No referrals found'
            "
            :subtitle="
              filter && filter !== ''
                ? 'Looks like we couldn\'t find any matching referrals for your search terms. Try other search terms.'
                : 'Looks like we don\'t have any referrals here yet.'
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
                  label="Referrer"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                  :logo="item.referrer?.avatar ?? '/img/placeholder.png'"
                  :title="`${item.referrer?.first_name} ${item.referrer?.last_name}`"
                  :subtitle="item.referrer?.uuid"
                />
                <TableFlexTableStart
                  label="Referred"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                  :logo="item.referred?.avatar ?? '/img/placeholder.png'"
                  :title="`${item.referred?.first_name} ${item.referred?.last_name}`"
                  :subtitle="item.referred?.uuid"
                />
              </template>
              <template #end>
                <TableFlexTableCell
                  label="Status"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                >
                  <BaseTag
                    :color="statusClass(item.status)"
                    flavor="pastel"
                    condensed
                  >
                    {{ item.status }}
                  </BaseTag>
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
</template>
