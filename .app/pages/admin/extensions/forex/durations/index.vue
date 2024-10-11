<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import { useForexDurationStore } from '~~/store/extensions/forex/admin/durations'

definePageMeta({
  permissions: ['View Forex Durations'],
  title: 'Forex Durations',
})

// General Constants
const { toast } = useUtils()
const route = useRoute()
const loading = ref(true)
const { createForexDuration, deleteForexDuration } = useForex()
const forexDurationStore = useForexDurationStore()
const durations = computed(() => forexDurationStore.durations)

onMounted(async () => {
  loading.value = true
  if (forexDurationStore.durations.length === 0) {
    await forexDurationStore.fetchForexDurations()
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
  timeframe: z.object({
    label: z.string(),
    value: z.string(),
  }),
})

const timeframeOptions = [
  { label: 'Hour', value: 'HOUR' },
  { label: 'Day', value: 'DAY' },
  { label: 'Week', value: 'WEEK' },
  { label: 'Month', value: 'MONTH' },
]

const timeframeMap: any = {
  HOUR: 'Hour',
  DAY: 'Day',
  WEEK: 'Week',
  MONTH: 'Month',
}

type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  duration: 1,
  timeframe: timeframeOptions[0],
}))
const { handleSubmit, isSubmitting, meta, resetForm } = useForm({
  validationSchema: toTypedSchema(zodSchema),
  initialValues,
})

// Create
const create = handleSubmit(async (values) => {
  if (
    durations.value &&
    durations.value.length > 0 &&
    durations.value.some(
      (item) =>
        item.duration === values.duration &&
        item.timeframe === values.timeframe.value,
    )
  ) {
    toast.warning('Duration already exists')
    isCreateOpen.value = false
    return
  }
  const data = {
    duration: values.duration,
    timeframe: values.timeframe.value,
  }
  try {
    const response = await createForexDuration(data)
    toast.response(response)
    if (response.status === 'success') {
      await forexDurationStore.fetchForexDurations()
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

async function deletePlan() {
  isDeleting.value = true
  try {
    const response = await deleteForexDuration(selectedItem.value?.id)
    toast.response(response)
    if (response.status === 'success') {
      forexDurationStore.removeDuration(selectedItem.value?.id)
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
            color="success"
            class="w-full"
            @click="isCreateOpen = true"
            flavor="outline"
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
              class="flex flex-col p-5 sm:flex-row sm:items-center"
            >
              <div
                class="flex flex-col items-center justify-start gap-3 text-center sm:flex-row sm:justify-start sm:text-left"
              >
                <BaseHeading
                  tag="h3"
                  size="sm"
                  weight="medium"
                  class="text-muted-800 dark:text-muted-100"
                >
                  {{ item.duration }} {{ timeframeMap[item.timeframe] }}
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
                      size="md"
                      weight="semibold"
                      class="text-muted-800 dark:text-muted-100"
                    >
                      <span>{{ item.forex_plan_duration?.length ?? 0 }}</span>
                    </BaseHeading>
                    <BaseParagraph
                      lead="none"
                      weight="semibold"
                      class="text-muted-400 !text-[0.65rem] uppercase"
                    >
                      <span>{{ $t('Plans') }}</span>
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

          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="duration"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="number"
              label="duration"
              placeholder="Enter duration"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="timeframe"
          >
            <BaseListbox
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              :items="timeframeOptions"
              :properties="{ label: 'label', value: 'value' }"
              placeholder="Please select an option"
              label="Timeframe"
              shape="rounded"
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
            {{ $t('Delete') }} {{ $t('Forex Duration') }}
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
              @click="deletePlan()"
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
