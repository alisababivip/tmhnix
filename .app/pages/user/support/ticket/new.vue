<script setup lang="ts">
import { useUserSupportStore } from '~~/store/support/user'
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

const supportStore = useUserSupportStore()
const userStore = useUserStore()
const user = computed(() => userStore.getProfile)

definePageMeta({
  title: 'Create Ticket',
})

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z.object({
  subject: z.string().nonempty({ message: 'Subject is required' }),
  importance: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  message: z.string().nonempty({ message: 'Message is required' }),
})

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>
const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  subject: '',
  importance: 'LOW',
  message: '',
}))

// This is the list of options for the select inputs
const importance = ['LOW', 'MEDIUM', 'HIGH']

const { handleSubmit, isSubmitting, meta, errors, resetForm, setErrors } =
  useForm({
    validationSchema,
    initialValues,
  })

const fieldsWithErrors = computed(() => Object.keys(errors.value).length)

const { toast } = useUtils()
const { createTicket } = useSupport()
const router = useRouter()

// This is where you would send the form data to the server
const onSubmit = handleSubmit(async (values: any) => {
  try {
    const response = await createTicket(values)
    toast.response(response)
    if (response.status === 'success') {
      await supportStore.fetchTickets()
      router.push(`/user/support/ticket/${response.data.result.uuid}`)
    }
  } catch (error) {
    console.log(error)

    toast.error(error)
  }
})
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseHeading
          as="h3"
          size="xl"
          weight="medium"
          class="text-muted-800 dark:text-white"
        >
          {{ $t('Create New Support Ticket') }}
        </BaseHeading>
      </template>
      <template #right>
        <BaseButton
          type="button"
          color="muted"
          class="hover:bg-gray-300 dark:hover:bg-gray-800"
          to="/user/support"
        >
          <Icon name="line-md:chevron-left" class="h-4 w-4 mr-2" />
          {{ $t('Back') }}
        </BaseButton>
      </template>
      <BaseCard>
        <div class="p-5">
          <div class="flex flex-col gap-5">
            <div
              class="flex xs:flex-col sm:flex-row justify-between items-center gap-5"
            >
              <div class="w-full">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="subject"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="ph:user-duotone"
                    class="w-full"
                    placeholder="Subject"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="w-full">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="importance"
                >
                  <BaseListbox
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    :items="importance"
                    placeholder="Importance"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
            </div>
            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="message"
            >
              <BaseTextarea
                :model-value="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                placeholder="Message"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>
          </div>
        </div>
        <div
          class="flex justify-end border-t border-gray-200 dark:border-gray-700 p-5"
        >
          <BaseButton
            type="button"
            variant="secondary"
            class="mr-2"
            @click="resetForm"
          >
            {{ $t('Reset') }}
          </BaseButton>
          <BaseButton
            type="submit"
            color="primary"
            :disabled="isSubmitting || fieldsWithErrors"
            :loading="isSubmitting"
            @click="onSubmit"
          >
            {{ $t('Submit') }}
          </BaseButton>
        </div>
      </BaseCard>
    </TairoContentWrapper>
  </div>
</template>
