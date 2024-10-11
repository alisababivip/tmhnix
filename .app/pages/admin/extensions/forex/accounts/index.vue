<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import { useForexAccountStore } from '~~/store/extensions/forex/admin/accounts'

definePageMeta({
  permissions: ['View Forex Accounts'],
  title: 'Forex Accounts',
})

// General Constants
const { toast } = useUtils()
const route = useRoute()
const loading = ref(true)
const { createAdminForexAccount, updateAdminForexAccount } = useForex()
const forexAccountStore = useForexAccountStore()
const accounts = computed(() => forexAccountStore.accounts)

onMounted(async () => {
  loading.value = true
  if (forexAccountStore.accounts.length === 0) {
    await forexAccountStore.fetchForexAccounts()
  }
  loading.value = false
})

// Pagination Constants
const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

// Modals Constants
const isCreateOpen = ref(false)
const isEditOpen = ref(false)

// Filter
const filteredItems = computed(() => {
  // Ensure accounts is an array and filter has a value
  if (accounts.value && Array.isArray(accounts.value)) {
    if (!filter.value) {
      // If filter is empty, just return all accounts
      return accounts.value
    }

    const filterLower = filter.value.toLowerCase() // Convert the filter to lower case once and use it

    // Filter only items with an account_id or email
    const filtered = accounts.value.filter((item) => {
      const fullName = item.user
        ? `${item.user.first_name} ${item.user.last_name}`.toLowerCase()
        : ''

      return (
        item.user &&
        (fullName.includes(filterLower) ||
          item.user?.uuid.includes(filterLower) ||
          (item.account_id &&
            item.account_id.toString().includes(filter.value)))
      )
    })

    return filtered
  } else {
    // If no filter or accounts is not an array, return an empty array
    return []
  }
})

// Pagination
const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return filteredItems.value.slice(start, end)
})

// Validation
const zodSchema = z.object({
  account_id: z.string().nonempty(),
  broker: z.string().nonempty(),
  password: z.string().nonempty(),
  mt: z.enum(['4', '5']),
  type: z.enum(['DEMO', 'LIVE']),
  status: z.boolean().optional(),
  balance: z.number().optional(),
  leverage: z.number().optional(),
})

type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  account_id: '',
  broker: '',
  password: '',
  mt: '4',
  type: 'DEMO',
  status: true,
  balance: 0,
  leverage: 1,
}))

const metaTraderOptions = computed(() => ['4', '5'])
const accountTypeOptions = computed(() => ['DEMO', 'LIVE'])

const { handleSubmit, isSubmitting, resetForm, setFieldValue } = useForm({
  validationSchema: toTypedSchema(zodSchema),
  initialValues,
})

