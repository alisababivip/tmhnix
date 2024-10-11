<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import type { User } from '~~/types'
const { updateProfile } = useAuth()

const userStore = useUserStore()
const user = userStore.getProfile as User
const uuid = user.uuid

const VALIDATION_TEXT = {
  OLD_PASSWORD_REQUIRED: 'Your current password is required',
  NEW_PASSWORD_LENGTH: 'Password must be at least 8 characters',
  NEW_PASSWORD_MATCH: 'Passwords do not match',
}

definePageMeta({
  title: 'Security Settings',
})

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z
  .object({
    current_password: z.string().optional(),
    new_password: z.string().optional(),
    confirm_password: z.string().optional(),
    notifications: z.object({
      enabled: z.boolean(),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.current_password) {
      if (!data.new_password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'New password is required when changing password.',
          path: ['new_password'],
        })
      } else if (data.new_password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: VALIDATION_TEXT.NEW_PASSWORD_LENGTH,
          path: ['new_password'],
        })
      } else if (data.new_password !== data.confirm_password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: VALIDATION_TEXT.NEW_PASSWORD_MATCH,
          path: ['confirm_password'],
        })
      }
    }
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  current_password: '',
  new_password: '',
  confirm_password: '',
  notifications: {
    enabled: user.notifications?.enabled || false,
  },
}))

const {
  handleSubmit,
  isSubmitting,
  meta,
  errors,
  resetForm,
  setFieldValue,
  setErrors,
} = useForm({
  validationSchema,
  initialValues,
})

const success = ref(false)
const fieldsWithErrors = computed(() => Object.keys(errors.value).length)

// Reset notifications when the user disables them
// watch(
//   () => values.notifications?.enabled,
//   (value) => {
//     if (!value) {
//       setFieldValue("notifications.flushLowPriority", false);
//       setFieldValue("notifications.marketing", false);
//       setFieldValue("notifications.partners", false);
//     }
//   }
// );

// Ask the user for confirmation before leaving the page if the form has unsaved changes
onBeforeRouteLeave(() => {
  if (meta.value.dirty) {
    return confirm('You have unsaved changes. Are you sure you want to leave?')
  }
})

const { toast } = useUtils()

// This is where you would send the form data to the server
const onSubmit = handleSubmit(
  async (values) => {
    success.value = false

    if (!values.current_password) {
      toast.dangerText('Current password is required')
      return
    }
    if (!values.new_password) {
      toast.dangerText('New password is required')
      return
    }
    if (!values.confirm_password) {
      toast.dangerText('Confirm password is required')
      return
    }
    if (values.new_password !== values.confirm_password) {
      toast.dangerText('Passwords do not match')
      return
    }

    try {
      // Call the function that updates the user profile
      const response = await updateProfile(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        values.current_password,
        values.new_password,
      )

      toast.response(response)
      // Check if the update was successful
      if (response.status === 'success') {
        // Reset form to initial values
        setFieldValue('current_password', '')
        setFieldValue('new_password', '')
        setFieldValue('confirm_password', '')

        success.value = true
        setTimeout(() => {
          success.value = false
        }, 3000)
      }
    } catch (error) {
      toast.danger(error as any)
    }
  },
  (error) => {
    success.value = false

    // You can use it to scroll to the first error
    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  },
)
</script>

<template>
  <form method="POST" action="" class="w-full pb-16" @submit.prevent="onSubmit">
    <BaseCard>
      <div class="flex items-center justify-between p-4">
        <div>
          <BaseHeading
            tag="h2"
            size="sm"
            weight="medium"
            lead="normal"
            class="uppercase tracking-wider"
          >
            {{ $t('Security') }}
          </BaseHeading>
          <BaseText size="xs" class="text-muted-400">
            {{ $t('Edit your account prefs and settings') }}
          </BaseText>
        </div>
        <div class="flex items-center gap-2">
          <BaseButton class="w-24" to="/user/profile-edit">{{
            $t('Cancel')
          }}</BaseButton>
          <BaseButton
            type="submit"
            color="primary"
            class="w-24"
            :disabled="isSubmitting"
            :loading="isSubmitting"
            >{{ $t('Save') }}</BaseButton
          >
        </div>
      </div>
      <div class="p-4">
        <div class="mx-auto max-w-lg space-y-12 py-8">
          <BaseMessage v-if="success" @close="success = false">
            {{ $t('Your settings has been saved') }}!
          </BaseMessage>
          <BaseMessage
            v-if="fieldsWithErrors"
            type="danger"
            @close="() => setErrors({})"
          >
            {{ $t('This form has') }} {{ fieldsWithErrors }}
            {{ $t('errors, please check them before submitting') }}
          </BaseMessage>

          <TairoFormGroup
            label="Change Password"
            sublabel="For an improved account security"
          >
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="current_password"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="password"
                    icon="ph:lock-duotone"
                    placeholder="Old password"
                    autocomplete="current-password"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="new_password"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="password"
                    icon="ph:lock-duotone"
                    placeholder="New password"
                    autocomplete="new-password"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                  <TairoPasswordStrength
                    v-if="field.value != ''"
                    class="mt-1"
                    :value="field.value"
                    :min-length="8"
                  />
                </Field>
              </div>
              <div class="col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="confirm_password"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="password"
                    icon="ph:lock-duotone"
                    placeholder="Repeat new password"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
            </div>
          </TairoFormGroup>
          <!-- <TairoFormGroup
            label="Notifications"
            sublabel="Configure how you receive notifications"
          >
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12">
                <Field
                  v-slot="{ field, handleChange, handleBlur }"
                  name="notifications.enabled"
                >
                  <BaseSwitchBall
                    :model-value="field.value"
                    :disabled="isSubmitting"
                    label="Enabled"
                    sublabel="Receive emails notifications from the app"
                    color="primary"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div v-show="values.notifications?.enabled" class="col-span-12">
                <Field
                  v-slot="{ field, handleChange, handleBlur }"
                  name="notifications.flushLowPriority"
                >
                  <BaseSwitchBall
                    :model-value="field.value"
                    :disabled="isSubmitting"
                    label="Flush"
                    sublabel="Discard low priority notifications"
                    color="primary"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div v-show="values.notifications?.enabled" class="col-span-12">
                <Field
                  v-slot="{ field, handleChange, handleBlur }"
                  name="notifications.marketing"
                >
                  <BaseSwitchBall
                    :model-value="field.value"
                    :disabled="isSubmitting"
                    label="Marketing"
                    sublabel="Enable marketing emails"
                    color="primary"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div v-show="values.notifications?.enabled" class="col-span-12">
                <Field
                  v-slot="{ field, handleChange, handleBlur }"
                  name="notifications.partners"
                >
                  <BaseSwitchBall
                    :model-value="field.value"
                    :disabled="isSubmitting"
                    label="Partners"
                    sublabel="Enable partner emails"
                    color="primary"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
            </div>
          </TairoFormGroup> -->
        </div>
      </div>
    </BaseCard>
    <TairoFormSave
      :disabled="isSubmitting"
      :loading="isSubmitting"
      @reset="resetForm"
    />
  </form>
</template>
