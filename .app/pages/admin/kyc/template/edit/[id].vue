<script setup lang="ts">
import { useForm, Field } from 'vee-validate'
import { z } from 'zod'
import { useKycTemplateStore } from '~~/store/kyc/template'
import { toTypedSchema } from '@vee-validate/zod'

definePageMeta({
  title: 'Edit KYC Template',
  permissions: ['Edit KYC Template'],
})

// Assuming you have the ID of the template you want to edit
const id = useRoute().params.id

const kycTemplateStore = useKycTemplateStore()
const { updateKycTemplate } = useKyc()
const existingTemplate = computed(
  () =>
    kycTemplateStore.selectedTemplate || kycTemplateStore.getTemplateById(id),
)

onMounted(async () => {
  const templateId = Number(id)
  if (kycTemplateStore.templates.length === 0) {
    await kycTemplateStore.fetchKycTemplates()
  }
  kycTemplateStore.selectTemplateById(templateId)

  if (!kycTemplateStore.selectedTemplate) {
    router.push('/admin/kyc/templates')
  }
})

const { toast } = useUtils()
const router = useRouter()

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const makeOptionSchema = () =>
  z.object({
    enabled: z.boolean().nullable().optional().default(false),
    required: z.boolean().nullable().optional().default(false),
    level: z.enum(['1', '2', '3']),
  })

// Validation
const zodSchema = z.object({
  title: z.string().nonempty(),
  options: z.object({
    first_name: makeOptionSchema(),
    last_name: makeOptionSchema(),
    email: makeOptionSchema(),
    phone: makeOptionSchema(),
    address: makeOptionSchema(),
    city: makeOptionSchema(),
    state: makeOptionSchema(),
    country: makeOptionSchema(),
    zip: makeOptionSchema(),
    dob: makeOptionSchema(),
    ssn: makeOptionSchema(),
    document_passport: makeOptionSchema(),
    document_drivers_license: makeOptionSchema(),
    document_id_card: makeOptionSchema(),
    custom_fields: z.array(
      z
        .object({
          title: z.string().nonempty(),
          required: z.boolean().nullable().optional().default(false),
          type: z.enum(['input', 'textarea', 'file upload']),
          level: z.enum(['1', '2', '3']),
        })
        .nullable()
        .optional(),
    ),
  }),
})

type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  title: existingTemplate.value?.title || '',
  options: existingTemplate.value?.options || {},
}))

const { handleSubmit, isSubmitting, setFieldValue, errors, setFieldError } =
  useForm({
    validationSchema: toTypedSchema(zodSchema),
    initialValues,
  })

// Manage custom fields
const customFields = computed(() => {
  return kycTemplateStore.selectedTemplate?.options?.custom_fields || []
})

// Method to add a new custom field
const addCustomField = () => {
  const updatedCustomFields = [
    ...customFields.value,
    {
      title: '',
      required: false,
      type: 'input',
      level: '1',
    },
  ]
  kycTemplateStore.selectedTemplate?.options &&
    kycTemplateStore.selectedTemplate.options.custom_fields &&
    kycTemplateStore.selectedTemplate.options.custom_fields.push({
      title: '',
      required: false,
      type: 'input',
      level: '1',
    })
  setFieldValue('options.custom_fields', updatedCustomFields)
}

// Method to remove a custom field
const removeCustomField = (index: number) => {
  // Safely access custom fields
  const currentCustomFields =
    kycTemplateStore.selectedTemplate.options?.custom_fields || []
  const updatedCustomFields = currentCustomFields.slice()
  updatedCustomFields.splice(index, 1)

  // Ensure options is not null before attempting to set custom_fields
  if (kycTemplateStore.selectedTemplate.options) {
    kycTemplateStore.selectedTemplate.options.custom_fields =
      updatedCustomFields
  }

  // Update the field value using vee-validate's setFieldValue function
  setFieldValue('options.custom_fields', updatedCustomFields)
}

