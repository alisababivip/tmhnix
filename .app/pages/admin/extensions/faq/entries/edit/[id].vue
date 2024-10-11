<script setup lang="ts">
import { useForm, Field } from 'vee-validate'
import { z } from 'zod'
import { useAdminFaqEntriesStore } from '~~/store/extensions/faq/admin/entries'
import { toTypedSchema } from '@vee-validate/zod'

definePageMeta({
  title: 'Edit FAQ Entry',
  permissions: ['Edit FAQ'],
})
const { toast } = useUtils()
const router = useRouter()
const { id } = useRoute().params

const faqEntriestore = useAdminFaqEntriesStore()
const { updateAdminFaq } = useFaq()
const existingEntry = computed(
  () => faqEntriestore.selectedFaq || faqEntriestore.getFaqById(id),
)

onMounted(async () => {
  const entryId = Number(id)
  if (faqEntriestore.faqs.length === 0) {
    await faqEntriestore.fetchFaqs()
  }
  await faqEntriestore.selectEntryById(entryId)
})

// Validation
const zodSchema = z.object({
  question: z.string().nonempty('Question is required'),
  answer: z.string().nonempty('Answer is required'),
})

type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => {
  return {
    ...existingEntry.value,
  }
})

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: toTypedSchema(zodSchema),
  initialValues,
})

// Edit Method
const edit = handleSubmit(async (values: FormInput) => {
  try {
    const response = (await updateAdminFaq(
      Number(id),
      values.question,
      values.answer,
    )) as any
    toast.response(response)
    if (response.status === 'success') {
      await faqEntriestore.fetchFaqs()
      router.push('/admin/extensions/faq/entries')
    }
  } catch (error) {
    toast.danger(error as any)
  }
})
</script>

<template>
  <TairoContentWrapper>
    <template #left>
      <BaseHeading size="lg">{{ $t('Edit Faq Entry') }}</BaseHeading>
    </template>
    <template #right>
      <BaseButton
        type="button"
        color="muted"
        class="hover:bg-gray-300 dark:hover:bg-gray-800"
        to="/admin/extensions/faq/entries"
      >
        <Icon name="line-md:chevron-left" class="h-4 w-4 mr-2" />
        {{ $t('Back') }}
      </BaseButton>
      <BaseButton
        type="submit"
        color="primary"
        :disabled="isSubmitting"
        class="w-full"
        @click="edit"
      >
        {{ $t('Edit Entry') }}
      </BaseButton>
    </template>
    <form @submit="edit" class="space-y-8">
      <BaseCard class="p-5 space-y-5">
        <Field
          name="question"
          v-slot="{ field, errorMessage, handleChange, handleBlur }"
        >
          <BaseTextarea
            v-model="field.value"
            :error="errorMessage"
            label="Question"
            shape="rounded"
            placeholder="Write a question"
            class="w-full"
            @update:model-value="handleChange"
            @blur="handleBlur"
          />
        </Field>

        <Field
          name="answer"
          v-slot="{ field, errorMessage, handleChange, handleBlur }"
        >
          <BaseTextarea
            v-model="field.value"
            :error="errorMessage"
            label="Answer"
            shape="rounded"
            placeholder="Write an answer"
            class="w-full"
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
          {{ $t('Edit Entry') }}
        </BaseButton>
      </TairoFormSave>
    </form>
  </TairoContentWrapper>
</template>
