<script setup lang="ts">
import type { Wallet } from '~~/types'

const props = defineProps<{
  wallet: Wallet
  viewPath: string
  precision?: number
}>()

const { transactionItemDetails, formatedPrice } = useUtils()
const router = useRouter()
const route = useRoute()

const filter = ref('')
const perPage = ref(5)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const { wallet, viewPath } = props

const items = computed(() => {
  if (wallet.transactions && Array.isArray(wallet.transactions)) {
    return wallet.transactions
      .filter((item) => {
        return item.uuid.toLowerCase().includes(filter.value.toLowerCase())
      })
      .sort((a, b) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      })
  } else {
    return []
  }
})

const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

const status = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'success'
    case 'PENDING':
      return 'warning'
    case 'FAILED':
      return 'danger'
    case 'CANCELLED':
      return 'danger'
    case 'REJECTED':
      return 'danger'
    case 'EXPIRED':
      return 'danger'
    default:
      return 'info'
  }
}

const view = (uuid: string) => {
  router.push(`${viewPath}/${uuid}`)
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
          placeholder="Search Transaction UUID..."
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
          <option :value="5">5 {{ $t('per page') }}</option>
          <option :value="10">10 {{ $t('per page') }}</option>
          <option :value="25">25 {{ $t('per page') }}</option>
          <option :value="50">50 {{ $t('per page') }}</option>
          <option :value="100">100 {{ $t('per page') }}</option>
        </BaseSelect>
      </template>
      <div>
        <template v-if="paginatedItems?.length === 0">
          <BaseCard
            shape="curved"
            class="p-6 backdrop-blur-sm bg-white/40 dark:bg-black/10"
          >
            <BaseHeading
              as="h4"
              size="sm"
              weight="semibold"
              lead="tight"
              class="text-muted-800 mb-2 dark:text-white"
            >
              {{ $t('') }}No Transactions Yet!
            </BaseHeading>

            <BaseParagraph size="sm" lead="tight" class="text-muted-400">
              {{ $t('') }}It looks like you haven't made any transactions yet.
              To get started, you can add a new transaction or create a new
              wallet. Keep track of your income and expenses right from this
              dashboard. Happy budgeting!
            </BaseParagraph>
          </BaseCard>
        </template>
        <div v-else class="w-full sm:pt-5">
          <TairoFlexTable>
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
                spaced
              >
                <template #start>
                  <BaseIconBox
                    size="md"
                    class="w-16 ml-2 hidden sm:flex"
                    shape="straight"
                    flavor="pastel"
                    mask="blob"
                    :color="
                      transactionItemDetails[
                        item.type as keyof typeof transactionItemDetails
                      ].color
                    "
                  >
                    <Icon
                      v-if="transactionItemDetails.hasOwnProperty(item.type)"
                      :name="
                        transactionItemDetails[
                          item.type as keyof typeof transactionItemDetails
                        ].icon
                      "
                      class="h-6 w-6"
                    />
                  </BaseIconBox>
                  <TableFlexTableStart
                    label="Transaction"
                    :hide-label="index > 0"
                    :title="
                      transactionItemDetails[
                        item.type as keyof typeof transactionItemDetails
                      ].title
                    "
                    :subtitle="formatDate(item.created_at)"
                    class="w-full sm:w-64"
                  />
                </template>
                <template #end>
                  <TableFlexTableCell
                    label="Amount"
                    :hide-label="index > 0"
                    class="w-full sm:w-24 text-xs"
                    >{{
                      wallet.type === 'FIAT'
                        ? formatedPrice(item.amount, wallet.currency)
                        : Number(item.amount).toFixed(precision)
                    }}</TableFlexTableCell
                  >
                  <TableFlexTableCell
                    label="Fee"
                    :hide-label="index > 0"
                    class="w-full sm:w-24 text-xs"
                    >{{
                      wallet.type === 'FIAT'
                        ? formatedPrice(item.fee, wallet.currency)
                        : Number(item.fee).toFixed(precision)
                    }}</TableFlexTableCell
                  >
                  <TableFlexTableCell
                    label="Status"
                    :hide-label="index > 0"
                    class="w-full sm:w-20"
                  >
                    <BaseTag
                      :color="status(item.status)"
                      flavor="pastel"
                      condensed
                      >{{ item.status }}</BaseTag
                    >
                  </TableFlexTableCell>
                  <TableFlexTableCell
                    label="Actions"
                    :hide-label="index > 0"
                    class="w-full sm:w-20"
                  >
                    <TairoButtonIcon
                      condensed
                      color="muted"
                      @click="view(item.uuid)"
                      data-nui-tooltip="View"
                    >
                      <Icon name="ph:eye-duotone" class="h-4 w-4" />
                    </TairoButtonIcon>
                  </TableFlexTableCell>
                </template>
              </TableFlexTableRow>
            </TransitionGroup>
          </TairoFlexTable>
        </div>

        <div class="mt-6">
          <BasePagination
            v-if="items.length > perPage"
            :currentPage="page"
            :total-items="items.length"
            :item-per-page="perPage"
          />
        </div>
      </div>
    </TairoContentWrapper>
  </div>
</template>
