<script setup lang="ts">
import { useForm, Field } from 'vee-validate'
import { z } from 'zod'
import { useDepositGatewayStore } from '~~/store/admin/deposit/gateways'
import { toTypedSchema } from '@vee-validate/zod'
definePageMeta({
  title: 'Edit Deposit Gateway',
  permissions: ['Edit Deposit Gateways'],
})
// Assuming you have the ID of the gateway you want to edit
const id = useRoute().params.id
const depositGatewayStore = useDepositGatewayStore()
const { updateDepositGateway } = useWallet()
const existingGateway = computed(
  () =>
    depositGatewayStore.selectedGateway ||
    depositGatewayStore.getGatewayById(id),
)

// Image File Handling
const imageFile = ref<FileList | null>(null)
const imagePreviewUrl = ref<string | null>(existingGateway.value?.image || null)

onMounted(async () => {
  const gatewayId = Number(id)
  if (depositGatewayStore.gateways.length === 0) {
    await depositGatewayStore.fetchDepositGateways()
  }
  depositGatewayStore.selectGatewayById(gatewayId)
  imagePreviewUrl.value = existingGateway.value?.image || null
  if (!depositGatewayStore.selectedGateway) {
    router.push('/admin/finance/deposit/gateways')
  }
})

const { toast } = useUtils()
const router = useRouter()

// Validation
const zodSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(3, 'Description must be at least 3 characters'),
  image: z.union([z.string(), z.null()]).optional(),
  fixed_fee: z.number().min(0, 'Fixed fee must be greater or equal to 0'),
  percentage_fee: z
    .number()
    .min(0, 'Percentage fee must be greater or equal to 0')
    .max(100, 'Percentage fee must be less than or equal to 100'),
  min_amount: z.number().min(0, 'Minimum amount must be greater or equal to 0'),
  max_amount: z.number().min(0, 'Maximum amount must be greater or equal to 0'),
})

type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  ...existingGateway.value,
}))

const { handleSubmit, isSubmitting, resetForm, setFieldValue } = useForm({
  validationSchema: toTypedSchema(zodSchema),
  initialValues,
})

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

// Create Gateway
const update = handleSubmit(async (values: FormInput) => {
  try {
    let data = {
      ...values,
    }

    if (imageFile.value) {
      // Create FormData for file upload
      const body = new FormData()
      body.append('files', imageFile.value[0])
      body.append('type', 'depositGateways')

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

    const response = await updateDepositGateway(id, data)

    toast.response(response)
    if (response.status === 'success') {
      await depositGatewayStore.fetchDepositGateways()
      router.push('/admin/finance/deposit/gateways')
      resetForm()
    }
  } catch (error) {
    toast.danger(error as any)
  }
})
</script>

<template>
  <TairoContentWrapper>
    <template #left>
      <BaseHeading size="lg"
        >{{ $t('Edit') }} {{ depositGatewayStore.selectedGateway?.title }}
        {{ $t('Gateway') }}</BaseHeading
      >
    </template>
    <template #right>
      <BaseButton
        type="button"
        color="muted"
        to="/admin/finance/deposit/gateways"
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
          <Field
            name="description"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="text"
              label="Description"
              placeholder="Enter description"
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

                          <span class="sr-only">{{ $t('Cancel') }}</span>
                        </button>

                        <button
                          class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                          type="button"
                          tooltip="Upload"
                        >
                          <Icon name="lucide:arrow-up" class="h-4 w-4" />

                          <span class="sr-only">{{ $t('Upload') }}</span>
                        </button>

                        <button
                          class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                          type="button"
                          tooltip="Remove"
                          @click.prevent="remove(file)"
                        >
                          <Icon name="lucide:x" class="h-4 w-4" />

                          <span class="sr-only">{{ $t('Remove') }}</span>
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
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <BaseCard class="p-5 space-y-5">
          <!-- Fixed Fee -->
          <Field
            name="fixed_fee"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              type="number"
              label="Fixed Fee"
              placeholder="Enter fixed fee"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <!-- Percentage fee -->
          <Field
            name="percentage_fee"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              type="number"
              label="Percentage fee"
              placeholder="Enter Percentage fee"
              shape="rounded"
              min="0"
              max="100"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
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
        </BaseCard>
      </div>

      <BaseCard
        class="p-5 space-y-5"
        v-if="depositGatewayStore.selectedGateway?.currencies"
      >
        <BaseHeading size="lg">{{ $t('Supported Currencies') }}</BaseHeading>
        <div class="flex flex-wrap gap-2 items-center justify-start">
          <BaseTag
            v-for="currency in depositGatewayStore.selectedGateway?.currencies"
            :key="currency"
            class="w-full md:w-auto"
          >
            {{ currency }}
          </BaseTag>
        </div>
      </BaseCard>

      <div class="mx-auto flex items-center justify-center">
        <div
          class="px-3 py-2 bg-white dark:bg-muted-900 dark:text-muted-200 text-muted-700 rounded-lg shadow-md flex items-center justify-center gap-3"
        >
          <BaseButton
            type="button"
            color="muted"
            to="/admin/finance/deposit/gateways"
          >
            <Icon name="line-md:close" class="h-4 w-4 mr-2" />
            {{ $t('Cancel') }}
          </BaseButton>
          <BaseButton
            type="submit"
            color="success"
            :disabled="isSubmitting"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Icon name="line-md:confirm" class="h-4 w-4 mr-2" />
            {{ $t('Update') }}
          </BaseButton>
        </div>
      </div>
    </form>
  </TairoContentWrapper>
</template>
