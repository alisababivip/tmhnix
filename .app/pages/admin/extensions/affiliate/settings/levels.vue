<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  title: 'General Settings',
})

const { updateSettings } = useSettings()
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)
const { toast } = useUtils()

const mlmSystem = computed(() =>
  settingsStore.settings.mlm_system
    ? settingsStore.settings.mlm_system.toLowerCase()
    : 'direct',
)

// Compute the number of levels
const numberOfLevels = computed(() => {
  return settingsStore.settings.mlm_settings[mlmSystem.value]?.levels || 3
})

// Create a reactive schema based on the number of levels
const zodSchema = computed(() => {
  let schema: any = {}
  for (let i = 1; i <= numberOfLevels.value; i++) {
    schema[`level_${i}_percentage`] = z.number().min(0).max(100)
  }
  return z.object(schema)
})

// Generate initial values for each level's percentage

const validationSchema = toTypedSchema(zodSchema.value)
const initialValues = computed(() => {
  let values = {}
  const levelPercentages = Array.isArray(
    settingsStore.settings.mlm_settings[mlmSystem.value]?.levels_percentage,
  )
    ? settingsStore.settings.mlm_settings[mlmSystem.value].levels_percentage
    : []

  // Iterate over levelPercentages if it's an array
  levelPercentages.forEach((levelInfo) => {
    values[`level_${levelInfo.level}_percentage`] = levelInfo.value
  })

  // Filling in missing levels with default value
  for (let i = 1; i <= numberOfLevels.value; i++) {
    if (!(values[`level_${i}_percentage`] >= 0)) {
      values[`level_${i}_percentage`] = 0
    }
  }

  return values
})

const { handleSubmit, meta, values, isSubmitting } = useForm({
  validationSchema,
  initialValues,
})

const onSubmit = handleSubmit(async (formValues) => {
  try {
    // Construct levels_percentage as an array of objects
    const levelsPercentage = []
    for (let i = 1; i <= numberOfLevels.value; i++) {
      levelsPercentage.push({
        level: i,
        value: formValues[`level_${i}_percentage`],
      })
    }

    // Update the MLM settings with the new levels percentage structure
    const updatedMlmSettings = {
      ...settingsStore.settings.mlm_settings,
      [mlmSystem.value]: {
        ...settingsStore.settings.mlm_settings[mlmSystem.value],
        levels_percentage: levelsPercentage,
      },
    }

    // Prepare the submission data
    const mlmSettingsJson = JSON.stringify(updatedMlmSettings)
    const formData = {
      ...settings.value, // Include other settings if necessary
      mlm_settings: mlmSettingsJson,
    }

    const response = await updateSettings(formData)
    toast.response(response)

    if (response.status === 'success') {
      // Update local state with the new settings
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
              {{ $t('Levels Percentage') }}
            </BaseHeading>
            <BaseText size="xs" class="text-muted-400">
              {{ $t('Set the percentage for each level') }}
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
              <div
                class="col-span-4 sm:col-span-3"
                v-for="level in numberOfLevels"
                :key="`level_${level}_percentage`"
              >
                <Field
                  :name="`level_${level}_percentage`"
                  v-slot="{ field, errorMessage, handleBlur, handleChange }"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    :label="`Level ${level} Percentage`"
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
                    title="MLM Rewards System"
                    subtitle="Client referrer will get last level percentage * condition reward, next upline will get the next level percentage of the condition reward, and so on."
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
