<script setup lang="ts">
import { useForm, Field } from 'vee-validate'
import { z } from 'zod'
import { useAdminEcommerceProductsStore } from '~~/store/extensions/ecommerce/admin/products'
import { useAdminEcommerceDiscountsStore } from '~~/store/extensions/ecommerce/admin/discounts'
import { toTypedSchema } from '@vee-validate/zod'

definePageMeta({
  title: 'Create Ecommerce Discount',
  permissions: ['Create Ecommerce Discount'],
})

const { toast } = useUtils()
const router = useRouter()

const adminProductsStore = useAdminEcommerceProductsStore()
const adminDiscountsStore = useAdminEcommerceDiscountsStore()
const { createAdminDiscount } = useEcommerce()

const products = computed(() => adminProductsStore.products)

onMounted(async () => {
  if (adminProductsStore.products.length === 0) {
    await adminProductsStore.fetchProducts()
  }
  if (adminProductsStore.products.length === 0) {
    router.push('/admin/extensions/ecommerce/products/create')
    toast.dangerText('You need to create a product first')
  }
})

const zodSchema = z.object({
  code: z.string().nonempty('Discount code is required'),
  percentage: z
    .number()
    .min(0, 'Percentage must be greater than 0')
    .max(100, 'Percentage cannot exceed 100'),
  valid_until: z.string(),
  product: z.object({
    label: z.string(),
    value: z.number(),
  }),
})

type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  code: '',
  percentage: 0,
  valid_until: '',
  product: {
    label: 'Select a product',
    value: 0,
  },
}))

const { handleSubmit, isSubmitting, values } = useForm({
  validationSchema: toTypedSchema(zodSchema),
  initialValues,
})

// Create Method
const create = handleSubmit(async (values: FormInput) => {
  try {
    const response = await createAdminDiscount(
      values.code,
      values.percentage,
      values.valid_until,
      values.product.value,
    )
    toast.response(response)
    if (response.status === 'success') {
      await adminDiscountsStore.fetchDiscounts()
      router.push('/admin/extensions/ecommerce/discounts')
    }
  } catch (error) {
    toast.danger(error as any)
  }
})
</script>

<template>
  <TairoContentWrapper>
    <template #left>
      <BaseHeading size="lg">{{ $t('Create Discount') }}</BaseHeading>
    </template>
    <template #right>
      <BaseButton
        type="button"
        color="muted"
        class="hover:bg-gray-300 dark:hover:bg-gray-800"
        :to="'/admin/extensions/ecommerce/discounts'"
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
        {{ $t('Create Discount') }}
      </BaseButton>
    </template>
    <form @submit.prevent="create" class="space-y-8">
      <BaseCard class="p-5 space-y-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <!-- Product ID -->
          <Field
            name="product"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseListbox
              :model-value="field.value"
              :error="errorMessage"
              :items="
                products?.map((product) => ({
                  label: product.name,
                  value: product.id,
                }))
              "
              :properties="{ label: 'label', value: 'value' }"
              placeholder="Select a product"
              label="Product"
              shape="rounded"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
          <!-- Code -->
          <Field
            name="code"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              label="Code"
              placeholder="Enter discount code"
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
              label="Percentage"
              placeholder="Enter discount percentage"
              type="number"
              min="0"
              max="100"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <!-- Valid Until -->
          <Field
            name="valid_until"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              label="Valid Until"
              placeholder="Enter validity date"
              type="datetime-local"
              shape="rounded"
              class="w-full"
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
          {{ $t('Create Discount') }}
        </BaseButton>
      </TairoFormSave>
    </form>
  </TairoContentWrapper>
</template>
