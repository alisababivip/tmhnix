<script setup lang="ts">
import { useForm, Field } from 'vee-validate'
import { z } from 'zod'
import { useAdminEcommerceDiscountsStore } from '~~/store/extensions/ecommerce/admin/discounts'
import { toTypedSchema } from '@vee-validate/zod'
import type { EcommerceDiscount } from '~~/types'

const { id } = useRoute().params
const { toast } = useUtils()
const router = useRouter()

const adminDiscountsStore = useAdminEcommerceDiscountsStore()
const { updateAdminDiscount } = useEcommerce() // Make sure these functions are implemented and exported from your ecommerce composable

const discount = computed(
  () =>
    adminDiscountsStore.selectedDiscount ??
    adminDiscountsStore.getDiscountById(Number(id)),
)

onMounted(async () => {
  if (adminDiscountsStore.discounts.length === 0) {
    adminDiscountsStore.loading = true
    await adminDiscountsStore.fetchDiscounts()
    adminDiscountsStore.loading = false
  }
})

const zodSchema = z.object({
  code: z.string().nonempty('Discount code is required'),
  percentage: z
    .number()
    .min(0, 'Percentage must be greater than 0')
    .max(100, 'Percentage cannot exceed 100'),
  valid_until: z.date().optional(),
  product_id: z.number().positive('Product ID is required'),
})

type FormInput = z.infer<typeof zodSchema>

const { handleSubmit, isSubmitting, values, setFieldValue, resetForm } =
  useForm({
    validationSchema: toTypedSchema(zodSchema),
    initialValues: computed(() => discount.value),
  })

const update = handleSubmit(async (values: FormInput) => {
  try {
    const response = await updateAdminDiscount(
      Number(id),
      values.code,
      values.percentage,
      values.valid_until,
      values.product_id,
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
      <BaseHeading size="lg">{{ $t('Edit Discount') }}</BaseHeading>
    </template>
    <template #right>
      <BaseButton
        type="button"
        color="muted"
        class="hover:bg-gray-300 dark:hover:bg-gray-800"
        :to="'/admin/extensions/ecommerce/discounts'"
      >
        <Icon name="line-md:chevron-left" class="h-4 w-4 mr-2" />
        {{ $t('Back to Discounts') }}
      </BaseButton>
      <BaseButton
        type="submit"
        color="primary"
        :disabled="isSubmitting"
        class="ml-2"
        @click="update"
      >
        {{ $t('Save Changes') }}
      </BaseButton>
    </template>
    <form @submit.prevent="update" class="space-y-8">
      <BaseCard class="p-5 space-y-5">
        <Field
          name="code"
          v-slot="{ field, errorMessage, handleChange, handleBlur }"
        >
          <BaseInput
            v-model="field.value"
            :error="errorMessage"
            :disabled="isSubmitting"
            type="text"
            label="Code"
            placeholder="Enter code"
            shape="rounded"
            class="w-full"
            @update:model-value="handleChange"
            @blur="handleBlur"
          />
        </Field>

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

        <Field
          name="valid_until"
          v-slot="{ field, errorMessage, handleChange, handleBlur }"
        >
          <BaseInput
            v-model="field.value"
            :error="errorMessage"
            :disabled="isSubmitting"
            type="date"
            label="Valid Until"
            placeholder="Enter valid until"
            shape="rounded"
            class="w-full"
            @update:model-value="handleChange"
            @blur="handleBlur"
          />
        </Field>

        <Field name="product_id" v-slot="{ field, errorMessage }">
          <!-- Assume you have a BaseSelect or similar component for product selection -->
          <BaseSelect
            v-model="field.value"
            :error="errorMessage"
            label="Product"
            shape="rounded"
          >
            <!-- Options should be populated based on products available -->
            <!-- This is a placeholder, replace with actual product options -->
            <option
              v-for="product in products"
              :key="product.id"
              :value="product.id"
            >
              {{ product.name }}
            </option>
          </BaseSelect>
        </Field>

        <Field
          name="status"
          v-slot="{ field, errorMessage, handleChange, handleBlur }"
        >
          <BaseListbox
            :model-value="field.value"
            :error="errorMessage"
            :items="['ACTIVE', 'INACTIVE']"
            placeholder="Select a status"
            label="Status"
            shape="rounded"
            @update:model-value="handleChange"
            @blur="handleBlur"
          />
        </Field>
      </BaseCard>
    </form>
  </TairoContentWrapper>
</template>
