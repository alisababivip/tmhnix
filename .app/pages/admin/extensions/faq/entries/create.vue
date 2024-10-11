<script setup lang="ts">
import { useForm, Field } from 'vee-validate'
import { z } from 'zod'
import { useFaqCategoriesStore } from '~~/store/extensions/faq/user/categories'
import { useAdminFaqEntriesStore } from '~~/store/extensions/faq/admin/entries'
import { toTypedSchema } from '@vee-validate/zod'

definePageMeta({
  title: 'Create FAQ Entry',
  permissions: ['Create FAQ'],
})
const { toast } = useUtils()
const router = useRouter()

const faqCategoriestore = useFaqCategoriesStore()
const faqEntriestore = useAdminFaqEntriesStore()
const { createAdminFaq } = useFaq()
const categories = computed(() => faqCategoriestore.categories)

onMounted(async () => {
  if (faqCategoriestore.categories.length === 0) {
    await faqCategoriestore.fetchCategories()
  }
})

// Validation
const zodSchema = z.object({
  question: z.string().nonempty('Question is required'),
  answer: z.string().nonempty('Answer is required'),
  category: z.object({
    label: z.string().nonempty('Category is required'),
    value: z.number().nullable(),
  }),
})

type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  question: '',
  answer: '',
  category: {
    label: 'Please select a category',
    value: null,
  },
}))

const { handleSubmit, isSubmitting, resetForm, values, setFieldValue } =
  useForm({
    validationSchema: toTypedSchema(zodSchema),
    initialValues,
  })

// Create Method
const create = handleSubmit(async (values: FormInput) => {
  if (!values.category.value) {
    toast.dangerText('Please select a category')
    return
  }
  try {
    const response = (await createAdminFaq(
      values.question,
      values.answer,
      values.category.value,
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
      <BaseHeading size="lg">{{ $t('Create Faq Entry') }}</BaseHeading>
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
        @click="create"
      >
        {{ $t('Create Entry') }}
      </BaseButton>
    </template>
    <form @submit="create" class="space-y-8">
      <BaseCard class="p-5 space-y-5">
        <div class="grid gap-5 grid-cols-1 sm:grid-cols-2">
          <Field
            name="category"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseListbox
              :model-value="field.value"
              :error="errorMessage"
              :items="
                categories.map((category) => ({
                  label: category.identifier,
                  value: category.id,
                }))
              "
              :properties="{
                label: 'label',
                value: 'value',
              }"
              label="Category"
              placeholder="Select a category"
              shape="rounded"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>
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
          {{ $t('Create Entry') }}
        </BaseButton>
      </TairoFormSave>
    </form>
  </TairoContentWrapper>
</template>
