<script setup lang="ts">
import { useForm, Field } from 'vee-validate'
import { z } from 'zod'
import { useEcosystemAdminTokenStore } from '~~/store/extensions/ecosystem/tokens/admin'
import { useAdminEcommerceProductsStore } from '~~/store/extensions/ecommerce/admin/products'
import { useAdminEcommerceCategoriesStore } from '~~/store/extensions/ecommerce/admin/categories'
import { toTypedSchema } from '@vee-validate/zod'

definePageMeta({
  title: 'Create Ecommerce Product',
  permissions: ['Create Ecommerce Product'],
})

const { toast } = useUtils()
const router = useRouter()

const adminProductsStore = useAdminEcommerceProductsStore()
const adminCategoriesStore = useAdminEcommerceCategoriesStore()
const { createAdminProduct } = useEcommerce()

const extensionStore = useExtensionStore()
const extensions = computed(() => extensionStore.extensions)
const ecosystemExtension = computed(
  () => extensions.value?.find((extension) => extension.name === 'ecosystem'),
)
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const currencyStore = useCurrencyStore()
const currencies = computed(() => currencyStore.currencies)

const fiatCurrencyStore = useFiatCurrencyStore()
const fiatCurrencies = computed(() => fiatCurrencyStore.currencies)

const ecosystemAdminTokenStore = useEcosystemAdminTokenStore()
const ecoCurrencies = computed(() => ecosystemAdminTokenStore.tokens)

const validWalletTypes: string[] = ['FIAT']

onMounted(async () => {
  if (adminCategoriesStore.categories.length === 0) {
    adminCategoriesStore.loading = true
    await adminCategoriesStore.fetchCategories()
    adminCategoriesStore.loading = false
  }
  if (categories.value.length === 0) {
    router.push('/admin/extensions/ecommerce/categories/create')
    toast.dangerText('You must create a category before creating a product.')
  }
  if (extensionStore.extensions.length === 0) {
    await extensionStore.fetchExtensions()
  }
  if (settings.value?.spot_exchange) {
    validWalletTypes.push('SPOT')
    if (currencyStore.currencies.length === 0) {
      await currencyStore.fetchCurrencies()
    }
  }
  if (ecosystemExtension.value?.status) {
    validWalletTypes.push('ECO')
    if (ecosystemAdminTokenStore.tokens.length === 0) {
      await ecosystemAdminTokenStore.fetchTokensAll()
    }
  }
  if (fiatCurrencyStore.currencies.length === 0) {
    await fiatCurrencyStore.fetchCurrencies()
  }
  resetForm()
})

const availablePurchaseCurrencies = computed(() => {
  let allCurrencies: string[] = []
  if (values.wallet_type === 'SPOT') {
    allCurrencies = currencies.value.map((item) => item.currency)
  } else if (values.wallet_type === 'ECO') {
    allCurrencies = ecoCurrencies.value.map((item) => item.currency)
  } else if (values.wallet_type === 'FIAT') {
    allCurrencies = fiatCurrencies.value.map((item) => item.code)
  }

  // Use a Set to remove duplicates and then spread it into an array
  const uniqueCurrencies = [...new Set(allCurrencies)]
  return uniqueCurrencies
})

const categories = computed(() => adminCategoriesStore.categories)

const zodSchema = z.object({
  name: z.string().nonempty('Name is required'),
  description: z.string().nonempty('Description is required'),
  type: z.enum(['DOWNLOADABLE', 'KEY']),
  price: z.number().min(0, 'Price must be greater than 0'),
  currency: z.string().nonempty('Currency is required'),
  wallet_type: z.enum(validWalletTypes),
  category: z.object({
    label: z.string(),
    value: z.number().positive('Category is required'),
  }),
  inventory_quantity: z
    .number()
    .min(0, 'Inventory Quantity must be non-negative'),
  file_path: z.string().optional(),
})

type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  name: '',
  description: '',
  type: 'DOWNLOADABLE',
  price: 0,
  currency: '',
  wallet_type: 'FIAT',
  category: {
    label: 'Select a category',
    value: 0,
  },
  inventory_quantity: 0,
  file_path: '',
}))