// Create Template
const update = handleSubmit(async (values: FormInput) => {
  if (
    kycTemplateStore.templates.find(
      (template) => template.title === values.title,
    ) &&
    kycTemplateStore.selectedTemplate?.title !== values.title
  ) {
    setFieldError('title', 'Template with this title already exists')
    scrollToTop()
    return
  }
  try {
    const response = await updateKycTemplate(id, values)
    toast.response(response)
    if (response.status === 'success') {
      await kycTemplateStore.fetchKycTemplates()
      router.push('/admin/kyc/templates')
    }
  } catch (error) {
    toast.danger(error as any)
  }
})

const keyTitleMap = {
  first_name: 'First Name',
  last_name: 'Last Name',
  email: 'Email',
  phone: 'Phone',
  address: 'Address',
  city: 'City',
  state: 'State',
  country: 'Country',
  zip: 'Zip',
  dob: 'Date of Birth',
  ssn: 'SSN',
  document_passport: 'Passport',
  document_drivers_license: 'Driver License',
  document_id_card: 'ID Card',
  custom_fields: 'Custom Fields',
}

const documents = [
  'document_passport',
  'document_drivers_license',
  'document_id_card',
]
const schemaKeys = Object.keys(zodSchema.shape.options.shape)
const generalFields = schemaKeys.filter(
  (key) => !documents.includes(key) && key !== 'custom_fields',
)
</script>

