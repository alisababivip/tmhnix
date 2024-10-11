<script setup lang="ts">
import { useForm, Field } from 'vee-validate'
import { z } from 'zod'
import { useForexPlanStore } from '~~/store/extensions/forex/admin/plans'
import { useForexDurationStore } from '~~/store/extensions/forex/admin/durations'
import { toTypedSchema } from '@vee-validate/zod'

definePageMeta({
  title: 'Create Forex Plan',
  permissions: ['Create Forex Plans'],
})
const { toast } = useUtils()
const router = useRouter()

const forexPlanStore = useForexPlanStore()
const forexDurationStore = useForexDurationStore()
const { createForexPlan } = useForex()
const durations = computed(() =>
  forexDurationStore.durations.map((item) => ({
    label: `${item.duration} ${item.timeframe}`,
    value: item.id,
  })),
)

onMounted(async () => {
  if (forexDurationStore.durations.length === 0) {
    await forexDurationStore.fetchForexDurations()
  }
})

const selectedDurations = ref<string[]>([])

const selectAllDurations = () => {
  selectedDurations.value = durations.value
}

const clearSelection = () => {
  selectedDurations.value = []
}

type MultipleLabelData =
  | string
  | ((value: any[], labelProperty?: string | undefined) => string)
  | undefined

const multipleLabel = ref<MultipleLabelData>(
  (value: any[], labelProperty?: string): string => {
    if (value.length === 0) {
      return 'No duration selected'
    } else if (value.length > 1) {
      return `${value.length} durations selected`
    }
    return labelProperty ? String(value[0][labelProperty]) : String(value[0])
  },
)

// Validation
const zodSchema = z
  .object({
    title: z.string().nonempty('Title is required'),
    name: z.string().nonempty('Name is required'),
    description: z.string().nonempty('Description are required'),
    image: z.union([z.string(), z.null()]).optional(),
    min_amount: z
      .number()
      .min(0, 'Minimum amount must be greater or equal to 0'),
    max_amount: z.number().gt(0, 'Maximum amount must be greater than 0'),
    min_profit: z
      .number()
      .min(0, 'Minimum profit must be greater or equal to 0'),
    max_profit: z.number().gt(0, 'Maximum profit must be greater than 0'),
    default_profit: z
      .number()
      .min(0, 'Default profit must be greater or equal to 0'),
    default_result: z.enum(['WIN', 'LOSS', 'DRAW']),
    trending: z.boolean(),
    status: z.boolean(),
  })
  .refine((data) => data.max_amount > data.min_amount, {
    message: 'Maximum amount must be greater than minimum amount',
    path: ['max_amount'], // specify the field that will receive the error
  })

type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  title: '',
  name: '',
  description: '',
  image: null,
  min_amount: 0,
  max_amount: 0,
  default_profit: 0,
  default_result: 'WIN',
  min_profit: 0,
  max_profit: 0,
  trending: false,
  status: true,
}))

const { handleSubmit, isSubmitting, errors } = useForm({
  validationSchema: toTypedSchema(zodSchema),
  initialValues,
})

// Image File Handling
const imageFile = ref<FileList | null>(null)
const imagePreviewUrl = ref<string | null>(null)

watch(imageFile, (value) => {
  const file = value?.item(0) || null
  if (imageFile.value) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreviewUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
})

// Create Method
const create = handleSubmit(async (values: FormInput) => {
  try {
    let data = {
      ...values,
      image: '',
      durations: selectedDurations.value.map((item) => item.value),
    }

    if (imageFile.value) {
      // Create FormData for file upload
      const body = new FormData()
      body.append('files', imageFile.value[0])
      body.append('type', 'forexPlan')

      // Upload the file
      const uploadResponse = await useFetch('/api/upload', {
        method: 'POST',
        body,
      })

      // Check if the upload was successful and get the URL
      if (uploadResponse && uploadResponse.data.value !== '') {
        // Set the new image URL in the form values
        data.image = uploadResponse.data.value[0]
      }
    }

    const response = await createForexPlan(data)
    toast.response(response)
    if (response.status === 'success') {
      await forexPlanStore.fetchForexPlans()
      router.push('/admin/extensions/forex/plans')
    }
  } catch (error) {
    toast.danger(error as any)
  }
})
</script>

