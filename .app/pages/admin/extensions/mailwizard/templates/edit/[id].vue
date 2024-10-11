<script setup lang="ts">
import { EmailEditor } from 'vue-email-editor'
import { useForm, Field } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
definePageMeta({
  title: 'Edit Mailwizard Template',
})

const { toast } = useUtils()
const darkModeStore = useDarkModeStore()
const isDarkMode = computed(() => darkModeStore.isDarkMode)
const { updateTemplate, getTemplate } = useMailwizard()
const route = useRoute()
const template = ref(null)

const loaded = ref(false)
const emailEditor = ref(null)
const editorLoaded = () => {
  loaded.value = true
}

const zodSchema = z.object({
  name: z.string().nonempty('Name is required'),
})

type FormInput = z.infer<typeof zodSchema>

const { handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema: toTypedSchema(zodSchema),
  initialValues: {
    name: '', // Default initial values
  },
})

onMounted(async () => {
  const response = await getTemplate(route.params.id as string)
  if (response.status === 'success') {
    template.value = response.data.result
    resetForm({
      values: {
        name: template.value?.name ?? '',
      },
    })
    if (template.value?.design && emailEditor.value?.editor) {
      const design = JSON.parse(template.value.design)
      emailEditor.value?.editor.loadDesign(design)
    }
  }
})

watch(
  [loaded, template],
  () => {
    if (loaded.value && template.value?.design) {
      const design = JSON.parse(template.value.design)
      emailEditor.value?.editor.loadDesign(design)
    }
  },
  { immediate: true },
)

// Update Method
const isUpdating = ref(false)
const isUpdateOpen = ref(false)
const router = useRouter()
const update = handleSubmit(async (values: FormInput) => {
  emailEditor.value?.editor.exportHtml(async (data) => {
    try {
      const response = await updateTemplate(
        template.value?.id,
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
        <BaseHeading size="lg"
          >Editing Template: {{ template?.name }}</BaseHeading
        >
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
          @click="() => (isUpdateOpen = true)"
        >
          Update
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
      :open="isUpdateOpen"
      size="sm"
      @close="() => (isUpdateOpen = false)"
    >
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Edit Template') }}
          </h3>
          <BaseButtonClose @click="() => (isUpdateOpen = false)" />
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
            <BaseButton @click="() => (isUpdateOpen = false)">
              {{ $t('Cancel') }}
            </BaseButton>
            <BaseButton
              color="success"
              flavor="solid"
              @click="update"
              :disabled="isUpdating"
              :loading="isUpdating"
            >
              {{ $t('Update') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
