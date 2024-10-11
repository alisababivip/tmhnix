<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useFieldError, useForm } from 'vee-validate'
import { z } from 'zod'

import type { User } from '~~/types'
const { updateProfile } = useAuth()

const userStore = useUserStore()
const user = computed<User | null>(() => userStore.getProfile)

definePageMeta({
  title: 'Edit Profile',
})

const VALIDATION_TEXT = {
  FIRST_REQUIRED: "Your first name can't be empty",
  last_name_REQUIRED: "Your last name can't be empty",
  OPTION_REQUIRED: 'Please select an option',
  AVATAR_TOO_BIG: `Avatar size must be less than 1MB`,
  AVATAR_WRONG_TYPE: `Avatar must be an image`,
}

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z.object({
  avatar: z
    .union([z.string(), z.custom<File>((v) => v instanceof File)])
    .nullable(),
  first_name: z.string().min(1, VALIDATION_TEXT.FIRST_REQUIRED),
  last_name: z.string().min(1, VALIDATION_TEXT.last_name_REQUIRED),
  email: z.string().email(),
  metadata: z.object({
    location: z.object({
      address: z.string(),
      city: z.string(),
      country: z.string(),
      zip: z.string(),
    }),
    role: z.string().optional(),
    bio: z.string(),
    info: z.object({
      experience: z
        .union([
          z.literal('0-2 years'),
          z.literal('2-5 years'),
          z.literal('5-10 years'),
          z.literal('10+ years'),
        ])
        .nullable(),
      firstJob: z
        .object({
          label: z.string(),
          value: z.boolean(),
        })
        .nullable(),
      flexible: z
        .object({
          label: z.string(),
          value: z.boolean(),
        })
        .nullable(),
      remote: z
        .object({
          label: z.string(),
          value: z.boolean(),
        })
        .nullable(),
    }),
    social: z.object({
      facebook: z.string(),
      twitter: z.string(),
      dribbble: z.string(),
      instagram: z.string(),
      github: z.string(),
      gitlab: z.string(),
    }),
  }),
})

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>
const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  avatar: user.value?.avatar || null,
  first_name: user.value?.first_name || '',
  last_name: user.value?.last_name || '',
  email: user.value?.email || '',
  metadata: {
    location: {
      address: user.value?.metadata?.location?.address || '',
      city: user.value?.metadata?.location?.city || '',
      country: user.value?.metadata?.location?.country || '',
      zip: user.value?.metadata?.location?.zip || '',
    },
    role: user.value?.metadata?.role || '',
    bio: user.value?.metadata?.bio || '',
    info: {
      experience: [
        '0-2 years',
        '2-5 years',
        '5-10 years',
        '10+ years',
      ].includes(user.value?.metadata?.info?.experience)
        ? user.value?.metadata?.info?.experience
        : null,
      firstJob: user.value?.metadata?.info?.firstJob || null,
      flexible: user.value?.metadata?.info?.flexible || null,
      remote: user.value?.metadata?.info?.remote || null,
    },
    social: {
      facebook: user.value?.metadata?.social?.facebook || '',
      twitter: user.value?.metadata?.social?.twitter || '',
      dribbble: user.value?.metadata?.social?.dribbble || '',
      instagram: user.value?.metadata?.social?.instagram || '',
      github: user.value?.metadata?.social?.github || '',
      gitlab: user.value?.metadata?.social?.gitlab || '',
    },
  },
}))

// This is the list of options for the select inputs
const experience = ['0-2 years', '2-5 years', '5-10 years', '10+ years']
const answers = [
  {
    label: 'Yes',
    value: true,
  },
  {
    label: 'No',
    value: false,
  },
]

// This is the computed value that will be used to display the current avatar
const currentAvatar = computed(() => userStore.getProfile?.avatar || null)

