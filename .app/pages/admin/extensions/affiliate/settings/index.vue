<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  title: 'MLM Settings',
})

const { updateSettings } = useSettings()
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const mlmSystem = computed(() =>
  settings.value?.mlm_system ? settings.value?.mlm_system : 'DIRECT',
)
const { toast } = useUtils()

const zodSchema = z
  .object({
    mlm_system: z.enum(['DIRECT', 'BINARY', 'UNILEVEL']),
    binary: z
      .object({
        levels: z.number().min(1).max(7),
      })
      .optional()
      .refine((data) => values.mlm_system !== 'BINARY' || data !== undefined, {
        message: "Binary levels are required when 'BINARY' system is selected",
        path: ['binary'],
      }),
    unilevel: z
      .object({
        levels: z.number().min(1).max(7),
      })
      .optional()
      .refine(
        (data) => values.mlm_system !== 'UNILEVEL' || data !== undefined,
        {
          message:
            "Unilevel levels are required when 'UNILEVEL' system is selected",
          path: ['unilevel'],
        },
      ),
  })
  .refine(
    (data) =>
      data.mlm_system !== 'DIRECT' ||
      (data.binary === undefined && data.unilevel === undefined),
    {
      message: "No additional settings are needed for 'DIRECT' system",
      path: ['mlm_system'],
    },
  )

type FormInput = z.infer<typeof zodSchema>
const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => {
  const mlmSettings = settings.value.mlm_settings
    ? settings.value.mlm_settings
    : { binary: { levels: 3 }, unilevel: { levels: 3 } }
  return {
    mlm_system: mlmSystem.value,
    binary:
      mlmSystem.value === 'BINARY'
        ? { levels: mlmSettings.binary.levels }
        : undefined,
    unilevel:
      mlmSystem.value === 'UNILEVEL'
        ? { levels: mlmSettings.unilevel.levels }
        : undefined,
  }
})

const { handleSubmit, isSubmitting, meta, values } = useForm({
  validationSchema,
  initialValues,
})

const onSubmit = handleSubmit(async (values) => {
  try {
    const updatedMlmSettings = { ...settings.value.mlm_settings }

    // Function to update or initialize levels_percentage with zeros
    const updateLevelsPercentage = (currentLevels, numLevels) => {
      const updatedLevels = new Array(numLevels).fill(null).map((_, index) => {
        const level = index + 1
        const existing = currentLevels.find((l) => l.level === level)
        return existing || { level, value: 0 }
      })
      return updatedLevels
    }

    // Update the levels and levels_percentage based on the selected mlm_system
    switch (values.mlm_system) {
      case 'BINARY':
        updatedMlmSettings.binary = updatedMlmSettings.binary || {}
        updatedMlmSettings.binary.levels = values.binary?.levels
        // Update levels_percentage
        updatedMlmSettings.binary.levels_percentage = updateLevelsPercentage(
          updatedMlmSettings.binary.levels_percentage || [],
          values.binary?.levels,
        )
        break
      case 'UNILEVEL':
        updatedMlmSettings.unilevel = updatedMlmSettings.unilevel || {}
        updatedMlmSettings.unilevel.levels = values.unilevel?.levels
        // Update levels_percentage
        updatedMlmSettings.unilevel.levels_percentage = updateLevelsPercentage(
          updatedMlmSettings.unilevel.levels_percentage || [],
          values.unilevel?.levels,
        )
        break
      case 'DIRECT':
        // Handle DIRECT system case if needed
        break
      default:
        // Handle default case if needed
        break
    }

    const updatedMlmSettingsJson = JSON.stringify(updatedMlmSettings)

    // Send the formData to the server
    const response = await updateSettings({
      mlm_settings: updatedMlmSettingsJson,
      mlm_system: values.mlm_system,
    })

    toast.response(response)

    if (response.status === 'success') {
      settingsStore.setSettings(Object.values(response.data.result))
    }
  } catch (error) {
    toast.danger(error)
  }
})
</script>

<template>
  <div>
    <form
      method="POST"
      action=""
      class="w-full pb-16"
      @submit.prevent="onSubmit"
    >
      <BaseCard>
        <div class="flex items-center justify-between p-4">
          <div>
            <BaseHeading
              tag="h2"
              size="sm"
              weight="medium"
              lead="normal"
              class="uppercase tracking-wider"
            >
              {{ $t('System Settings') }}
            </BaseHeading>
            <BaseText size="xs" class="text-muted-400">
              {{ $t('Configure your mlm system settings') }}
            </BaseText>
          </div>
          <div class="flex items-center gap-2">
            <BaseButton
              type="submit"
              color="primary"
              class="w-24"
              v-can="'Edit Settings'"
              :disabled="isSubmitting || !meta.dirty"
              :loading="isSubmitting"
              >{{ $t('Save') }}</BaseButton
            >
          </div>
        </div>
        <div class="px-8">
          <div class="mx-auto space-y-12 py-8">
            <div class="grid grid-cols-12 gap-4 pt-2">
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="mlm_system"
                >
                  <BaseListbox
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    :items="['DIRECT', 'BINARY', 'UNILEVEL']"
                    placeholder="Select mlm system"
                    label="System"
                    shape="rounded"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div
                class="col-span-12 sm:col-span-6"
                v-if="values.mlm_system === 'BINARY'"
              >
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="binary.levels"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="number"
                    min="2"
                    max="7"
                    step="1"
                    placeholder="Enter binary levels"
                    label="Levels"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div
                class="col-span-12 sm:col-span-6"
                v-if="values.mlm_system === 'UNILEVEL'"
              >
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="unilevel.levels"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="number"
                    min="2"
                    max="7"
                    step="1"
                    placeholder="Enter unilevel levels"
                    label="Levels"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div
                class="col-span-12 pt-5 border-t border-gray-300 dark:border-gray-700"
              >
                <BaseList>
                  <BaseListItem
                    title="Direct MLM System"
                    subtitle="is a single level system where each user is directly connected to the sponsor, and there are no levels in between."
                  />
                  <BaseListItem
                    title="Binary MLM System"
                    subtitle="is a two level system where each user can have two direct referrals, and each of those referrals can have two direct referrals."
                  />
                  <BaseListItem
                    title="Unilevel MLM System"
                    subtitle="is a multi level system where each user can have multiple direct referrals, and each of those referrals can have multiple direct referrals."
                  />
                </BaseList>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
    </form>
  </div>
</template>
