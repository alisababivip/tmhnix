<script setup lang="ts">
import type { NotificationTemplate } from '~~/types'
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  permissions: ['Edit Notification Template'],
  title: 'Notification Template',
})

const route = useRoute()
const { id } = route.params as number
const loading = ref(false)
const { toast } = useUtils()

const { getNotificationTemplate, updateNotificationTemplate } =
  useNotification()
const template = ref<NotificationTemplate>([])

onMounted(async () => {
  loading.value = true
  try {
    const response = await getNotificationTemplate(id)
    if (typeof response.data.result.short_codes === 'string') {
      response.data.result.short_codes = JSON.parse(
        response.data.result.short_codes,
      )
    }
    template.value = response.data.result
  } catch (error) {
    console.log(error)
  }
  loading.value = false
  console.log(template.value)
})

const zodSchema = z.object({
  subject: z.string().nonempty('Subject is required'),
  email_body: z.string().nullable().optional(),
  sms_body: z.string().nullable().optional(),
  push_body: z.string().nullable().optional(),
  email: z.boolean().nullable().optional(),
  sms: z.boolean().nullable().optional(),
  push: z.boolean().nullable().optional(),
})

type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  subject: template.value.subject ?? '',
  email_body: template.value.email_body ?? '',
  sms_body: template.value.sms_body ?? '',
  push_body: template.value.push_body ?? '',
  email: template.value.email ?? false,
  sms: template.value.sms ?? false,
  push: template.value.push ?? false,
}))

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: toTypedSchema(zodSchema),
  initialValues,
})

const edit = handleSubmit(async (values: any) => {
  try {
    const response = await updateNotificationTemplate(id, values)
    toast.response(response)
  } catch (err) {
    toast.danger(err as any)
  }
})

const shortcodesMap = (item: string) => {
  switch (item) {
    case 'FIRSTNAME':
      return 'User first name'
    case 'LASTNAME':
      return 'User last name'
    case 'EMAIL':
      return 'User email'
    case 'PHONE':
      return 'User phone'
    case 'COMPANY':
      return 'User company'
    case 'ADDRESS':
      return 'User address'
    case 'CITY':
      return 'User city'
    case 'STATE':
      return 'User state'
    case 'ZIP':
      return 'User zip'
    case 'COUNTRY':
      return 'User country'
    case 'PASSWORD':
      return 'User password'
    case 'USERNAME':
      return 'User username'
    case 'URL':
      return 'Site url'
    case 'CREATED_AT':
      return 'Template related Created at'
    case 'UPDATED_AT':
      return 'Updated at date'
    case 'SITE_NAME':
      return 'Site name'
    case 'SITE_URL':
      return 'Site url'
    case 'SITE_EMAIL':
      return 'Site email'
    case 'SITE_PHONE':
      return 'Site phone'
    case 'SITE_ADDRESS':
      return 'Site address'
    case 'TOKEN':
      return 'Template related token'
    case 'LAST_LOGIN':
      return 'User last login'
  }
}
</script>

<template>
  <div class="pb-10">
    <TairoContentWrapper>
      <template #left>
        <BaseHeading>
          {{ $t('Editing') }}
          {{ template?.name }} {{ $t('Template') }}
        </BaseHeading>
      </template>
      <template #right>
        <BaseButton color="success" @click="edit">
          <Icon name="line-md:confirm" class="w-5 h-5 mr-2" />
          {{ $t('Save') }}
        </BaseButton>
        <BaseButton color="muted" to="/admin/settings/notifications/templates">
          <Icon name="line-md:arrow-small-left" class="w-5 h-5 mr-2" />
          {{ $t('Back') }}
        </BaseButton>
      </template>
      <div class="grid gap-5 xs:grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
        <div class="xs:col-span-1 md:col-span-2 lg:col-span-3 space-y-5">
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="subject"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="text"
              label="Subject"
              placeholder="Enter subject"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="email_body"
          >
            <BaseTextarea
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              label="Email Body"
              rows="10"
              placeholder="Enter email body"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="sms_body"
          >
            <BaseTextarea
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              label="SMS Body"
              placeholder="Enter sms body"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="push_body"
          >
            <BaseTextarea
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              label="Push Body"
              placeholder="Enter push body"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>
        <div class="col-span-1">
          <BaseCard class="p-5">
            <BaseHeading size="md" class="mb-5">{{
              $t('Variables')
            }}</BaseHeading>
            <div class="space-y-3 text-xs">
              <div
                class="flex flex-col"
                v-for="(item, index) in template?.short_codes"
                :key="index"
              >
                <span class="text-gray-600 dark:text-gray-400"
                  >%<span
                    class="font-semibold text-gray-800 dark:text-gray-200"
                    >{{ item }}</span
                  >%</span
                >
                <span class="text-gray-500">{{ shortcodesMap(item) }}</span>
              </div>
            </div>
          </BaseCard>
          <BaseCard class="p-5 mt-5">
            <div class="space-y-3 text-xs">
              <Field v-slot="{ field, handleChange, handleBlur }" name="email">
                <BaseSwitchBall
                  :model-value="field.value"
                  :disabled="isSubmitting"
                  label="Email"
                  sublabel="Send emails notifications"
                  color="primary"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                />
              </Field>
              <Field v-slot="{ field, handleChange, handleBlur }" name="sms">
                <BaseSwitchBall
                  :model-value="field.value"
                  disabled
                  label="SMS (coming soon)"
                  sublabel="Send sms notifications"
                  color="primary"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                />
              </Field>
              <Field v-slot="{ field, handleChange, handleBlur }" name="push">
                <BaseSwitchBall
                  :model-value="field.value"
                  disabled
                  label="Push (coming soon)"
                  sublabel="Send push notifications"
                  color="primary"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                />
              </Field>
            </div>
          </BaseCard>
        </div>
      </div>
    </TairoContentWrapper>
  </div>
</template>