const {
  handleSubmit,
  isSubmitting,
  setFieldError,
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

// BaseInputFileHeadless gives us a listfile input, but we need to
// extract the file from the list and set it to the form
const inputFile = ref<FileList | null>(user.value?.avatar)
const fileError = useFieldError('avatar')
watch(inputFile, (value) => {
  const file = value?.item(0) || null
  setFieldValue('avatar', file)
  if (inputFile.value) {
    handleFileUpload()
  }
})
const { toast } = useUtils()
const handleFileUpload = async () => {
  const body = new FormData()
  body.append('files', inputFile.value[0])
  body.append('oldImagePath', user.value?.avatar)
  body.append('type', 'avatar')

  const response = await useFetch('/api/upload', {
    method: 'POST',
    body,
  })

  if (response?.data?.value !== '') {
    const updateResponse = await updateProfile(
      undefined,
      undefined,
      undefined,
      undefined,
      response.data.value,
    )
    if (updateResponse.status === 'success') {
      toast.successText('Your avatar has been updated!')
      userStore.fetchProfile()
    } else {
      if (updateResponse.error.data.errors) {
        for (const [key, value] of Object.entries(
          updateResponse.error.data.errors,
        )) {
          setFieldError(key, value[0])
        }
      } else {
        // handle error without data.errors property
        console.error(updateResponse.error.message)
      }
    }
  } else {
    if (response.error.data && response.error.data.errors) {
      for (const [key, value] of Object.entries(response.error.data.errors)) {
        setFieldError(key, value[0])
      }
    } else {
      toast.dangerText('Something went wrong, please try again later')
    }
  }
}

// Ask the user for confirmation before leaving the page if the form has unsaved changes
onBeforeRouteLeave(() => {
  if (meta.value.dirty) {
    return confirm('You have unsaved changes. Are you sure you want to leave?')
  }
})

// This is where you would send the form data to the server
const onSubmit = handleSubmit(async (values: any) => {
  try {
    success.value = false
    const { error } = await updateProfile(
      values.first_name,
      values.last_name,
      values.email,
      values.metadata,
    )

    if (error) {
      try {
        toast.danger(error)
        for (const [key, value] of Object.entries(error.data.errors)) {
          setFieldError(key, value[0])
        }
      } catch (error) {
        console.error(error)
      }
      return
    }
    toast.successText('Your profile has been updated!')

    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth',
    })

    success.value = true
    userStore.fetchProfile()
    setTimeout(() => {
      success.value = false
    }, 3000)
  } catch (error) {
    toast.danger(error as any)
  }
})
const isValidFile = (file: any) => file instanceof File || file instanceof Blob
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
            {{ $t('General info') }}
          </BaseHeading>
          <BaseText size="xs" class="text-muted-400">
            {{ $t("Edit your account's general information") }}
          </BaseText>
        </div>
        <div class="flex items-center gap-2">
          <NuxtLink to="/user">
            <BaseButton class="w-24">{{ $t('Cancel') }}</BaseButton>
          </NuxtLink>
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
            {{ $t('Your profile has been updated') }}!
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
            label="Profile picture"
            sublabel="This is how others will recognize you"
          >
            <div
              class="relative flex flex-col items-center justify-center gap-4"
            >
              <BaseFullscreenDropfile
                icon="ph:image-duotone"
                :filter-file-dropped="(file) => file.type.startsWith('image')"
                @drop="
                  (value) => {
                    inputFile = value
                  }
                "
              />
              <BaseInputFileHeadless
                accept="image/*"
                v-model="inputFile"
                v-slot="{ open, remove, preview, files }"
              >
                <div class="relative h-24 w-24">
                  <img
                    v-if="files?.length && isValidFile(files[0])"
                    :src="preview(files.item(0)!).value"
                    alt="Upload preview"
                    class="bg-muted-200 dark:bg-muted-700/60 h-24 w-24 rounded-full object-cover object-center"
                  />
                  <img
                    v-else
                    :src="currentAvatar ?? '/img/avatars/1.svg'"
                    alt="Upload preview"
                    class="bg-muted-200 dark:bg-muted-700/60 h-24 w-24 rounded-full object-cover object-center"
                  />
                  <div
                    v-if="files?.length && isValidFile(files[0])"
                    class="absolute bottom-0 end-0 z-20"
                  >
                    <BaseButtonIcon
                      condensed
                      shape="full"
                      @click="remove(files.item(0)!)"
                      data-nui-tooltip="Remove image"
                    >
                      <Icon name="lucide:x" class="h-4 w-4" />
                    </BaseButtonIcon>
                  </div>
                  <div v-else class="absolute bottom-0 end-0 z-20">
                    <div class="relative" data-nui-tooltip="Upload image">
                      <BaseButtonIcon condensed shape="full" @click="open">
                        <Icon name="lucide:plus" class="h-4 w-4" />
                      </BaseButtonIcon>
                    </div>
                  </div>
                </div>
              </BaseInputFileHeadless>
              <div
                v-if="fileError"
                class="text-danger-600 inline-block font-sans text-[.8rem]"
              >
                {{ fileError }}
              </div>
            </div>
          </TairoFormGroup>

          <TairoFormGroup
            label="Profile Info"
            sublabel="Others diserve to know you more"
          >
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="email"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    color="success"
                    type="email"
                    icon="ic:outline-alternate-email"
                    label="Email"
                    placeholder="Email"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="first_name"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="ph:user-duotone"
                    label="First name"
                    placeholder="First name"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="last_name"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="ph:user-duotone"
                    label="Last name"
                    placeholder="Last name"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="metadata.role"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="ph:suitcase-duotone"
                    label="Job title"
                    placeholder="Job title"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="metadata.location.address"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="ph:map-pin-line-duotone"
                    label="Address"
                    placeholder="Address"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="metadata.location.city"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="ph:map-pin-duotone"
                    label="City"
                    placeholder="City"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="metadata.location.country"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="ph:map-pin-duotone"
                    label="Country"
                    placeholder="Country"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="metadata.location.zip"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="ph:map-trifold-duotone"
                    label="ZIP"
                    placeholder="ZIP"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="metadata.bio"
                >
                  <BaseTextarea
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    rows="4"
                    label="About you / Short bio..."
                    placeholder="About you / Short bio..."
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
            </div>
          </TairoFormGroup>

          <TairoFormGroup
            label="Professional Info"
            sublabel="This can help you to win some opportunities"
          >
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="metadata.info.experience"
                >
                  <BaseListbox
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    :items="experience"
                    shape="rounded"
                    label="Experience"
                    placeholder="Experience"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="metadata.info.firstJob"
                >
                  <BaseListbox
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    :items="answers"
                    :properties="{ label: 'label', value: 'value' }"
                    shape="rounded"
                    label="Is this your first job?"
                    placeholder="Is this your first job?"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="metadata.info.flexible"
                >
                  <BaseListbox
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    :items="answers"
                    :properties="{ label: 'label', value: 'value' }"
                    shape="rounded"
                    label="Are you flexible?"
                    placeholder="Are you flexible?"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="metadata.info.remote"
                >
                  <BaseListbox
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    :items="answers"
                    :properties="{ label: 'label', value: 'value' }"
                    shape="rounded"
                    label="Do you work remotely?"
                    placeholder="Do you work remotely?"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
            </div>
          </TairoFormGroup>

          <TairoFormGroup
            label="Social Profiles"
            sublabel="This can help others finding you on social media"
          >
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="metadata.social.facebook"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="fa6-brands:facebook-f"
                    label="Facebook URL"
                    placeholder="Facebook URL"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="metadata.social.twitter"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="fa6-brands:twitter"
                    label="Twitter URL"
                    placeholder="Twitter URL"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="metadata.social.dribbble"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="fa6-brands:dribbble"
                    label="Dribbble URL"
                    placeholder="Dribbble URL"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="metadata.social.instagram"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="fa6-brands:instagram"
                    label="Instagram URL"
                    placeholder="Instagram URL"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="metadata.social.github"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="fa6-brands:github"
                    label="Github URL"
                    placeholder="Github URL"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="metadata.social.gitlab"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="fa6-brands:gitlab"
                    label="Gitlab URL"
                    placeholder="Gitlab URL"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
            </div>
          </TairoFormGroup>
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
