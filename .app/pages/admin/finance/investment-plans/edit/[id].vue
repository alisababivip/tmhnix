<script setup lang="ts">
import { useForm, Field } from 'vee-validate'
import { z } from 'zod'
import { useInvestmentPlanStore } from '~~/store/admin/investment/plan'
import { toTypedSchema } from '@vee-validate/zod'
definePageMeta({
  title: 'Edit Investment Plan',
  permissions: ['Edit Investment Plans'],
})
// Assuming you have the ID of the method you want to edit
const id = useRoute().params.id
const investmentPlanStore = useInvestmentPlanStore()
const { updateInvestmentPlan } = useInvestment()

const existingPlan = computed(
  () => investmentPlanStore.selectedPlan || investmentPlanStore.getPlanById(id),
)

onMounted(async () => {
  const methodId = Number(id)
  if (investmentPlanStore.plans.length === 0) {
    await investmentPlanStore.fetchInvestmentPlans()
  }
  investmentPlanStore.selectPlanById(methodId)
  imagePreviewUrl.value = existingPlan.value?.image || null
  if (!investmentPlanStore.selectedPlan) {
    router.push('/admin/finance/investment-plans')
  }
})

const { toast } = useUtils()
const router = useRouter()

// Validation
const zodSchema = z
  .object({
    title: z.string().nonempty('Title is required'),
    name: z.string().nonempty('Name is required'),
    description: z.string().nonempty('Description are required'),
    image: z.union([z.string(), z.null()]).optional(),
    roi: z
      .number()
      .min(0, 'ROI must be greater or equal to 0')
      .max(100, 'ROI must be less than or equal to 100')
      .refine(
        (value) => {
          // Validate up to 4 decimal places
          const factor = Math.pow(10, 4)
          return Math.round(value * factor) / factor === value
        },
        {
          message: 'ROI can have up to 4 decimal places',
        },
      ),
    min_amount: z
      .number()
      .min(0, 'Minimum amount must be greater or equal to 0'),
    max_amount: z.number().gt(0, 'Maximum amount must be greater than 0'),
    duration: z.number().min(1, 'Duration must be greater than 1 day'),
    currency: z.string().nonempty('Currency is required'),
  })
  .refine((data) => data.max_amount > data.min_amount, {
    message: 'Maximum amount must be greater than minimum amount',
    path: ['max_amount'], // specify the field that will receive the error
  })

type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => {
  return {
    ...existingPlan.value,
  }
})

const fiatCurrencyStore = useFiatCurrencyStore()
onMounted(async () => {
  if (fiatCurrencyStore.currencies.length === 0) {
    await fiatCurrencyStore.fetchCurrencies()
  }
})

const currencies = computed(() =>
  fiatCurrencyStore.currencies.filter((currency) => currency.status),
)

const { handleSubmit, isSubmitting, errors } = useForm({
  validationSchema: toTypedSchema(zodSchema),
  initialValues,
})

// Image File Handling
const imageFile = ref<FileList | null>(null)
const imagePreviewUrl = ref<string | null>(existingPlan.value?.image || null)
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
const update = handleSubmit(async (values: FormInput) => {
  try {
    let data = {
      ...values,
    }

    if (imageFile.value) {
      // Create FormData for file upload
      const body = new FormData()
      body.append('files', imageFile.value[0])
      body.append('type', 'investmentPlan')

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

    const response = await updateInvestmentPlan(id, data)
    if (response.status === 'success') {
      await investmentPlanStore.fetchInvestmentPlans()
      router.push('/admin/finance/investment-plans')
    }
  } catch (error) {
    toast.danger(error as any)
  }
})
</script>

<template>
  <TairoContentWrapper>
    <template #left>
      <BaseHeading size="lg">{{ $t('Edit Investment Plan') }}</BaseHeading>
    </template>
    <template #right>
      <BaseButton
        type="button"
        color="muted"
        to="/admin/finance/investment-plans"
      >
        <Icon name="line-md:chevron-left" class="h-4 w-4 mr-2" />
        {{ $t('Back') }}
      </BaseButton>
    </template>
    <form @submit="update" class="space-y-8">
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
                            loading="lazy"
                            class="h-14 w-14 rounded-xl object-cover object-center"
                            v-if="file.type.startsWith('image')"
                            :src="preview(file).value"
                            alt="Image preview"
                          />

                          <img
                            loading="lazy"
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
                loading="lazy"
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
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <BaseCard class="p-5 space-y-5">
          <!-- Duration -->
          <Field
            name="duration"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              type="number"
              label="Duration"
              placeholder="Enter duration in days"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
          <!-- ROI -->
          <Field
            name="roi"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              type="number"
              label="ROI"
              icon="%"
              placeholder="Return on investment (ROI) in % at the end of the plan"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </BaseCard>

        <BaseCard class="p-5 space-y-5">
          <!-- Currency -->
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="currency"
          >
            <BaseListbox
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              :items="currencies.map((currency) => currency.code)"
              :properties="{ label: 'label', value: 'value' }"
              placeholder="Please select a currency"
              label="Currency"
              shape="rounded"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
          <div class="flex gap-5 justify-between xs:flex-col">
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
            </Field>
          </div>
        </BaseCard>
      </div>

      <BaseButton
        type="submit"
        color="primary"
        :disabled="isSubmitting"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {{ $t('Update Plan') }}
      </BaseButton>
    </form>
  </TairoContentWrapper>
</template>
