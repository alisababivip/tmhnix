<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import { useAdminStakingDurationsStore } from '~~/store/extensions/staking/admin/durations'
import { useAdminStakingPoolsStore } from '~~/store/extensions/staking/admin/pools'

definePageMeta({
  permissions: ['View Staking Durations'],
  title: 'Staking Durations',
})

// General Constants
const stakingPoolStore = useAdminStakingPoolsStore()
const { toast } = useUtils()
const route = useRoute()
const loading = ref(true)
const { createAdminStakingDuration, deleteAdminStakingDuration } = useStaking()
const stakingDurationStore = useAdminStakingDurationsStore()
const durations = computed(() => stakingDurationStore.durations)
const pools = computed(
  () =>
    stakingPoolStore.pools?.map((item) => ({
      label: item.name,
      value: item.id,
    })),
)

onMounted(async () => {
  loading.value = true
  if (stakingPoolStore.pools.length === 0) {
    await stakingPoolStore.fetchStakingPools()
  }
  if (stakingDurationStore.durations.length === 0) {
    await stakingDurationStore.fetchStakingDurations()
  }
  loading.value = false
})

// Pagination Constants
const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

// Modals Constants
const isCreateOpen = ref(false)

// Filter
const filteredItems = computed(() => {
  if (durations.value && Array.isArray(durations.value)) {
    return durations.value.filter((item) =>
      item.duration.toString().includes(filter.value),
    )
  } else {
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
  duration: z.number().gt(0, 'Maximum amount must be greater than 0'),
  interest_rate: z.number().gt(0, 'Interest rate must be greater than 0'),
  pool_id: z.object({
    label: z.string(),
    value: z.number().nullable(),
  }),
})

type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  duration: 1,
  interest_rate: 0,
  pool_id: {
    label: 'Please select a pool',
    value: null,
  },
}))
const { handleSubmit, isSubmitting, meta, resetForm } = useForm({
  validationSchema: toTypedSchema(zodSchema),
  initialValues,
})

// Create
const create = handleSubmit(async (values) => {
  if (!values.pool_id.value) {
    toast.dangerText('Please select a pool')
    return
  }
  try {
    const response = (await createAdminStakingDuration(
      values.pool_id.value,
      values.duration,
      values.interest_rate,
    )) as any
    toast.response(response)
    if (response.status === 'success') {
      await stakingDurationStore.fetchStakingDurations()
      resetForm()
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isCreateOpen.value = false
})

// Delete modal
const isDeleteOpen = ref(false)
const isDeleting = ref(false)
const selectedItem = ref(null)

function openDeleteModal(item: any) {
  selectedItem.value = item
  isDeleteOpen.value = true
}

async function deleteDuration() {
  isDeleting.value = true
  try {
    const response = (await deleteAdminStakingDuration(
      selectedItem.value?.id,
    )) as any
    toast.response(response)
    if (response.status === 'success') {
      stakingDurationStore.removeDuration(selectedItem.value?.id)
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isDeleteOpen.value = false
  isDeleting.value = false
  selectedItem.value = null
}
</script>

<template>
  <div class="pb-10">
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          placeholder="Filter durations..."
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
        />
      </template>
      <template #right>
        <div class="w-full">
          <BaseButton
            color="primary"
            class="w-full"
            @click="isCreateOpen = true"
          >
            <Icon name="line-md:plus" class="h-4 w-4" />
            <span>{{ $t('Create Duration') }}</span>
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
        <div v-else class="space-y-4">
          <TransitionGroup
            enter-active-class="transform-gpu"
            enter-from-class="opacity-0 -translate-x-full"
            enter-to-class="opacity-100 translate-x-0"
            leave-active-class="absolute transform-gpu"
            leave-from-class="opacity-100 translate-x-0"
            leave-to-class="opacity-0 -translate-x-full"
          >
            <BaseCard
              v-for="item in paginatedItems"
              :key="item.id"
              class="flex flex-col py-3 px-4 sm:flex-row sm:items-center"
            >
              <div
                class="flex flex-col items-center justify-start gap-3 text-center sm:flex-row sm:justify-start sm:text-left"
              >
                <BaseHeading
                  tag="h3"
                  size="md"
                  weight="medium"
                  class="text-muted-800 dark:text-muted-100"
                >
                  {{ item.duration }} {{ item.duration > 1 ? 'days' : 'day' }}
                </BaseHeading>
              </div>
              <div
                class="flex flex-col gap-4 pt-4 sm:ms-auto sm:flex-row sm:items-center sm:justify-end sm:pt-0"
              >
                <div
                  class="divide-muted-200 dark:divide-muted-700 flex items-center justify-center divide-x"
                >
                  <div class="flex flex-col gap-1 px-4 text-center">
                    <BaseHeading
                      tag="h3"
                      size="sm"
                      weight="semibold"
                      class="text-muted-800 dark:text-muted-100"
                    >
                      <span>{{ item.pool?.name }}</span>
                    </BaseHeading>
                    <BaseParagraph
                      lead="none"
                      weight="semibold"
                      class="text-muted-400 !text-[0.65rem] uppercase"
                    >
                      <span>{{ $t('Pool') }}</span>
                    </BaseParagraph>
                  </div>
                  <div>
                    <TairoButtonIcon
                      @click="openDeleteModal(item)"
                      color="danger"
                      flavor="outline"
                      data-nui-tooltip="Delete Duration"
                      condensed
                      class="ml-4"
                    >
                      <Icon name="line-md:close" class="h-4 w-4" />
                    </TairoButtonIcon>
                  </div>
                </div>
              </div>
            </BaseCard>
          </TransitionGroup>
          <div>
            <BasePagination
              v-if="durations.length > perPage"
              :total-items="durations.length"
              :item-per-page="perPage"
              :current-page="page"
              shape="full"
            />
          </div>
        </div>
      </div>
    </TairoContentWrapper>
    <TairoModal :open="isCreateOpen" size="sm" @close="isCreateOpen = false">
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Create New Duration') }}
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
                'Please provide a unique duration and timeframe for the new duration',
              )
            }}.
          </p>
          <div class="space-y-3">
            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="pool_id"
            >
              <BaseListbox
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                label="Pool"
                placeholder="Select pool"
                :items="pools"
                :properties="{
                  label: 'label',
                  value: 'value',
                }"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>
            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="duration"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="number"
                label="Duration"
                placeholder="Enter duration"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="interest_rate"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="number"
                label="Interest rate %"
                placeholder="Enter interest rate"
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
    <TairoModal :open="isDeleteOpen" size="sm" @close="isDeleteOpen = false">
      <!-- Deletion confirmation UI -->
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Delete') }} {{ $t('Staking Duration') }}
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
            {{ $t('duration') }}
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
              @click="deleteDuration()"
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
