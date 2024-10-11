<script setup lang="ts">
import type { EcosystemCustodialWallet } from '~~/types'

definePageMeta({
  permissions: ['View Ecosystem Custodial Wallets'],
  title: 'Ecosystem Custodial Wallets',
})

const { getCustodialWallets, deployCustodialContract } = useEcosystem()
const route = useRoute()
const { chain } = route.params

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const loading = ref(false)
const wallets = ref<EcosystemCustodialWallet[]>([])

const items = computed(
  () => wallets.value?.filter((item) => item.chain.includes(filter.value)),
)
const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value?.slice(start, end)
})

onMounted(async () => {
  await fetchCustodialWallets(chain)
})

const fetchCustodialWallets = async (chain: string) => {
  loading.value = true
  const response = await getCustodialWallets(chain)
  if (response.status === 'success') {
    wallets.value = response.data.result
  }
  loading.value = false
}

const { toast } = useUtils()

const isDeployOpen = ref(false)
const isDeploying = ref(false)
async function deployContract() {
  isDeploying.value = true
  try {
    const response = await deployCustodialContract(chain)
    toast.response(response)
    if (response.status === 'success') {
      await fetchCustodialWallets(chain)
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isDeploying.value = false
  isDeployOpen.value = false
}

const statusClass = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'success'
    case 'INACTIVE':
      return 'danger'
    case 'SUSPENDED':
      return 'warning'
  }
}

const statusTitle = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'Active'
    case 'INACTIVE':
      return 'Disabled'
    case 'SUSPENDED':
      return 'Suspended'
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
          placeholder="Filter chain..."
        />
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
      <template #right>
        <BaseButton color="success" @click="isDeployOpen = true">
          <Icon name="lucide:plus" size="16" class="mr-2" />
          {{ $t('Deploy') }}</BaseButton
        >
        <BaseButton
          color="muted"
          :to="`/admin/extensions/ecosystem/blockchains/wallets`"
          class="ms-2"
          flavor="pastel"
        >
          <Icon name="line-md:chevron-left" class="me-2" />
          {{ $t('Back') }}</BaseButton
        >
      </template>
      <div>
        <template v-if="!loading && paginatedItems?.length === 0">
          <BasePlaceholderPage
            title="No matching results"
            subtitle="Looks like we couldn't find any matching results for your search terms. Try other search terms."
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
        <div v-else class="w-full sm:pt-5">
          <TairoFlexTable>
            <TableFlexTableRow
              v-for="(item, index) in paginatedItems"
              :key="item.id"
              spaced
            >
              <template #start>
                <TableFlexTableStart
                  label="Chain"
                  :hide-label="index > 0"
                  :title="`${item.chain}`"
                  :subtitle="item.address"
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
                    >{{ statusTitle(item.status) }}</BaseTag
                  >
                </TableFlexTableCell>
                <TableFlexTableCell label="Actions" :hide-label="index > 0">
                  <BaseDropdown
                    flavor="context"
                    label="Dropdown"
                    orientation="end"
                  >
                    <BaseDropdownItem
                      :to="`/admin/extensions/ecosystem/blockchains/custodial/${item.chain}/${item.uuid}`"
                      title="View Balances"
                    >
                      <template #start>
                        <Icon name="mdi:eye" class="me-2 block h-5 w-5" />
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
    <TairoModal :open="isDeployOpen" size="lg" @close="isDeployOpen = false">
      <!-- Deletion confirmation UI -->
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Deploy') }} {{ chain }} {{ $t('Custodial Wallet') }}
          </h3>
          <BaseButtonClose @click="isDeployOpen = false" />
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
            {{ $t('Do you really want to deploy') }}
            {{ $t('a new custodial wallet for') }} {{ chain }}
            {{ $t('chain') }}? {{ $t('This process cannot be undone') }}.
          </p>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isDeployOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="success"
              flavor="solid"
              @click="deployContract()"
              :disabled="isDeploying"
              :loading="isDeploying"
            >
              {{ $t('Deploy') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