<template>
  <TairoContentWrapper>
    <template #left>
      <BaseHeading size="lg">{{ $t('Create Forex Plan') }}</BaseHeading>
    </template>
    <template #right>
      <BaseButton
        type="button"
        color="muted"
        class="hover:bg-gray-300 dark:hover:bg-gray-800"
        to="/admin/extensions/forex/plans"
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
        {{ $t('Create Plan') }}
      </BaseButton>
    </template>
    <form @submit="create" class="space-y-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <BaseCard class="p-5 space-y-5">
          <!-- Title -->
          <Field
            name="title"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="text"
              label="Title"
              placeholder="Enter title"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
            <small
              ><span class="text-warning-500 text-xs">{{
                $t('Title is used to identify the plan in the frontend.')
              }}</span></small
            >
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

            <small
              ><span class="text-warning-500 text-xs">{{
                $t(
                  'Name is used to identify the plan in the admin panel. It will not be shown in the frontend',
                )
              }}</span></small
            >
          </Field>
        </BaseCard>

        <BaseCard class="p-5">
          <!-- Image Upload Section -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <BaseInputFileHeadless
              v-model="imageFile"
              v-slot="{ open, remove, preview, drop, files }"
            >
              <div
                class=""
                @dragenter.stop.prevent
                @dragover.stop.prevent
                @drop="drop"
              >
                <div
                  v-if="!files?.length"
                  class="nui-focus border-muted-300 dark:border-muted-700 hover:border-muted-400 focus:border-muted-400 dark:hover:border-muted-600 dark:focus:border-muted-700 group cursor-pointer rounded-lg border-[3px] border-dashed transition-colors duration-300"
                  tabindex="0"
                  role="button"
                  @click="open"
                  @keydown.enter.prevent="open"
                >
                  <div class="p-5 text-center">
                    <Icon
                      name="mdi-light:cloud-upload"
                      class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 mb-2 h-10 w-10 transition-colors duration-300"
                    />

                    <h4 class="text-muted-400 font-sans text-sm">
                      {{ $t('Drop file to upload') }}
                    </h4>

                    <div>
                      <span
                        class="text-muted-400 font-sans text-[0.7rem] font-semibold uppercase"
                      >
                        {{ $t('Or') }}
                      </span>
                    </div>

                    <label
                      for="file"
                      class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 cursor-pointer font-sans text-sm underline underline-offset-4 transition-colors duration-300"
                    >
                      {{ $t('Select Image') }}
                    </label>
                  </div>
                </div>

                <ul v-else class="mt-6 space-y-2">
                  <li v-for="file in files" :key="file.name">
                    <div
                      class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-end gap-2 rounded-xl border bg-white p-3"
                    >
                      <div class="flex items-center gap-2">
                        <div class="shrink-0">
                          <img
                            class="h-14 w-14 rounded-xl object-cover object-center"
                            v-if="file.type.startsWith('image')"
                            :src="preview(file).value"
                            alt="Image preview"
                          />

                          <img
                            v-else
                            class="h-14 w-14 rounded-xl object-cover object-center"
                            src="/img/avatars/placeholder-file.png"
                            alt="Image preview"
                          />
                        </div>

                        <div class="font-sans">
                          <span
                            class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm"
                          >
                            {{ file.name }}
                          </span>

                          <span class="text-muted-400 block text-xs">
                            {{ formatFileSize(file.size) }}
                          </span>
                        </div>
                      </div>

                      <div
                        class="ms-auto w-32 px-4 transition-opacity duration-300"
                        :class="'opacity-100'"
                      >
                        <BaseProgress :value="0" size="xs" :color="'success'" />
                      </div>

                      <div class="flex gap-2">
                        <button
                          class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled
                          type="button"
                          tooltip="Cancel"
                        >
                          <Icon name="lucide:slash" class="h-4 w-4" />

                          <span class="sr-only">Cancel</span>
                        </button>

                        <button
                          class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                          type="button"
                          tooltip="Upload"
                        >
                          <Icon name="lucide:arrow-up" class="h-4 w-4" />

                          <span class="sr-only">Upload</span>
                        </button>

                        <button
                          class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                          type="button"
                          tooltip="Remove"
                          @click.prevent="remove(file)"
                        >
                          <Icon name="lucide:x" class="h-4 w-4" />

                          <span class="sr-only">Remove</span>
                        </button>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </BaseInputFileHeadless>
            <div
              v-if="imagePreviewUrl"
              class="mb-4 h-36 w-full flex items-center justify-center overflow-hidden rounded-xl"
            >
              <img
                :src="imagePreviewUrl"
                alt="Image Preview"
                class="max-h-full max-w-full object-cover object-center"
              />
            </div>
          </div>
        </BaseCard>
      </div>
      <BaseCard class="p-5">
        <!-- Description -->
        <Field
          name="description"
          v-slot="{ field, errorMessage, handleChange, handleBlur }"
        >
          <BaseTextarea
            v-model="field.value"
            :error="errorMessage"
            label="Description"
            shape="rounded"
            placeholder="Write a description"
            class="w-full"
            @update:model-value="handleChange"
            @blur="handleBlur"
          /> </Field
      ></BaseCard>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <BaseCard class="p-5 space-y-5">
          <!-- Minimum Profit -->
          <Field
            name="min_profit"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              type="number"
              label="Minimum Profit"
              placeholder="Enter minimum profit"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
            <small
              ><span class="text-warning-500 text-xs">{{
                $t('Minimum profit that can be earned in this plan.')
              }}</span></small
            >
          </Field>

          <!-- Maximum Profit -->
          <Field
            name="max_profit"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              type="number"
              label="Maximum Profit"
              placeholder="Enter maximum profit"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
            <small
              ><span class="text-warning-500 text-xs">{{
                $t('Maximum profit that can be earned in this plan.')
              }}</span></small
            >
          </Field>

          <div>
            <small
              ><span class="text-info-500 dark:text-info-400">{{
                $t(
                  'If the admin does not set any profit for the investment, this profit will be randomly between the minimum and maximum profit',
                )
              }}</span></small
            >
          </div>
        </BaseCard>
        <BaseCard class="p-5 space-y-5">
          <!-- Min Amount -->
          <Field
            name="min_amount"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              type="number"
              label="Minimum Amount"
              placeholder="Enter minimum amount"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
            <small
              ><span class="text-warning-500 text-xs">{{
                $t('Minimum amount that can be invested in this plan')
              }}</span></small
            >
          </Field>

          <!-- Max Amount -->
          <Field
            name="max_amount"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              type="number"
              label="Maximum Amount"
              placeholder="Enter maximum amount"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
            <small
              ><span class="text-warning-500 text-xs">{{
                $t('Maximum amount that can be invested in this plan')
              }}</span></small
            >
          </Field>
        </BaseCard>
        <BaseCard class="p-5 space-y-5">
          <!-- Default Profit -->
          <Field
            name="default_profit"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              type="number"
              label="Default Profit"
              placeholder="Enter default profit"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
            <small
              ><span class="text-warning-500 text-xs">{{
                $t(
                  'Default profit that will be used if the admin does not set any profit for the investment',
                )
              }}</span></small
            >
          </Field>

          <!-- Default Result -->
          <Field
            name="default_result"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseListbox
              :model-value="field.value"
              :error="errorMessage"
              :items="['WIN', 'LOSS', 'DRAW']"
              placeholder="Select a default result"
              label="Default Result"
              shape="rounded"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
            <small
              ><span class="text-warning-500 text-xs">{{
                $t(
                  'Default result that will be used if the admin does not set any result for the investment',
                )
              }}</span></small
            >
          </Field>
        </BaseCard>
      </div>
      <BaseCard class="p-5 flex gap-5">
        <div class="space-y-5 w-full">
          <div
            class="flex flex-col sm:flex-row justify-between items-center gap-5"
          >
            <BaseListbox
              shape="curved"
              v-model="selectedDurations"
              :multiple-label="multipleLabel"
              label="Durations"
              :items="durations"
              :properties="{
                value: 'value',
                label: 'label',
              }"
              multiple
              :disabled="durations?.length === 0"
              :loading="!durations"
            />
            <div class="flex justify-end gap-5 mt-5 w-full">
              <BaseButton
                @click="selectAllDurations"
                shape="curved"
                color="primary"
                >{{ $t('Select All') }}</BaseButton
              >
              <BaseButton
                @click="clearSelection"
                shape="curved"
                color="danger"
                >{{ $t('Clear Selection') }}</BaseButton
              >
            </div>
          </div>
          <div
            v-if="selectedDurations.length > 0"
            class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-t pt-5 border-gray-300 dark:border-gray-700"
          >
            <BaseTag
              v-for="item in selectedDurations"
              :key="item.id"
              shape="rounded"
              color="default"
              shadow="hover"
            >
              {{ item.label }}
            </BaseTag>
          </div>
        </div></BaseCard
      >

      <BaseCard class="p-5 flex gap-5">
        <!-- Trending -->
        <Field name="trending" v-slot="{ field, handleChange, handleBlur }">
          <BaseCheckbox
            v-model="field.value"
            label="Trending"
            shape="rounded"
            class="w-full"
            color="warning"
            @update:model-value="handleChange"
            @blur="handleBlur"
          />
        </Field>
        <!-- Status -->
        <Field name="status" v-slot="{ field, handleChange, handleBlur }">
          <BaseCheckbox
            v-model="field.value"
            label="Status"
            shape="rounded"
            class="w-full"
            color="success"
            @update:model-value="handleChange"
            @blur="handleBlur"
          />
        </Field>
      </BaseCard>

      <TairoFormSave>
        <BaseButton
          type="submit"
          color="primary"
          :disabled="isSubmitting"
          class="w-full"
        >
          {{ $t('Create Plan') }}
        </BaseButton>
      </TairoFormSave>
    </form>
  </TairoContentWrapper>
</template>
