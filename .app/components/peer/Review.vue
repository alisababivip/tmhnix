<script lang="ts" setup>
import { useUserP2PTradesStore } from '~~/store/extensions/p2p/user/trades'
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

const tradeStore = useUserP2PTradesStore()
const props = defineProps({
  trade: {
    type: Object,
    required: true,
  },
  closeReviewing: {
    type: Function,
    required: true,
  },
})

const { createUserP2PReview } = useP2P()

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
  const response = await createUserP2PReview(
    props.trade.offer.uuid,
    reviewRating.value,
    values.comment,
  )
  toast.response(response)
  if (response.status === 'success') {
    await tradeStore.fetchP2PTrade(props.trade.uuid)
  }
  props.closeReviewing()

  resetForm()
  reviewRating.value === 0
  hoverRating.value === 0
})
</script>

<template>
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
</template>
