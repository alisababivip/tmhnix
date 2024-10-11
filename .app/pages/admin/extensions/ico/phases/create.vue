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

const icoPhaseStore = useIcoPhaseStore()
const { createIcoPhase } = useIco()
const icoTokenStore = useIcoTokenStore()
const tokens = computed(() => icoTokenStore.tokens)

onMounted(async () => {
  if (icoTokenStore.tokens.length === 0) {
    await icoTokenStore.fetchIcoTokens()
  }
  if (icoTokenStore.tokens.length === 0) {
    router.push('/admin/extensions/ico/tokens/create')
    toast.dangerText('You need to create a token first')
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

const initialValues = computed<FormInput>(() => ({
  name: '',
  price: 0,
  status: 'PENDING',
  start_date: '',
  end_date: '',
  token_id: {
    label: 'Select a token',
    value: 0,
  },
  min_purchase: 0,
  max_purchase: 0,
}))

const { handleSubmit, isSubmitting, errors } = useForm({
  validationSchema: toTypedSchema(zodSchema),
  initialValues,
})

// Create Method
const create = handleSubmit(async (values: FormInput) => {
  try {
    const response = await createIcoPhase(
      values.token_id.value,
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
      <BaseHeading size="lg">{{ $t('Create ICO Phase') }}</BaseHeading>
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
        @click="create"
      >
        {{ $t('Create Phase') }}
      </BaseButton>
    </template>
    <form @submit="create" class="space-y-8">
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
              label="Price"
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
          {{ $t('Create Phase') }}
        </BaseButton>
      </TairoFormSave>
    </form>
  </TairoContentWrapper>
</template>
