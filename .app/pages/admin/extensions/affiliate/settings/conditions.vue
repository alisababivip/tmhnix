<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  title: 'MLM Reward Conditions',
})

const route = useRoute()
const { toast } = useUtils()

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const loading = ref(false)

const fiatCurrencyStore = useFiatCurrencyStore()
const fiatCurrencies = computed(() => fiatCurrencyStore.currencies)
const currencies = computed(() => {
  return fiatCurrencies.value.map((currency) => currency.code)
})

const {
  getReferralConditions,
  updateReferralConditionStatus,
  updateReferralCondition,
} = useMlm()
const conditions = ref([])

onMounted(async () => {
  loading.value = true
  const response = await getReferralConditions()
  if (response.status === 'success') {
    conditions.value = response.data.result
  } else {
    toast.danger(response as any)
  }
  loading.value = false
})

const extensionStore = useExtensionStore()
const extensions = computed(() => extensionStore.extensionsUser)

const items = computed(() =>
  conditions.value
    .filter((condition) => {
      switch (condition.name) {
        case 'STAKING_LOYALTY':
          return extensions.value['staking']
        case 'FOREX_INVESTMENT':
          return extensions.value['forex']
        case 'AI_INVESTMENT':
          return extensions.value['ai_trading']
        case 'P2P_TRADE':
          return extensions.value['p2p']
        case 'ECOMMERCE_PURCHASE':
          return extensions.value['ecommerce']
        case 'ICO_CONTRIBUTION':
          return extensions.value['ico']
        default:
          return true
      }
    })
    .filter(
      (condition) =>
        !filter.value ||
        condition.title?.toLowerCase().includes(filter.value.toLowerCase()),
    )
    .sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }),
)

const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

const updateStaus = async (condition) => {
  const response = await updateReferralConditionStatus(
    condition.id,
    !condition.status,
  )
  if (response.status === 'success') {
    toast.success(response as any)
    conditions.value = conditions.value.map((item) => {
      if (item.id === condition.id) {
        item.status = !item.status
      }
      return item
    })
  } else {
    toast.danger(response as any)
  }
}

const zodSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(255, 'Description must be less than 255 characters'),
  reward: z.number().gt(0, 'Reward must be greater than 0'),
  reward_type: z.enum(['FIXED', 'PERCENTAGE']),
  reward_currency: z.string().min(1, 'Reward Currency is required'),
})

type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  title: '',
  description: '',
  reward: 0,
  reward_type: 'FIXED',
  reward_currency: 'USD',
}))

const { handleSubmit, isSubmitting, meta, resetForm, setFieldValue } = useForm({
  validationSchema: toTypedSchema(zodSchema),
  initialValues,
})

const isEditOpen = ref(false)
const selectedCondition = ref({} as any)

const openEditModel = (condition: any) => {
  selectedCondition.value = condition
  isEditOpen.value = true
  setFieldValue('title', condition.title)
  setFieldValue('description', condition.description)
  setFieldValue('reward', condition.reward)
  setFieldValue('reward_type', condition.reward_type)
  setFieldValue('reward_currency', condition.reward_currency)
}

const update = handleSubmit(async (values) => {
  try {
    const response = await updateReferralCondition(
      selectedCondition.value.id,
      values.title,
      values.description,
      values.reward,
      values.reward_type,
      values.reward_currency,
    )
    toast.response(response)
    if (response.status === 'success') {
      const conditionsResponse = await getReferralConditions()
      conditions.value = conditionsResponse.data.result
      resetForm()
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isEditOpen.value = false
})
</script>

<template>
  <div class="pb-10">
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
          placeholder="Search Conditions..."
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
        <template v-if="!loading && paginatedItems?.length === 0">
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
            <TransitionGroup
              enter-active-class="transform-gpu"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transform-gpu"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-2"
            >
              <TableFlexTableRow
                v-for="(item, index) in paginatedItems"
                :key="item.id"
                spaced
              >
                <template #start>
                  <TableFlexTableStart
                    label="Condition"
                    :hide-label="index > 0"
                    :title="item.title"
                    :subtitle="item.description"
                  />
                </template>
                <template #end>
                  <TableFlexTableCell
                    label="Reward"
                    :hide-label="index > 0"
                    class="w-20 xs:w-full text-xs"
                  >
                    {{ item.reward
                    }}{{
                      item.reward_type === 'PERCENTAGE'
                        ? '%'
                        : ` ${item.reward_currency}`
                    }}
                  </TableFlexTableCell>
                  <TableFlexTableCell
                    label="Status"
                    :hide-label="index > 0"
                    class="w-20 xs:w-full"
                  >
                    <BaseTag
                      @click="updateStaus(item)"
                      :color="item.status ? 'success' : 'danger'"
                      flavor="pastel"
                      condensed
                      :data-nui-tooltip="item.status ? 'Disable' : 'Enable'"
                      class="cursor-pointer"
                      >{{ item.status ? 'Active' : 'Disabled' }}</BaseTag
                    >
                  </TableFlexTableCell>
                  <TableFlexTableCell
                    label="Actions"
                    :hide-label="index > 0"
                    class="w-20 xs:w-full"
                  >
                    <BaseButtonIcon
                      color="warning"
                      size="sm"
                      @click="openEditModel(item)"
                      data-nui-tooltip="Edit Condition"
                    >
                      <Icon name="line-md:edit" class="h-4 w-4" />
                    </BaseButtonIcon>
                  </TableFlexTableCell>
                </template>
              </TableFlexTableRow>
            </TransitionGroup>
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

    <TairoModal :open="isEditOpen" size="md" @close="isEditOpen = false">
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Edit Condition') }}
          </h3>

          <BaseButtonClose @click="isEditOpen = false" />
        </div>
      </template>
      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start space-y-3">
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="title"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="text"
              label="Title"
              placeholder="Enter Condition Title"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="description"
          >
            <BaseTextarea
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              label="Description"
              placeholder="Enter Condition Description"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="reward"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="number"
              label="Reward"
              placeholder="Enter Reward Amount"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="reward_type"
          >
            <BaseListbox
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              :items="['FIXED', 'PERCENTAGE']"
              placeholder="Select Rewarding Calculation Type"
              label="Rewarding Type"
              shape="rounded"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="reward_currency"
          >
            <BaseListbox
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              :items="currencies"
              placeholder="Select Reward Currency"
              label="Reward Currency"
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
  </div>
</template>
