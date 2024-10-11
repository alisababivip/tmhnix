<script setup lang="ts">
import { EmailEditor } from 'vue-email-editor'
import { useForm, Field } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
definePageMeta({
  title: 'Create Mailwizard Template',
})

const { toast } = useUtils()
const darkModeStore = useDarkModeStore()
const isDarkMode = computed(() => darkModeStore.isDarkMode)
const { createTemplate } = useMailwizard()

const loaded = ref(false)
const emailEditor = ref(null)
const editorLoaded = () => {
  loaded.value = true
}

const zodSchema = z.object({
  name: z.string().nonempty('Name is required'),
})

type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  name: '',
}))

const { handleSubmit, isSubmitting, values, resetForm } = useForm({
  validationSchema: toTypedSchema(zodSchema),
  initialValues,
})

// Create Method
const isCreating = ref(false)
const isCreateOpen = ref(false)
const router = useRouter()
const create = handleSubmit(async (values: FormInput) => {
  emailEditor.value?.editor.exportHtml(async (data) => {
    try {
      const response = await createTemplate(
        values.name,
        data.html,
        JSON.stringify(data.design),
      )
      toast.response(response)
      if (response.status === 'success') {
        router.push('/admin/extensions/mailwizard/templates')
      }
    } catch (error) {
      toast.danger(error as any)
    }
  })
})
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseHeading size="lg">Create Template</BaseHeading>
      </template>
      <template #right>
        <BaseButton
          type="button"
          color="muted"
          class="hover:bg-gray-300 dark:hover:bg-gray-800"
          :to="'/admin/extensions/mailwizard/templates'"
        >
          <Icon name="line-md:chevron-left" class="h-4 w-4 mr-2" />
          Back
        </BaseButton>
        <BaseButton
          type="submit"
          color="primary"
          :disabled="isSubmitting || !loaded || !emailEditor"
          :loading="isSubmitting || !loaded || !emailEditor"
          class="w-full"
          @click="() => (isCreateOpen = true)"
        >
          Create
        </BaseButton>
      </template>
      <EmailEditor
        v-on:load="editorLoaded"
        ref="emailEditor"
        style="height: calc(80vh)"
        :appearance="{
          theme: isDarkMode ? 'dark' : 'light',
          panels: {
            tools: {
              dock: 'left',
            },
          },
        }"
      />
    </TairoContentWrapper>

    <TairoModal
      :open="isCreateOpen"
      size="sm"
      @close="() => (isCreateOpen = false)"
    >
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Create Template') }}
          </h3>
          <BaseButtonClose @click="() => (isCreateOpen = false)" />
        </div>
      </template>

      <div class="px-4 md:px-6">
        <Field
          name="name"
          v-slot="{ field, errorMessage, handleChange, handleBlur }"
        >
          <BaseInput
            v-model="field.value"
            :error="errorMessage"
            label="Name"
            placeholder="Enter Template Name"
            shape="rounded"
            class="w-full"
            @update:model-value="handleChange"
            @blur="handleBlur"
          />
        </Field>
      </div>

      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="() => (isCreateOpen = false)">
              {{ $t('Cancel') }}
            </BaseButton>
            <BaseButton
              color="success"
              flavor="solid"
              @click="create"
              :disabled="isCreating"
              :loading="isCreating"
            >
              {{ $t('Create') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
