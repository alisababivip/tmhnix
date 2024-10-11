<script setup lang="ts">
import { useKycStore } from '~/store/kyc'

definePageMeta({
  permissions: ['Access KYC Applications Management'],
  title: 'KYC Applications Management',
})

const kycStore = useKycStore()
const route = useRoute()
const { toast } = useUtils()
const { updateKycStatus, deleteKyc } = useKyc()
const userStore = useUserStore()
const user = computed(() => userStore.getProfile)

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const selected = ref<number[]>([])

const kycs = computed(() => kycStore.kycs)

const items = computed(
  () => kycs.value?.filter((item) => item.user.uuid.includes(filter.value)),
)
const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

onMounted(async () => {
  if (kycStore.kycs.length === 0) {
    kycStore.loading = true
    await kycStore.fetchKycs()
    kycStore.loading = false
  }
})

// Delete modal
const isDeleteOpen = ref(false)
const isDeleting = ref(false)

function openDeleteModal(item: any) {
  kycStore.selectedKyc = item
  isDeleteOpen.value = true
}

async function deleteItem() {
  isDeleting.value = true
  try {
    const response = await deleteKyc(kycStore.selectedKyc?.id)
    kycStore.kycs = kycStore.kycs.filter(
      (kyc) => kyc.id !== kycStore.selectedKyc?.id,
    )
    toast.response(response)
  } catch (error) {
    console.log(error)

    toast.danger(error as any)
  }
  isDeleteOpen.value = false
  isDeleting.value = false
  kycStore.selectedKyc = null
}

const statusClass = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'APPROVED':
      return 'success'
    case 'REJECTED':
      return 'danger'
    default:
      return 'info'
  }
}

const { formatedDate } = useUtils()
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <div class="w-full">
          <BaseInput
            v-model="filter"
            icon="lucide:search"
            :classes="{
              wrapper: 'w-full sm:w-auto',
            }"
            placeholder="Filter User ID..."
          />
        </div>
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
      <div class="xs:pt-0 sm:pt-5">
        <template v-if="!kycStore.loading && paginatedItems?.length === 0">
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
          <TairoFlexTable>
            <TableFlexTableRow
              v-for="(item, index) in paginatedItems"
              :key="item.id"
              spaced
            >
              <template #start>
                <TableFlexTableStart
                  label="User"
                  :hide-label="index > 0"
                  :logo="item.user.avatar"
                  :title="`${item.user?.first_name} (${item.user?.last_name})`"
                  :subtitle="formatedDate(item.created_at, true)"
                />
              </template>
              <template #end>
                <TableFlexTableCell
                  label="Template"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                >
                  {{ item.template.title }}
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="Level"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                >
                  {{ item.level }}
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
                      :to="`/admin/kyc/application/${item.id}`"
                      title="View"
                    >
                      <template #start>
                        <Icon
                          name="ph:eye-duotone"
                          class="me-2 block h-5 w-5"
                        />
                      </template>
                    </BaseDropdownItem>

                    <BaseDropdownItem
                      @click="openDeleteModal(item)"
                      title="Delete"
                    >
                      <template #start>
                        <Icon name="line-md:close" class="me-2 block h-5 w-5" />
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

    <TairoModal :open="isDeleteOpen" size="sm" @close="isDeleteOpen = false">
      <!-- Deletion confirmation UI -->
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Delete') }} {{ $t('Kyc') }}
          </h3>
          <BaseButtonClose @click="isDeleteOpen = false" />
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
            {{ $t('Do you really want to delete this') }} {{ $t('kyc') }}
            {{ $t('This process cannot be undone') }}.
            {{
              $t(
                'This will also delete all the posts associated with this kyc',
              )
            }}.
          </p>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isDeleteOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="danger"
              flavor="solid"
              @click="deleteItem()"
              :disabled="isDeleting"
              :loading="isDeleting"
            >
              {{ $t('Delete') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
