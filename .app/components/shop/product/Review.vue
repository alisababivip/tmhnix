<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  fetchProduct: {
    type: Function,
    required: true,
  },
})

const { createReview } = useEcommerce()

const zodSchema = z.object({
  comment: z.string().min(1, 'comment is required'),
})

type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  comment: '',
}))

const { handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema,
  initialValues,
})

const { toast } = useUtils()
const reviewRating = ref(0)
const hoverRating = ref(0)
const onSubmit = handleSubmit(async (values) => {
  // fake delay, this will make isSubmitting value to be true
  const response = await createReview(
    props.product.id,
    reviewRating.value,
    values.comment,
  )
  toast.response(response)
  await props.fetchProduct()

  resetForm()
  reviewRating.value === 0
  hoverRating.value === 0
})
</script>

<template>
  <div class="space-y-2">
    <BaseCard class="p-5" v-for="(review, index) in product.reviews">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-4">
          <img
            :src="review.user?.avatar ?? `/img/avatars/${index + 1}.svg`"
            class="w-10 h-10 rounded-full"
          />
          <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
            {{ review.user?.first_name }}
            {{ review.user?.last_name }}
          </h3>
        </div>
        <div>
          <span v-for="i in 5">
            <Icon
              v-if="i <= review.rating"
              name="uim:star"
              class="w-4 h-4 text-yellow-400"
            />
            <Icon v-else name="uim:star" class="w-4 h-4 text-gray-300" />
          </span>
        </div>
      </div>
      <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">
        {{ review.comment }}
      </p>
    </BaseCard>
    <BaseCard class="p-5 space-y-5">
      <span v-for="i in 5" :key="i">
        <Icon
          name="uim:star"
          class="w-5 h-5"
          :class="{
            'text-yellow-400': i <= (hoverRating || reviewRating),
            'text-gray-300': i > (hoverRating || reviewRating),
            'hover:text-yellow-400': hoverRating === null,
          }"
          @mouseover="hoverRating = i"
          @mouseleave="hoverRating = null"
          @click="reviewRating = i"
        />
      </span>
      <Field
        v-slot="{ field, errorMessage, handleChange, handleBlur }"
        name="comment"
      >
        <BaseTextarea
          label="Message"
          placeholder="write your message..."
          :model-value="field.value"
          :error="errorMessage"
          :disabled="isSubmitting"
          @update:model-value="handleChange"
          @blur="handleBlur"
        />
      </Field>

      <div class="col-span-12">
        <BaseButton
          type="submit"
          class="w-full"
          color="primary"
          :disabled="isSubmitting"
          :loading="isSubmitting"
          @click="onSubmit"
          >Submit
        </BaseButton>
      </div>
    </BaseCard>
  </div>
</template>