const { handleSubmit, isSubmitting, values, resetForm } = useForm({
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
    let image = null
    if (imageFile.value) {
      // Create FormData for file upload
      const body = new FormData()
      body.append('files', imageFile.value[0])
      body.append('type', 'ecommerceProducts')

      // Upload the file
      const uploadResponse = await useFetch('/api/upload', {
        method: 'POST',
        body,
      })

      // Check if the upload was successful and get the URL
      if (uploadResponse && uploadResponse.data.value !== '') {
        // Set the new image URL in the form values
        image = uploadResponse.data.value[0]
      }
    }

    const response = await createAdminProduct(
      values.name,
      values.description,
      values.type,
      values.price,
      values.currency,
      values.wallet_type,
      values.category.value,
      values.inventory_quantity,
      values.file_path,
      image,
    )
    toast.response(response)
    if (response.status === 'success') {
      await adminProductsStore.fetchProducts()
      router.push('/admin/extensions/ecommerce/products')
    }
  } catch (error) {
    toast.danger(error as any)
  }
})

// Add any additional methods or computed properties as needed
</script>
<template>
  <TairoContentWrapper>
    <template #left>
      <BaseHeading size="lg">{{ $t('Create Product') }}</BaseHeading>
    </template>
    <template #right>
      <BaseButton
        type="button"
        color="muted"
        class="hover:bg-gray-300 dark:hover:bg-gray-800"
        :to="'/admin/extensions/ecommerce/products'"
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
        {{ $t('Create') }}
      </BaseButton>
    </template>
    <form @submit.prevent="create" class="space-y-8">
      <BaseCard class="p-5 space-y-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <!-- Category -->
          <Field
            name="category"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseListbox
              :model-value="field.value"
              :error="errorMessage"
              :items="
                categories?.map((category) => ({
                  label: category.name,
                  value: category.id,
                }))
              "
              :properties="{ label: 'label', value: 'value' }"
              placeholder="Select a category"
              label="Category"
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
              label="Name"
              placeholder="Enter product name"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <!-- Description -->
          <Field
            name="description"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              label="Description"
              placeholder="Enter product description"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <!-- Type -->
          <Field
            name="type"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseListbox
              :model-value="field.value"
              :error="errorMessage"
              :items="['DOWNLOADABLE', 'KEY']"
              placeholder="Select a type"
              label="Type"
              shape="rounded"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <Field
            name="wallet_type"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseListbox
              :model-value="field.value"
              :error="errorMessage"
              :items="validWalletTypes"
              label="Purchase Wallet Type"
              placeholder="Select wallet type"
              shape="rounded"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <!-- currency -->
          <Field
            name="currency"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseListbox
              :model-value="field.value"
              :error="errorMessage"
              :items="availablePurchaseCurrencies"
              label="Purchase Currency"
              placeholder="Select purchase currency"
              :disabled="!values?.type || values?.type === ''"
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
              label="Price"
              placeholder="Enter product price"
              shape="rounded"
              class="w-full"
              type="number"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <!-- Inventory Quantity -->
          <Field
            name="inventory_quantity"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              label="Inventory Quantity"
              placeholder="Enter inventory quantity"
              shape="rounded"
              class="w-full"
              type="number"
              min="0"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <!-- File Path -->
          <Field
            name="file_path"
            v-if="values.type === 'DOWNLOADABLE'"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <!-- Include a file input if needed for downloadable products -->
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              label="File Path"
              placeholder="Enter file url"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
            <!-- You may want to include a file picker here -->
          </Field>
        </div>
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
        <div>
          <span
            class="text-warning-400 dark:text-warning-600 font-sans text-[0.7rem] font-semibold"
          >
            {{ $t('Note') }}: Preferred image size is 600x400px
          </span>
        </div>
      </BaseCard>

      <TairoFormSave>
        <BaseButton
          type="submit"
          color="primary"
          :disabled="isSubmitting"
          class="w-full"
        >
          {{ $t('Create Product') }}
        </BaseButton>
      </TairoFormSave>
    </form>
  </TairoContentWrapper>
</template>
