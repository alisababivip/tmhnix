<script setup lang="ts">
import { useForm, Field } from 'vee-validate'
import { z } from 'zod'
import { useIcoPhaseStore } from '~~/store/extensions/ico/admin/phases'
import { useIcoTokenStore } from '~~/store/extensions/ico/admin/tokens'
import { toTypedSchema } from '@vee-validate/zod'

definePageMeta({
  title: 'Create ICO Phase',
  permissions: ['Create ICO Phases'],
})
const { toast } = useUtils()
const router = useRouter()
const { id } = useRoute().params

const icoPhaseStore = useIcoPhaseStore()
const icoTokenStore = useIcoTokenStore()
const { updateIcoPhase } = useIco()
const tokens = computed(() => icoTokenStore.tokens)

const existingPhase = computed(
  () => icoPhaseStore.selectedPhase || icoPhaseStore.getPhaseById(id),
)

onMounted(async () => {
  const methodId = Number(id)
  if (icoPhaseStore.phases.length === 0) {
    await icoPhaseStore.fetchIcoPhases()
  }
  await icoPhaseStore.selectPhaseById(methodId)
  if (icoTokenStore.tokens.length === 0) {
    await icoTokenStore.fetchIcoTokens()
  }
})

// Validation
const zodSchema = z.object({
  name: z.string().nonempty('Name is required'),
  price: z.number().min(0, 'Price must be greater than 0'),
  status: z.enum(['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED']),
  start_date: z.string(),
  end_date: z.string(),
  token_id: z.object({
    label: z.string(),
    value: z.number(),
  }),
  min_purchase: z.number().min(0, 'Min purchase must be greater than 0'),
  max_purchase: z.number().min(0, 'Max purchase must be greater than 0'),
})

type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => {
  return {
    ...existingPhase.value,
    start_date: existingPhase.value?.start_date
      ? new Date(existingPhase.value?.start_date).toISOString().slice(0, -1)
      : '',
    end_date: existingPhase.value?.end_date
      ? new Date(existingPhase.value?.end_date).toISOString().slice(0, -1)
      : '',
    token_id: {
      label: existingPhase.value?.token.name,
      value: existingPhase.value?.token.id,
    },
  }
})

const { handleSubmit, isSubmitting, errors } = useForm({
  validationSchema: toTypedSchema(zodSchema),
  initialValues,
})

// Create Method
const update = handleSubmit(async (values: FormInput) => {
  try {
    const response = await updateIcoPhase(
      Number(id),
      Number(values.token_id.value),
      values.name,
      values.price,
      values.status,
      values.start_date,
      values.end_date,
      values.min_purchase,
      values.max_purchase,
    )
    toast.response(response)
    if (response.status === 'success') {
      await icoPhaseStore.fetchIcoPhases()
      router.push('/admin/extensions/ico/phases')
    }
  } catch (error) {
    toast.danger(error as any)
  }
})
</script>

<template>
  <TairoContentWrapper>
    <template #left>
      <BaseHeading size="lg" :key="existingPhase?.name">{{
        $t(`
        Editing ${existingPhase?.name ?? 'ICO Phase'} Phase
      `)
      }}</BaseHeading>
    </template>
    <template #right>
      <BaseButton
        type="button"
        color="muted"
        class="hover:bg-gray-300 dark:hover:bg-gray-800"
        to="/admin/extensions/ico/phases"
      >
        <Icon name="line-md:chevron-left" class="h-4 w-4 mr-2" />
        {{ $t('Back') }}
      </BaseButton>
      <BaseButton
        type="submit"
        color="primary"
        :disabled="isSubmitting"
        class="w-full"
        @click="update"
      >
        {{ $t('Update Phase') }}
      </BaseButton>
    </template>
    <form @submit="update" class="space-y-8">
      <BaseCard class="p-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            name="token_id"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseListbox
              :model-value="field.value"
              :error="errorMessage"
              :items="
                tokens?.map((token) => ({
                  label: `${token.currency} (${token.chain})`,
                  value: token.id,
                }))
              "
              :properties="{ label: 'label', value: 'value' }"
              placeholder="Select a token"
              label="Token"
              shape="rounded"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
          <!-- Name -->
          <Field
            name="name"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="text"
              label="Name"
              placeholder="Enter name"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <!-- Price -->
          <Field
            name="price"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="number"
              :label="`Price (${existingPhase?.token.purchase_currency})`"
              placeholder="Enter price"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <!-- Min Purchase -->
          <Field
            name="min_purchase"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="number"
              label="Min Purchase"
              placeholder="Enter min purchase"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <!-- Max Purchase -->
          <Field
            name="max_purchase"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="number"
              label="Max Purchase"
              placeholder="Enter max purchase"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <!-- Start Date -->
          <Field
            name="start_date"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="datetime-local"
              label="Start Date"
              placeholder="Enter start date"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <!-- End Date -->
          <Field
            name="end_date"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="datetime-local"
              label="End Date"
              placeholder="Enter end date"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <Field
            name="status"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseListbox
              :model-value="field.value"
              :error="errorMessage"
              :items="['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED']"
              placeholder="Select a status"
              label="Status"
              shape="rounded"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>
      </BaseCard>

      <TairoFormSave>
        <BaseButton
          type="submit"
          color="primary"
          :disabled="isSubmitting"
          class="w-full"
        >
          {{ $t('Update Phase') }}
        </BaseButton>
      </TairoFormSave>
    </form>
  </TairoContentWrapper>
</template>