<template>
  <TairoContentWrapper>
    <template #left>
      <BaseHeading size="lg"
        >{{ $t('Edit') }} {{ kycTemplateStore.selectedTemplate?.title }}
        {{ $t('Template') }}</BaseHeading
      >
    </template>
    <template #right>
      <BaseButton type="button" color="muted" to="/admin/kyc/templates">
        <Icon name="line-md:chevron-left" class="h-4 w-4 mr-2" />
        {{ $t('Back') }}
      </BaseButton>
    </template>
    <form action="" method="POST" @submit.prevent="update" class="space-y-10">
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
            placeholder="Enter template title"
            shape="rounded"
            class="w-full"
            @update:model-value="handleChange"
            @blur="handleBlur"
          />
        </Field>
      </BaseCard>
      <BaseCard>
        <template v-for="(field, key) in generalFields" :key="key">
          <div
            class="p-5 flex xs:flex-col sm:flex-row justify-between items-start gap-5"
            :class="{
              ' border-b border-muted-300 dark:border-muted-700':
                field !== 'ssn',
            }"
          >
            <span>{{ keyTitleMap[field] }}</span>
            <div
              class="flex xs:flex-col sm:flex-row justify-start xs:items-start sm:items-center gap-5"
            >
              <!-- Field enabled switch -->
              <Field
                :name="`options.${field}.enabled`"
                v-slot="{ field, errorMessage, handleChange, handleBlur }"
              >
                <BaseSwitchBall
                  v-model="field.value"
                  :error="errorMessage"
                  :disabled="isSubmitting"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                  label="Enabled"
                  color="success"
                />
              </Field>
              <!-- Field required switch -->
              <Field
                :name="`options.${field}.required`"
                v-slot="{ field, errorMessage, handleChange, handleBlur }"
              >
                <BaseSwitchBall
                  v-model="field.value"
                  :error="errorMessage"
                  :disabled="isSubmitting"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                  label="Required"
                  color="primary"
                />
              </Field>

              <Field
                :name="`options.${field}.level`"
                v-slot="{ field, errorMessage, handleChange, handleBlur }"
              >
                <BaseListbox
                  v-model="field.value"
                  :error="errorMessage"
                  :disabled="isSubmitting"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                  :items="['1', '2', '3']"
                  placeholder="Select a level"
                  shape="rounded"
                  condensed
                  class="min-w-[96px]"
                />
              </Field>
            </div>
          </div>
        </template>
      </BaseCard>

      <BaseCard>
        <template v-for="(field, key) in documents" :key="key">
          <div
            class="p-5 flex xs:flex-col sm:flex-row justify-between items-start gap-5"
            :class="{
              ' border-b border-muted-300 dark:border-muted-700':
                field !== 'document_id_card',
            }"
          >
            <span>{{ keyTitleMap[field] }}</span>
            <div
              class="flex xs:flex-col sm:flex-row justify-start xs:items-start sm:items-center gap-5"
            >
              <!-- Field enabled switch -->
              <Field
                :name="`options.${field}.enabled`"
                v-slot="{ field, errorMessage, handleChange, handleBlur }"
              >
                <BaseSwitchBall
                  v-model="field.value"
                  :error="errorMessage"
                  :disabled="isSubmitting"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                  label="Enabled"
                  color="success"
                />
              </Field>
              <!-- Field required switch -->
              <Field
                :name="`options.${field}.required`"
                v-slot="{ field, errorMessage, handleChange, handleBlur }"
              >
                <BaseSwitchBall
                  v-model="field.value"
                  :error="errorMessage"
                  :disabled="isSubmitting"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                  label="Required"
                  color="primary"
                />
              </Field>

              <Field
                :name="`options.${field}.level`"
                v-slot="{ field, errorMessage, handleChange, handleBlur }"
              >
                <BaseListbox
                  v-model="field.value"
                  :error="errorMessage"
                  :disabled="isSubmitting"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                  :items="['1', '2', '3']"
                  placeholder="Select a level"
                  shape="rounded"
                  condensed
                  class="min-w-[96px]"
                />
              </Field>
            </div>
          </div>
        </template>
      </BaseCard>

      <!-- Custom Fields Section -->
      <BaseCard class="p-5 space-y-5">
        <div class="flex justify-between items-center">
          <h3 class="text-xl font-semibold">{{ $t('Custom Fields') }}</h3>

          <!-- Add New Custom Field Button -->
          <BaseButtonIcon
            type="button"
            color="primary"
            @click="addCustomField"
            condensed
          >
            <Icon name="line-md:plus" class="h-5 w-5" />
          </BaseButtonIcon>
        </div>
        <div
          v-for="(field, index) in customFields"
          :key="index"
          class="space-y-4"
        >
          <!-- Title, Required, Type -->
          <div class="grid grid-cols-1 sm:grid-cols-12 gap-5">
            <div class="col-span-1 sm:col-span-4">
              <Field
                :name="`options.custom_fields[${index}].title`"
                v-slot="{ field, errorMessage, handleChange, handleBlur }"
              >
                <BaseInput
                  v-model="field.value"
                  :error="errorMessage"
                  :disabled="isSubmitting"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                  type="text"
                  label="Field Title"
                  placeholder="Ex: username"
                  shape="rounded"
                  class="w-full"
                />
              </Field>
            </div>
            <div class="col-span-1 sm:col-span-3">
              <Field
                :name="`options.custom_fields[${index}].type`"
                v-slot="{ field, errorMessage, handleChange, handleBlur }"
              >
                <BaseListbox
                  v-model="field.value"
                  :error="errorMessage"
                  :disabled="isSubmitting"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                  label="Field Type"
                  :items="['input', 'textarea', 'file upload']"
                  placeholder="Select a type"
                  shape="rounded"
                />
              </Field>
            </div>
            <div class="col-span-1 sm:col-span-5">
              <div
                class="flex xs:flex-col sm:flex-row justify-start xs:items-start sm:items-center gap-5"
              >
                <Field
                  :name="`options.custom_fields[${index}].level`"
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                >
                  <BaseListbox
                    v-model="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                    :items="['1', '2', '3']"
                    label="Field Level"
                    placeholder="Select a level"
                    shape="rounded"
                    class="min-w-[96px]"
                  />
                </Field>
                <span class="sm:pt-6">
                  <Field
                    :name="`options.custom_fields[${index}].required`"
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  >
                    <BaseSwitchBall
                      v-model="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                      label="Required"
                      color="primary"
                    /> </Field
                ></span>
                <span class="sm:pt-6">
                  <TairoButtonIcon
                    type="button"
                    color="danger"
                    @click="removeCustomField(index)"
                  >
                    <Icon
                      name="line-md:close"
                      class="h-4 w-4"
                    /> </TairoButtonIcon
                ></span>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
      <div class="flex items-center justify-center">
        <BaseCard class="p-2 w-64">
          <BaseButton
            :disabled="isSubmitting"
            :loading="isSubmitting"
            :block="true"
            color="primary"
            type="submit"
            class="w-full"
          >
            Save
          </BaseButton>
        </BaseCard>
      </div>
    </form>
  </TairoContentWrapper>
</template>