// Create
const create = handleSubmit(async (values) => {
  if (
    accounts.value &&
    accounts.value.length > 0 &&
    accounts.value.some(
      (item) => item.account_id === values.account_id && item.mt === values.mt,
    )
  ) {
    toast.warning('Account already exists')
    isCreateOpen.value = false
    return
  }

  try {
    const response = await createAdminForexAccount(
      values.account_id,
      values.broker,
      values.password,
      Number(values.mt),
      values.type,
      values.status ?? true,
      values.balance ?? 0,
      values.leverage ?? 1,
    )
    toast.response(response)
    if (response.status === 'success') {
      await forexAccountStore.fetchForexAccounts()
      resetForm()
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isCreateOpen.value = false
})

// Edit
const editAccount = (item: any) => {
  selectedItem.value = item
  setFieldValue('account_id', item.account_id)
  setFieldValue('broker', item.broker)
  setFieldValue('password', item.password)
  setFieldValue('mt', `${item.mt}`)
  setFieldValue('type', item.type)
  setFieldValue('status', item.status)
  setFieldValue('balance', item.balance)
  setFieldValue('leverage', item.leverage)
  isEditOpen.value = true
}

const update = handleSubmit(async (values) => {
  try {
    const response = await updateAdminForexAccount(
      selectedItem.value?.id,
      values.account_id,
      values.broker,
      values.password,
      Number(values.mt),
      values.type,
      values.status ?? true,
      values.balance ?? 0,
      values.leverage ?? 1,
    )
    toast.response(response)
    if (response.status === 'success') {
      await forexAccountStore.fetchForexAccounts()
      resetForm()
    }
  } catch (error) {
    toast.danger(error as any)
  }
  selectedItem.value = null
  isEditOpen.value = false
})

// Delete modal
const isDeleteOpen = ref(false)
const isDeleting = ref(false)
const selectedItem = ref(null)

function openDeleteModal(item: any) {
  selectedItem.value = item
  isDeleteOpen.value = true
}
</script>

<template>
  <div class="pb-10">
    <TairoContentWrapper>
      <template #left>
        <span data-nui-tooltip="Account ID, User UUID, User Name">
          <BaseInput
            v-model="filter"
            icon="lucide:search"
            placeholder="Filter accounts..."
            :classes="{
              wrapper: 'w-full sm:w-auto',
            }"
        /></span>
      </template>
      <template #right>
        <div class="w-full">
          <BaseButton
            color="success"
            class="w-full"
            @click="isCreateOpen = true"
            flavor="outline"
          >
            <Icon name="line-md:plus" class="h-4 w-4" />
            <span>{{ $t('Create Account') }}</span>
          </BaseButton>
        </div>
      </template>
      <div>
        <div v-if="loading" class="space-y-4">
          <BaseCard
            v-for="index in 3"
            :key="index"
            class="flex flex-col p-5 sm:flex-row sm:items-center"
          >
            <div
              class="flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:justify-start sm:text-left"
            >
              <BasePlaceload class="h-16 w-16 shrink-0 rounded-full" />
              <div class="space-y-2">
                <BasePlaceload
                  class="mx-auto h-3 w-[100px] rounded-lg sm:mx-0"
                />
                <BasePlaceload
                  class="mx-auto h-3 w-[75px] rounded-lg sm:mx-0"
                />
              </div>
            </div>
            <div
              class="flex flex-col gap-4 pt-4 sm:ms-auto sm:flex-row sm:items-center sm:justify-end sm:pt-0"
            >
              <div
                class="flex w-full items-center justify-center sm:w-[160px] sm:justify-end"
              >
                <BasePlaceload class="h-6 w-24 rounded-full" />
              </div>
              <div
                class="ptablet:hidden divide-muted-200 dark:divide-muted-700 flex items-center justify-center divide-x"
              >
                <div class="flex flex-col gap-1 px-4 text-center">
                  <BasePlaceload class="h-3 w-16 rounded-lg" />
                </div>
                <div class="flex flex-col gap-1 px-4 text-center">
                  <BasePlaceload class="h-3 w-16 rounded-lg" />
                </div>
                <div class="flex flex-col gap-1 px-4 text-center">
                  <BasePlaceload class="h-3 w-16 rounded-lg" />
                </div>
              </div>
              <div
                class="ptablet:hidden flex w-full items-center justify-center gap-1 py-3 sm:w-[160px] sm:justify-end sm:py-0"
              >
                <BasePlaceload class="h-8 w-8 shrink-0 rounded-full" />
                <BasePlaceload class="h-8 w-8 shrink-0 rounded-full" />
                <BasePlaceload class="hidden h-3 w-12 rounded-full sm:block" />
              </div>
              <div class="sm:ms-6">
                <BasePlaceload
                  class="mx-auto h-8 w-40 rounded-lg sm:mx-0 sm:w-20"
                />
              </div>
            </div>
          </BaseCard>
        </div>
        <div v-else-if="!loading && paginatedItems.length === 0">
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
                src="/img/illustrations/placeholders/flat/placeholder-search-1.svg"
                alt="Placeholder image"
              />
              <img
                class="hidden dark:block"
                src="/img/illustrations/placeholders/flat/placeholder-search-1-dark.svg"
                alt="Placeholder image"
              />
            </template>
          </BasePlaceholderPage>
        </div>
        <TairoFlexTable v-else class="pt-5">
          <TableFlexTableRow
            v-for="(item, index) in paginatedItems"
            :key="item.id"
            spaced
          >
            <template #start>
              <TableFlexTableStart
                label="User"
                :hide-label="index > 0"
                :logo="item.user?.avatar ?? '/img/placeholder.png'"
                :title="
                  item.user
                    ? `${item.user?.first_name} ${item.user?.last_name}`
                    : 'Not Assigned'
                "
                :subtitle="item.account_id ?? 'No account ID'"
              />
            </template>
            <template #end>
              <TableFlexTableCell
                label="Type"
                :hide-label="index > 0"
                class="w-20 xs:w-full text-sm"
                >{{ item.type }}
              </TableFlexTableCell>
              <TableFlexTableCell
                label="Leverage"
                :hide-label="index > 0"
                class="w-20 xs:w-full text-sm"
                >x{{ item.leverage }}
              </TableFlexTableCell>
              <TableFlexTableCell
                label="Balance"
                :hide-label="index > 0"
                class="w-20 xs:w-full text-sm"
                >{{ item.balance }}
              </TableFlexTableCell>
              <TableFlexTableCell
                label="Status"
                :hide-label="index > 0"
                class="w-20 xs:w-full"
              >
                <BaseTag
                  :color="item.status ? 'success' : 'danger'"
                  flavor="pastel"
                  condensed
                  >{{ item.status ? 'Active' : 'Disabled' }}</BaseTag
                >
              </TableFlexTableCell>
              <TableFlexTableCell label="Actions" :hide-label="index > 0">
                <BaseDropdown
                  flavor="context"
                  label="Dropdown"
                  orientation="end"
                >
                  <BaseDropdownItem
                    @click="editAccount(item)"
                    title="Edit Account"
                  >
                    <template #start>
                      <Icon
                        name="line-md:edit-twotone"
                        class="me-2 block h-5 w-5"
                      />
                    </template>
                  </BaseDropdownItem>

                  <BaseDropdownItem
                    @click="openDeleteModal(item)"
                    title="Delete Account"
                  >
                    <template #start>
                      <Icon name="line-md:close" class="me-2 block h-5 w-5" />
                    </template>
                  </BaseDropdownItem>
                </BaseDropdown>
              </TableFlexTableCell>
            </template>
          </TableFlexTableRow>
          <div>
            <BasePagination
              v-if="accounts.length > perPage"
              :total-items="accounts.length"
              :item-per-page="perPage"
              :current-page="page"
              shape="full"
            />
          </div>
        </TairoFlexTable>
      </div>
    </TairoContentWrapper>
    <TairoModal :open="isCreateOpen" size="lg" @close="isCreateOpen = false">
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Create New Account') }}
          </h3>

          <BaseButtonClose @click="isCreateOpen = false" />
        </div>
      </template>
      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <p
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5 mb-3"
          >
            {{
              $t(
                'Please provide a unique account and timeframe for the new account',
              )
            }}.
          </p>

          <div class="grid gap-5 grid-cols-1 sm:grid-cols-2">
            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="account_id"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="text"
                label="Account ID"
                placeholder="Enter account ID"
                @update:model-value="handleChange"
                @blur="handleBlur"
                autocomplete="off"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="password"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="password"
                label="Password"
                placeholder="Enter password"
                @update:model-value="handleChange"
                @blur="handleBlur"
                autocomplete="off"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="broker"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="text"
                label="Broker"
                placeholder="Enter broker"
                @update:model-value="handleChange"
                @blur="handleBlur"
                autocomplete="off"
              />
            </Field>
            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="balance"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="number"
                label="Balance"
                placeholder="Enter balance"
                @update:model-value="handleChange"
                @blur="handleBlur"
                autocomplete="off"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="leverage"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="number"
                label="Leverage"
                placeholder="Enter leverage"
                @update:model-value="handleChange"
                @blur="handleBlur"
                autocomplete="off"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="mt"
            >
              <BaseListbox
                :model-value="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                :items="metaTraderOptions"
                placeholder="Please select an option"
                label="MetaTrader Version"
                shape="rounded"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="type"
            >
              <BaseListbox
                :model-value="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                :items="accountTypeOptions"
                placeholder="Please select an option"
                label="Account Type"
                shape="rounded"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="status"
            >
              <BaseSwitchThin
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                label="Status"
                color="success"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>
          </div>
        </div>
      </div>

      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isCreateOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="primary"
              flavor="solid"
              @click="create"
              :disabled="isSubmitting"
              :loading="isSubmitting"
            >
              {{ $t('Create') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
    <TairoModal :open="isEditOpen" size="lg" @close="isEditOpen = false">
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Edit Account') }}
          </h3>

          <BaseButtonClose @click="isEditOpen = false" />
        </div>
      </template>
      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <p
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5 mb-3"
          >
            {{
              $t(
                'Please provide a unique account and timeframe for the new account',
              )
            }}.
          </p>

          <div class="grid gap-5 grid-cols-1 sm:grid-cols-2 mb-5">
            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="account_id"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="text"
                label="Account ID"
                placeholder="Enter account ID"
                @update:model-value="handleChange"
                @blur="handleBlur"
                autocomplete="off"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="password"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="password"
                label="Password"
                placeholder="Enter password"
                @update:model-value="handleChange"
                @blur="handleBlur"
                autocomplete="off"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="broker"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="text"
                label="Broker"
                placeholder="Enter broker"
                @update:model-value="handleChange"
                @blur="handleBlur"
                autocomplete="off"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="balance"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="number"
                label="Balance"
                placeholder="Enter balance"
                @update:model-value="handleChange"
                @blur="handleBlur"
                autocomplete="off"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="leverage"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="number"
                label="Leverage"
                placeholder="Enter leverage"
                @update:model-value="handleChange"
                @blur="handleBlur"
                autocomplete="off"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="mt"
            >
              <BaseListbox
                :model-value="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                :items="metaTraderOptions"
                placeholder="Please select an option"
                label="MetaTrader Version"
                shape="rounded"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="type"
            >
              <BaseListbox
                :model-value="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                :items="accountTypeOptions"
                placeholder="Please select an option"
                label="Account Type"
                shape="rounded"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>
          </div>

          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="status"
          >
            <BaseSwitchThin
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              label="Status"
              color="success"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>
      </div>

      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isEditOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="primary"
              flavor="solid"
              @click="update"
              :disabled="isSubmitting"
              :loading="isSubmitting"
            >
              {{ $t('Update') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
    <TairoModal :open="isDeleteOpen" size="sm" @close="isDeleteOpen = false">
      <!-- Deletion confirmation UI -->
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Delete') }} {{ $t('Forex Account') }}
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
            {{ $t('Do you really want to delete this') }}
            {{ $t('account') }}
            {{ $t('This process cannot be undone') }}.
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
              @click="deleteAccount()"
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
