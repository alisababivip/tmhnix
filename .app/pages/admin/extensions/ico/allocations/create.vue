<script setup lang="ts">
import { useForm, Field } from 'vee-validate'
import { z } from 'zod'
import { useIcoAllocationStore } from '~~/store/extensions/ico/admin/allocations'
import { useIcoTokenStore } from '~~/store/extensions/ico/admin/tokens'
import { toTypedSchema } from '@vee-validate/zod'

definePageMeta({
  title: 'Create ICO Allocation',
  permissions: ['Create ICO Allocations'],
})
const { toast } = useUtils()
const router = useRouter()

const icoAllocationStore = useIcoAllocationStore()
const { createIcoAllocation } = useIco()
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

const zodPhaseAllocationSchema = z.object({
  phase_id: z.object({
    label: z.string(),
    value: z.number(),
  }),
  percentage: z
    .number()
    .min(0, 'Percentage must be greater than 0')
    .max(100, 'Percentage cannot exceed 100'),
})

// Validation
const zodSchema = z.object({
  name: z.string().nonempty('Name is required'),
  percentage: z
    .number()
    .min(0, 'Percentage must be greater than 0')
    .max(100, 'Total percentage cannot exceed 100'),
  token_id: z.object({
    label: z.string(),
    value: z.number(),
  }),
  phaseAllocations: z.array(zodPhaseAllocationSchema),
})

type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  name: '',
  percentage: 0,
  token_id: {
    label: 'Select a token',
    value: 0,
  },
  phaseAllocations: [],
}))

const { handleSubmit, isSubmitting, values, setFieldValue } = useForm({
  validationSchema: toTypedSchema(zodSchema),
  initialValues,
})

// Create Method
const create = handleSubmit(async (values: FormInput) => {
  try {
    const response = await createIcoAllocation(
      Number(values.token_id.value),
      values.name,
      Number(values.percentage),
      values.phaseAllocations.map((pa) => ({
        phase_id: Number(pa.phase_id.value),
        percentage: Number(pa.percentage),
      })),
    )
    toast.response(response)
    if (response.status === 'success') {
      await icoAllocationStore.fetchIcoAllocations()
      router.push('/admin/extensions/ico/allocations')
    }
  } catch (error) {
    toast.danger(error as any)
  }
})

// Add a new phase allocation to the array
const addPhaseAllocation = () => {
  // Get the last phase allocation
  const lastPhaseAllocation = values.phaseAllocations?.at(-1)

  // Check if the last phase allocation has a phase selected
  if (lastPhaseAllocation && lastPhaseAllocation.phase_id.value !== 0) {
    const newPhaseAllocation = {
      phase_id: {
        label: 'Select a phase',
        value: 0,
      },
      percentage: 0,
    }

    const updatedPhaseAllocations = [
      ...values.phaseAllocations,
      newPhaseAllocation,
    ]

    setFieldValue('phaseAllocations', updatedPhaseAllocations)
  } else if (!lastPhaseAllocation) {
    // If there are no phase allocations, add the first one
    const newPhaseAllocation = {
      phase_id: {
        label: 'Select a phase',
        value: 0,
      },
      percentage: 0,
    }

    setFieldValue('phaseAllocations', [newPhaseAllocation])
  } else {
    // If the last phase allocation has not had a phase selected, do not add a new one
    toast.dangerText(
      'Please select a phase for the existing allocation before adding a new one.',
    )
  }
}

// Remove a phase allocation from the array
const removePhaseAllocation = (index: number) => {
  const updatedPhaseAllocations = values.phaseAllocations?.filter(
    (_, i) => i !== index,
  )
  setFieldValue('phaseAllocations', updatedPhaseAllocations)
}

const availablePhases = computed(() => {
  // Ensure that tokens are loaded
  if (!tokens.value) {
    return []
  }

  // Find the selected token's phases, if the token and phases are defined
  const selectedToken = tokens.value.find(
    (token) => token.id === values.token_id?.value,
  )
  const selectedTokenPhases = selectedToken?.phases || []

  // Get the ids of the phases that have already been allocated
  const allocatedPhaseIds = new Set(
    values.phaseAllocations?.map((allocation) => allocation.phase_id.value),
  )

  // Return the phases that haven't been allocated yet
  return selectedTokenPhases.filter(
    (phase) => phase && !allocatedPhaseIds.has(phase.id),
  )
})
</script>

<template>
  <TairoContentWrapper>
    <template #left>
      <BaseHeading size="lg">{{ $t('Create ICO Allocation') }}</BaseHeading>
    </template>
    <template #right>
      <BaseButton
        type="button"
        color="muted"
        class="hover:bg-gray-300 dark:hover:bg-gray-800"
        to="/admin/extensions/ico/allocations"
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
        {{ $t('Create Allocation') }}
      </BaseButton>
    </template>
    <form @submit="create" class="space-y-8">
      <BaseCard class="p-5 space-y-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
              placeholder="Enter name (e.g. Investors)"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <!-- Percentage -->
          <Field
            name="percentage"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="number"
              label="Percentage"
              placeholder="Enter percentage"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>
      </BaseCard>

      <!-- Phase Allocations -->
      <BaseCard class="p-5 space-y-5" v-if="values.token_id?.value !== 0">
        <div class="grid grid-cols-1 gap-6">
          <div
            v-for="(phaseAllocation, index) in values.phaseAllocations"
            :key="index"
          >
            <div class="flex items-end space-x-4">
              <!-- Phase Selector -->
              <Field
                :name="`phaseAllocations[${index}].phase_id`"
                v-slot="{ field, errorMessage, handleChange, handleBlur }"
              >
                <BaseListbox
                  :model-value="field.value"
                  :error="errorMessage"
                  :items="
                    availablePhases.map((phase) => ({
                      label: phase.name,
                      value: phase.id,
                    }))
                  "
                  :properties="{ label: 'label', value: 'value' }"
                  placeholder="Select a phase"
                  label="Phase"
                  shape="rounded"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                />
              </Field>

              <!-- Percentage Input -->
              <Field
                :name="`phaseAllocations[${index}].percentage`"
                v-slot="{ field, errorMessage, handleChange, handleBlur }"
              >
                <BaseInput
                  v-model="field.value"
                  :error="errorMessage"
                  :disabled="isSubmitting"
                  type="number"
                  label="Percentage"
                  placeholder="Enter percentage for this phase"
                  shape="rounded"
                  class="w-full"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                />
              </Field>

              <!-- Remove Button -->
              <TairoButtonIcon
                type="button"
                color="danger"
                @click="removePhaseAllocation(index)"
              >
                <Icon name="line-md:close" class="h-4 w-4" />
              </TairoButtonIcon>
            </div>
          </div>

          <!-- Add Phase Allocation Button -->
          <BaseButton
            color="primary"
            @click="addPhaseAllocation"
            v-if="availablePhases.length > 0"
          >
            Add Phase Allocation
          </BaseButton>
        </div>
      </BaseCard>

      <TairoFormSave>
        <BaseButton
          type="submit"
          color="primary"
          :disabled="isSubmitting"
          class="w-full"
        >
          {{ $t('Create Allocation') }}
        </BaseButton>
      </TairoFormSave>
    </form>
  </TairoContentWrapper>
</template>
