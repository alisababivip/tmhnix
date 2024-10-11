<script setup lang="ts">
import type { KycTemplate } from '~~/types'

const props = defineProps({
  flutter: {
    type: Boolean,
    default: false,
  },
})
// Access the Vue Router
const router = useRouter()
const route = useRoute()

const levelQuery = parseInt(route.query.l as string)
const typeQuery = route.query.state

const isSubmitting = ref(false)
const activeTemplate = ref<KycTemplate | null>(null)
const { createKyc, getActiveKycTemplate, getUserKyc } = useKyc()
const { toast } = useUtils()

// Define reactive variables for generalKeys and customKeys
const generalKeys = ref<string[]>([])
const documentKeys = ref<string[]>([])

const handleChange = (key: string, value: any) => {
  formValues.value[key] = value
  validateField(key, value)
}

const handleCustomFieldChange = (index: number, value: any) => {
  formValues.value.custom_fields[index].value = value
  validateCustomFields()
}

const customFieldsFileUpload = computed(() => {
  if (activeTemplate.value?.options?.custom_fields) {
    return activeTemplate.value.options.custom_fields.filter(
      (field) =>
        field.type === 'file upload' && parseInt(field.level) === levelQuery,
    )
  }
  return []
})

const makeInitialValues = (options: any) => {
  let initialValues: any = {}

  for (const [key, value] of Object.entries(options)) {
    if (key !== 'custom_fields') {
      if (parseInt(value.level) === levelQuery) {
        initialValues[key] = value.enabled ? (value.required ? '' : null) : null
      }
    } else {
      initialValues['custom_fields'] = options.custom_fields
        .filter((field: any) => parseInt(field.level) === levelQuery)
        .map((field: any) => ({
          title: field.title,
          value: field.required ? '' : null,
          type: field.type,
          level: parseInt(field.level),
        }))
    }
  }

  return initialValues
}

const validateField = (key: string, value: any) => {
  const fieldOptions = activeTemplate.value?.options[key]
  if (!fieldOptions || parseInt(fieldOptions.level) !== levelQuery) return

  if (!fieldOptions) return

  if (fieldOptions.required && (!value || value === '')) {
    formErrors.value = { ...formErrors.value, [key]: 'This field is required' }
    return
  }

  // Remove error
  const { [key]: removed, ...rest } = formErrors.value
  formErrors.value = { ...rest }
}

const validateCustomFields = () => {
  const newCustomFieldErrors: string[] = []

  const filteredCustomFields =
    activeTemplate.value?.options?.custom_fields.filter(
      (field) => parseInt(field.level) === levelQuery,
    )

  filteredCustomFields?.forEach((field, index) => {
    const value = formValues.value.custom_fields[index]?.value

    if ((!value || value === '') && field.type !== 'file upload') {
      newCustomFieldErrors[index] = 'This field is required'
    } else {
      newCustomFieldErrors[index] = null
    }
  })

  // Update custom_fields errors
  formErrors.value.custom_fields = newCustomFieldErrors

  // Remove the custom_fields key if all its values are null
  if (
    formErrors.value.custom_fields.every(
      (error: string | null) => error === null,
    )
  ) {
    const { custom_fields, ...restErrors } = formErrors.value
    formErrors.value = restErrors
  }
}

const formValues = ref<any>({})
const formErrors = ref<any>({})
const userStore = useUserStore()
const user = computed(() => userStore.getProfile)
const existingKyc = ref<any>(null)
const documents = [
  'document_passport',
  'document_drivers_license',
  'document_id_card',
]

onMounted(async () => {
  if (!typeQuery || !levelQuery) {
    router.push(props.flutter ? '/user/flutter/kyc' : '/user/kyc')
    return
  }
  if (
    (user.value?.kyc?.level &&
      user.value?.kyc?.level >= levelQuery &&
      typeQuery === 'new') ||
    (user.value?.kyc?.level &&
      user.value?.kyc?.level > levelQuery &&
      typeQuery === 'resubmit')
  ) {
    router.push(props.flutter ? '/user/flutter/kyc' : '/user/kyc')
    return
  }
  if (
    (user.value?.kyc?.level &&
      user.value?.kyc?.level + 1 !== levelQuery &&
      typeQuery === 'new') ||
    (user.value?.kyc?.level &&
      user.value?.kyc?.level !== levelQuery &&
      typeQuery === 'resubmit')
  ) {
    router.push(props.flutter ? '/user/flutter/kyc' : '/user/kyc')
    return
  }
  try {
    const existingKycResponse = await getUserKyc()
    existingKyc.value = existingKycResponse.data.result
  } catch (error) {}

  try {
    const response = await getActiveKycTemplate()
    activeTemplate.value = response.data.result

    if (activeTemplate.value?.options) {
      formValues.value = makeInitialValues(activeTemplate.value.options)
    }

    // Only include keys of items with "enabled: true" and exclude 'custom_fields' and document types
    generalKeys.value = Object.keys(activeTemplate.value?.options || {}).filter(
      (key) =>
        key !== 'custom_fields' &&
        !documents.includes(key) &&
        activeTemplate.value?.options[key].enabled &&
        parseInt(activeTemplate.value?.options[key].level) === levelQuery,
    )

    documentKeys.value = Object.keys(
      activeTemplate.value?.options || {},
    ).filter(
      (key) =>
        key !== 'custom_fields' &&
        activeTemplate.value?.options[key].enabled &&
        documents.includes(key) &&
        parseInt(activeTemplate.value?.options[key].level) === levelQuery, // Additional check for level
    )

    if (documentKeys.value.length > 0) {
      selectedDocument.value = documentKeys.value[0]
    }

    if (activeTemplate.value?.options?.custom_fields) {
      activeTemplate.value.options.custom_fields =
        activeTemplate.value.options.custom_fields
          .filter((field: any) => parseInt(field.level) === levelQuery)
          .map((field: any) => {
            if (field.type === 'file upload') {
              return {
                ...field,
                value: null,
              }
            }
            return field
          })
    }
  } catch (error) {
    console.log(error)
    // TODO: Handle the error more gracefully
  }
})

// Create Template
async function submit() {
  isSubmitting.value = true
  for (const key of generalKeys.value) {
    validateField(key, formValues.value[key])
  }

  // Validate custom fields
  validateCustomFields()

  // Check if there are any errors
  const hasErrors = Object.values(formErrors.value).some((error) => {
    if (Array.isArray(error)) {
      return error.some((item) => item !== null)
    }
    return error !== null
  })

  if (hasErrors) {
    // Handle error case (e.g., show a toast)
    return
  }

  formValues.value.documents = {
    document_passport: {
      front:
        existingKyc.value?.data?.documents?.document_passport?.front || null,
      selfie:
        existingKyc.value?.data?.documents?.document_passport?.selfie || null,
    },
    document_drivers_license: {
      front:
        existingKyc.value?.data?.documents?.document_drivers_license?.front ||
        null,
      selfie:
        existingKyc.value?.data?.documents?.document_drivers_license?.selfie ||
        null,
    },
    document_id_card: {
      front:
        existingKyc.value?.data?.documents?.document_id_card?.front || null,
      back: existingKyc.value?.data?.documents?.document_id_card?.back || null,
      selfie:
        existingKyc.value?.data?.documents?.document_id_card?.selfie || null,
    },
  }
  formValues.value[selectedDocument.value] = true

  if (selectedDocument.value !== null) {
    const requirements = documentRequirements[selectedDocument.value]
    for (const { side, fileRef, toastMessage } of requirements) {
      if (!fileRef.value) {
        toast.dangerText(`Please upload your ${toastMessage}`)
        return
      }
    }
  }

  if (frontFile.value && selectedDocument.value !== null) {
    // Create FormData for file upload
    const body = new FormData()
    body.append('files', frontFile.value[0])
    body.append('type', 'kycFrontFile')

    // Upload the file
    const uploadResponse = await useFetch('/api/upload', {
      method: 'POST',
      body,
    })

    // Check if the upload was successful and get the URL
    if (uploadResponse && uploadResponse.data.value !== '') {
      // Set the new image URL in the form values
      formValues.value.documents[selectedDocument.value].front =
        uploadResponse.data.value[0]
    }
  }
  if (backFile.value && selectedDocument.value === 'document_id_card') {
    // Create FormData for file upload
    const body = new FormData()
    body.append('files', backFile.value[0])
    body.append('type', 'kycBackFile')

    // Upload the file
    const uploadResponse = await useFetch('/api/upload', {
      method: 'POST',
      body,
    })

    // Check if the upload was successful and get the URL
    if (uploadResponse && uploadResponse.data.value !== '') {
      // Set the new image URL in the form values
      formValues.value.documents[selectedDocument.value].back =
        uploadResponse.data.value[0]
    }
  }
  if (selfieFile.value && selectedDocument.value !== null) {
    // Create FormData for file upload
    const body = new FormData()
    body.append('files', selfieFile.value[0])
    body.append('type', 'kycSelfieFile')

    // Upload the file
    const uploadResponse = await useFetch('/api/upload', {
      method: 'POST',
      body,
    })

    // Check if the upload was successful and get the URL
    if (uploadResponse && uploadResponse.data.value !== '') {
      // Set the new image URL in the form values
      formValues.value.documents[selectedDocument.value].selfie =
        uploadResponse.data.value[0]
    }
  }
  await Promise.all(
    customFieldsFileUpload.value.map(async (item) => {
      const file = item.value?.item(0) || null
      if (file) {
        // Create FormData for file upload
        const body = new FormData()
        body.append('files', item.value[0])
        body.append('type', 'kycCustomFile')

        // Upload the file
        const uploadResponse = await useFetch('/api/upload', {
          method: 'POST',
          body,
        })

        // Check if the upload was successful and get the URL
        if (uploadResponse && uploadResponse.data.value !== '') {
          // Find the matching field and update its value
          const fieldToUpdate = formValues.value.custom_fields.find(
            (field: any) => field.title === item.title,
          )
          if (fieldToUpdate) {
            fieldToUpdate.value = uploadResponse.data.value[0]
          }
        }
      }
    }),
  )

  try {
    const response = await createKyc(
      activeTemplate.value?.id,
      formValues.value,
      levelQuery,
    )
    toast.response(response)
    router.push(props.flutter ? '/user/flutter/kyc' : '/user/kyc')
  } catch (error) {
    console.log(error)

    toast.danger(error as any)
  }
  isSubmitting.value = false
}

const inputs = {
  first_name: {
    title: 'First Name',
    autocomplete: 'given-name',
    type: 'text',
  },
  last_name: { title: 'Last Name', autocomplete: 'family-name', type: 'text' },
  email: { title: 'Email', autocomplete: 'email', type: 'email' },
  phone: { title: 'Phone', autocomplete: 'tel', type: 'tel' },
  address: {
    title: 'Address',
    autocomplete: 'street-address',
    type: 'text',
  },
  city: { title: 'City', autocomplete: 'address-level2', type: 'text' },
  state: { title: 'State', autocomplete: 'address-level1', type: 'text' },
  country: { title: 'Country', autocomplete: 'country', type: 'text' },
  zip: { title: 'Zip', autocomplete: 'postal-code', type: 'text' },
  dob: { title: 'Date of Birth', autocomplete: 'bday', type: 'date' },
  ssn: { title: 'SSN', autocomplete: '', type: 'number' },
  document_passport: {
    title: 'Passport',
    type: 'upload',
  },
  document_drivers_license: {
    title: 'Driver License',
    type: 'upload',
  },
  document_id_card: {
    title: 'National ID',
    type: 'upload',
  },
}

const previewUrls = ref<any>([])

watch(
  customFieldsFileUpload,
  (newFiles) => {
    newFiles.forEach((item) => {
      const file = item.value?.item(0) || null
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          previewUrls.value[item.title] = e.target?.result as string
        }
        reader.readAsDataURL(file)
      }
    })
  },
  { deep: true },
)

// Image File Handling
const frontFile = ref<FileList | null>(null)
const frontPreviewUrl = ref<string | null>(null)

watch(frontFile, (value) => {
  const file = value?.item(0) || null
  if (frontFile.value) {
    const reader = new FileReader()
    reader.onload = (e) => {
      frontPreviewUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
})

const backFile = ref<FileList | null>(null)
const backPreviewUrl = ref<string | null>(null)

watch(backFile, (value) => {
  const file = value?.item(0) || null
  if (backFile.value) {
    const reader = new FileReader()
    reader.onload = (e) => {
      backPreviewUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
})

const selfieFile = ref<FileList | null>(null)
const selfiePreviewUrl = ref<string | null>(null)

watch(selfieFile, (value) => {
  const file = value?.item(0) || null
  if (selfieFile.value) {
    const reader = new FileReader()
    reader.onload = (e) => {
      selfiePreviewUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
})

const selectedDocument = ref<string | null>(null)
watch(selectedDocument, (value) => {
  documentKeys.value.forEach((fieldName) => {
    formValues.value[fieldName] = null
  })
  if (value) {
    formValues.value[value] = true
  }
})

const documentRequirements: Record<
  string,
  { side: string; fileRef: Ref<FileList | null>; toastMessage: string }[]
> = {
  document_passport: [
    {
      side: 'front',
      fileRef: frontFile,
      toastMessage: 'passport front side',
    },
    {
      side: 'selfie',
      fileRef: selfieFile,
      toastMessage: 'passport selfie',
    },
  ],
  document_drivers_license: [
    {
      side: 'front',
      fileRef: frontFile,
      toastMessage: 'driver license front side',
    },
    {
      side: 'selfie',
      fileRef: selfieFile,
      toastMessage: 'driver license selfie',
    },
  ],
  document_id_card: [
    {
      side: 'front',
      fileRef: frontFile,
      toastMessage: 'national id front side',
    },
    {
      side: 'back',
      fileRef: backFile,
      toastMessage: 'national id back side',
    },
    {
      side: 'selfie',
      fileRef: selfieFile,
      toastMessage: 'national id selfie',
    },
  ],
}
</script>

<template>
  <TairoContentWrapper>
    <div
      class="flex justify-between items-center mx-auto w-full max-w-4xl pb-10"
    >
      <BaseHeading size="lg">
        {{ $t('KYC Application') }}
      </BaseHeading>
      <BaseButton
        type="button"
        color="muted"
        :to="flutter ? '/user/flutter/kyc' : '/user/kyc'"
      >
        <Icon name="line-md:chevron-left" class="h-4 w-4 mr-2" />
        {{ $t('Back') }}
      </BaseButton>
    </div>
    <form
      action=""
      method="POST"
      @submit.prevent="submit"
      class="mx-auto w-full max-w-4xl pb-20 space-y-10"
    >
      <div
        v-if="generalKeys.length > 0"
        class="flex flex-col items-start gap-4 md:flex-row md:text-left"
      >
        <BaseIconBox
          size="lg"
          shape="full"
          class="bg-gray-200 text-gray-500 dark:bg-gray-800 text-3xl font-bold"
          v-if="$viewport.isGreaterOrEquals('md')"
        >
          1
        </BaseIconBox>
        <div class="w-full">
          <div
            :class="{
              'flex flex-row items-start gap-2 w-full':
                $viewport.isLessThan('md'),
            }"
          >
            <BaseIconBox
              size="lg"
              shape="full"
              class="bg-gray-200 text-gray-500 dark:bg-gray-800 text-3xl font-bold xs:flex md:hidden"
            >
              3
            </BaseIconBox>
            <div>
              <BaseHeading
                as="h2"
                size="xl"
                weight="light"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span>
                  {{
                    $t(
                      'General Information for your account verification process',
                    )
                  }}
                </span>
              </BaseHeading>
              <BaseParagraph>
                <span class="text-muted-500">
                  <span>
                    {{
                      $t(
                        'To verify your identity, we ask you to fill in the following information.',
                      )
                    }}
                  </span>
                </span>
              </BaseParagraph>
            </div>
          </div>
          <BaseCard class="w-full mt-5">
            <div
              class="p-5 grid gap-5 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2"
            >
              <template v-for="(item, key) in generalKeys" :key="key">
                <BaseInput
                  v-model="formValues[item]"
                  :error="formErrors[item]"
                  :type="inputs[item].type"
                  :label="inputs[item].title"
                  :placeholder="`Enter your ${inputs[item].title}`"
                  shape="rounded"
                  class="w-full"
                  @input="handleChange(item, formValues[item])"
                />
              </template>
            </div>
          </BaseCard>
        </div>
      </div>

      <div
        v-if="documentKeys.length > 0"
        class="flex flex-col items-start gap-4 md:flex-row md:text-left w-full"
      >
        <BaseIconBox
          size="lg"
          shape="full"
          class="bg-gray-200 text-gray-500 dark:bg-gray-800 text-3xl font-bold"
          v-if="$viewport.isGreaterOrEquals('md')"
        >
          {{ generalKeys.length > 0 ? 2 : 1 }}
        </BaseIconBox>
        <div class="w-full">
          <div
            :class="{
              'flex flex-row items-start gap-2 w-full':
                $viewport.isLessThan('md'),
            }"
          >
            <BaseIconBox
              size="lg"
              shape="full"
              class="bg-gray-200 text-gray-500 dark:bg-gray-800 text-3xl font-bold xs:flex md:hidden"
            >
              {{ generalKeys.length > 0 ? 2 : 1 }}
            </BaseIconBox>
            <div>
              <BaseHeading
                as="h2"
                size="xl"
                weight="light"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span>
                  {{ $t('Document Upload') }}
                </span>
              </BaseHeading>
              <BaseParagraph>
                <span class="text-muted-500">
                  <span>
                    {{
                      $t(
                        'To verify your identity, we ask you to upload high-quality scans or photos of your official identification documents issued by the government.',
                      )
                    }}
                  </span>
                </span>
              </BaseParagraph>
            </div>
          </div>
          <BaseCard class="py-5 space-y-5 max-w-4xl mt-5">
            <BaseMessage class="mx-5" type="warning" icon>{{
              $t(
                'In order to complete, please upload any of the following personal documents.',
              )
            }}</BaseMessage>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 px-5">
              <template v-for="(field, key) in documentKeys" :key="key">
                <BaseRadioHeadless
                  v-model="selectedDocument"
                  name="radio_custom"
                  :value="field"
                >
                  <BaseCard
                    shape="curved"
                    class="peer-checked:!border-blue-500 peer-checked:!bg-success-500/10 relative border-2 px-5 py-2 flex justify-between items-center cursor-pointer transition-colors duration-400"
                  >
                    <div class="flex flex-col">
                      <h4
                        class="text-muted-500 dark:text-muted-200 font-sans text-sm font-medium uppercase leading-tight"
                      >
                        {{ inputs[field].title }}
                      </h4>
                    </div>

                    <div class="">
                      <img
                        :src="`/img/vector/icon-${field}${
                          selectedDocument === field ? '-color' : ''
                        }.png`"
                        class="h-12 w-12 transition duration-500"
                      />
                    </div>
                  </BaseCard> </BaseRadioHeadless
              ></template>
            </div>
            <div v-if="selectedDocument !== null">
              <div class="px-5">
                <p class="text-dark font-bold">
                  {{
                    $t(
                      'To avoid delays with verification process, please double-check to ensure the below requirements are fully met:',
                    )
                  }}
                </p>
                <ul class="mt-2 mb-5">
                  <li class="flex items-center gap-2">
                    <Icon name="lucide:check" class="h-3 w-3 text-current" />
                    <span class="text-muted-700 dark:text-muted-300">
                      {{ $t('Chosen credential must not be expired.') }}</span
                    >
                  </li>
                  <li class="flex items-center gap-2">
                    <Icon name="lucide:check" class="h-3 w-3 text-current" />
                    <span class="text-muted-700 dark:text-muted-300">
                      {{
                        $t(
                          'Document should be in good condition and clearly visible.',
                        )
                      }}</span
                    >
                  </li>
                  <li class="flex items-center gap-2">
                    <Icon name="lucide:check" class="h-3 w-3 text-current" />
                    <span class="text-muted-700 dark:text-muted-300">
                      {{
                        $t(
                          'There is no light glare or reflections on the card.',
                        )
                      }}</span
                    >
                  </li>
                  <li class="flex items-center gap-2">
                    <Icon name="lucide:check" class="h-3 w-3 text-current" />
                    <span class="text-muted-700 dark:text-muted-300">
                      {{
                        $t(
                          'File is at least 1 MB in size and has at least 300 dpi resolution.',
                        )
                      }}</span
                    >
                  </li>
                </ul>
              </div>
              <div
                class="border-b border-gray-200 dark:border-gray-700 pb-5 mb-5"
              >
                <h6 class="font-midium text-dark px-5 pb-2">
                  {{ $t('Upload Here Your') }}
                  {{ inputs[selectedDocument].title }}
                  {{ $t('Front Side') }}
                  {{ $t('Copy') }}
                </h6>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 px-5">
                  <div class="xs:col-span-1 sm:col-span-2">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                      <BaseInputFileHeadless
                        v-model="frontFile"
                        v-slot="{ open, remove, preview, drop, files }"
                      >
                        <div
                          class=""
                          @dragenter.stop.prevent
                          @dragover.stop.prevent
                          @drop="drop"
                        >
                          <div
                            v-if="!files?.length"
                            class="nui-focus border-muted-300 dark:border-muted-700 hover:border-muted-400 focus:border-muted-400 dark:hover:border-muted-600 dark:focus:border-muted-700 group cursor-pointer rounded-lg border-[3px] border-dashed transition-colors duration-300"
                            tabindex="0"
                            role="button"
                            @click="open"
                            @keydown.enter.prevent="open"
                          >
                            <div class="p-5 text-center">
                              <Icon
                                name="mdi-light:cloud-upload"
                                class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 mb-2 h-10 w-10 transition-colors duration-300"
                              />

                              <h4 class="text-muted-400 font-sans text-sm">
                                {{ $t('Drop file to upload') }}
                              </h4>

                              <div>
                                <span
                                  class="text-muted-400 font-sans text-[0.7rem] font-semibold uppercase"
                                >
                                  {{ $t('Or') }}
                                </span>
                              </div>

                              <label
                                for="file"
                                class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 cursor-pointer font-sans text-sm underline underline-offset-4 transition-colors duration-300"
                              >
                                {{ $t('Select Image') }}
                              </label>
                            </div>
                          </div>

                          <ul v-else class="mt-6 space-y-2">
                            <li v-for="file in files" :key="file.name">
                              <div
                                class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-end gap-2 rounded-xl border bg-white p-3"
                              >
                                <div class="flex items-center gap-2">
                                  <div class="shrink-0">
                                    <img
                                      class="h-14 w-14 rounded-xl object-cover object-center"
                                      v-if="file.type.startsWith('image')"
                                      :src="preview(file).value"
                                      alt="Image preview"
                                    />

                                    <img
                                      v-else
                                      class="h-14 w-14 rounded-xl object-cover object-center"
                                      src="/img/avatars/placeholder-file.png"
                                      alt="Image preview"
                                    />
                                  </div>

                                  <div class="font-sans">
                                    <span
                                      class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm"
                                    >
                                      {{ file.name }}
                                    </span>

                                    <span class="text-muted-400 block text-xs">
                                      {{ formatFileSize(file.size) }}
                                    </span>
                                  </div>
                                </div>

                                <div
                                  class="ms-auto w-32 px-4 transition-opacity duration-300"
                                  :class="'opacity-100'"
                                >
                                  <BaseProgress
                                    :value="0"
                                    size="xs"
                                    :color="'success'"
                                  />
                                </div>

                                <div class="flex gap-2">
                                  <button
                                    class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60"
                                    disabled
                                    type="button"
                                    tooltip="Cancel"
                                  >
                                    <Icon name="lucide:slash" class="h-4 w-4" />

                                    <span class="sr-only">Cancel</span>
                                  </button>

                                  <button
                                    class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                                    type="button"
                                    tooltip="Upload"
                                  >
                                    <Icon
                                      name="lucide:arrow-up"
                                      class="h-4 w-4"
                                    />

                                    <span class="sr-only">Upload</span>
                                  </button>

                                  <button
                                    class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                                    type="button"
                                    tooltip="Remove"
                                    @click.prevent="remove(file)"
                                  >
                                    <Icon name="lucide:x" class="h-4 w-4" />

                                    <span class="sr-only">Remove</span>
                                  </button>
                                </div>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </BaseInputFileHeadless>
                      <div
                        v-if="frontPreviewUrl"
                        class="mb-4 h-40 w-full flex items-center justify-center overflow-hidden rounded-xl"
                      >
                        <img
                          :src="frontPreviewUrl"
                          alt="Image Preview"
                          class="max-h-full max-w-full object-cover object-center rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="col-span-1 xs:hidden sm:flex justify-end">
                    <div class="mx-md-4">
                      <img
                        width="160"
                        class="_image"
                        :src="`/img/vector/${selectedDocument}.png`"
                        alt=""
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="border-b border-gray-200 dark:border-gray-700 pb-5 mb-5"
                :key="selectedDocument"
                v-if="selectedDocument == 'document_id_card'"
              >
                <h6 class="font-mid text-dark px-5 pb-2">
                  {{ $t('Upload Here Your National ID Back Side') }}
                </h6>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 px-5">
                  <div class="xs:col-span-1 sm:col-span-2">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                      <BaseInputFileHeadless
                        v-model="backFile"
                        v-slot="{ open, remove, preview, drop, files }"
                      >
                        <div
                          class=""
                          @dragenter.stop.prevent
                          @dragover.stop.prevent
                          @drop="drop"
                        >
                          <div
                            v-if="!files?.length"
                            class="nui-focus border-muted-300 dark:border-muted-700 hover:border-muted-400 focus:border-muted-400 dark:hover:border-muted-600 dark:focus:border-muted-700 group cursor-pointer rounded-lg border-[3px] border-dashed transition-colors duration-300"
                            tabindex="0"
                            role="button"
                            @click="open"
                            @keydown.enter.prevent="open"
                          >
                            <div class="p-5 text-center">
                              <Icon
                                name="mdi-light:cloud-upload"
                                class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 mb-2 h-10 w-10 transition-colors duration-300"
                              />

                              <h4 class="text-muted-400 font-sans text-sm">
                                {{ $t('Drop file to upload') }}
                              </h4>

                              <div>
                                <span
                                  class="text-muted-400 font-sans text-[0.7rem] font-semibold uppercase"
                                >
                                  {{ $t('Or') }}
                                </span>
                              </div>

                              <label
                                for="file"
                                class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 cursor-pointer font-sans text-sm underline underline-offset-4 transition-colors duration-300"
                              >
                                {{ $t('Select Image') }}
                              </label>
                            </div>
                          </div>

                          <ul v-else class="mt-6 space-y-2">
                            <li v-for="file in files" :key="file.name">
                              <div
                                class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-end gap-2 rounded-xl border bg-white p-3"
                              >
                                <div class="flex items-center gap-2">
                                  <div class="shrink-0">
                                    <img
                                      class="h-14 w-14 rounded-xl object-cover object-center"
                                      v-if="file.type.startsWith('image')"
                                      :src="preview(file).value"
                                      alt="Image preview"
                                    />

                                    <img
                                      v-else
                                      class="h-14 w-14 rounded-xl object-cover object-center"
                                      src="/img/avatars/placeholder-file.png"
                                      alt="Image preview"
                                    />
                                  </div>

                                  <div class="font-sans">
                                    <span
                                      class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm"
                                    >
                                      {{ file.name }}
                                    </span>

                                    <span class="text-muted-400 block text-xs">
                                      {{ formatFileSize(file.size) }}
                                    </span>
                                  </div>
                                </div>

                                <div
                                  class="ms-auto w-32 px-4 transition-opacity duration-300"
                                  :class="'opacity-100'"
                                >
                                  <BaseProgress
                                    :value="0"
                                    size="xs"
                                    :color="'success'"
                                  />
                                </div>

                                <div class="flex gap-2">
                                  <button
                                    class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60"
                                    disabled
                                    type="button"
                                    tooltip="Cancel"
                                  >
                                    <Icon name="lucide:slash" class="h-4 w-4" />

                                    <span class="sr-only">Cancel</span>
                                  </button>

                                  <button
                                    class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                                    type="button"
                                    tooltip="Upload"
                                  >
                                    <Icon
                                      name="lucide:arrow-up"
                                      class="h-4 w-4"
                                    />

                                    <span class="sr-only">Upload</span>
                                  </button>

                                  <button
                                    class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                                    type="button"
                                    tooltip="Remove"
                                    @click.prevent="remove(file)"
                                  >
                                    <Icon name="lucide:x" class="h-4 w-4" />

                                    <span class="sr-only">Remove</span>
                                  </button>
                                </div>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </BaseInputFileHeadless>
                      <div
                        v-if="backPreviewUrl"
                        class="mb-4 h-40 w-full flex items-center justify-center overflow-hidden rounded-xl"
                      >
                        <img
                          :src="backPreviewUrl"
                          alt="Image Preview"
                          class="max-h-full max-w-full object-cover object-center rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="col-span-1 xs:hidden sm:flex justify-end">
                    <div class="mx-md-4">
                      <img
                        width="160"
                        src="/img/vector/document_id_card_back.png"
                        alt=""
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div class="px-5 pb-5">
                <h6 class="font-mid text-dark pb-2">
                  {{
                    $t(
                      'Upload a selfie as a Photo Proof while holding document in your hand',
                    )
                  }}
                </h6>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div class="xs:col-span-1 sm:col-span-2">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                      <BaseInputFileHeadless
                        v-model="selfieFile"
                        v-slot="{ open, remove, preview, drop, files }"
                      >
                        <div
                          class=""
                          @dragenter.stop.prevent
                          @dragover.stop.prevent
                          @drop="drop"
                        >
                          <div
                            v-if="!files?.length"
                            class="nui-focus border-muted-300 dark:border-muted-700 hover:border-muted-400 focus:border-muted-400 dark:hover:border-muted-600 dark:focus:border-muted-700 group cursor-pointer rounded-lg border-[3px] border-dashed transition-colors duration-300"
                            tabindex="0"
                            role="button"
                            @click="open"
                            @keydown.enter.prevent="open"
                          >
                            <div class="p-5 text-center">
                              <Icon
                                name="mdi-light:cloud-upload"
                                class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 mb-2 h-10 w-10 transition-colors duration-300"
                              />

                              <h4 class="text-muted-400 font-sans text-sm">
                                {{ $t('Drop file to upload') }}
                              </h4>

                              <div>
                                <span
                                  class="text-muted-400 font-sans text-[0.7rem] font-semibold uppercase"
                                >
                                  {{ $t('Or') }}
                                </span>
                              </div>

                              <label
                                for="file"
                                class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 cursor-pointer font-sans text-sm underline underline-offset-4 transition-colors duration-300"
                              >
                                {{ $t('Select Image') }}
                              </label>
                            </div>
                          </div>

                          <ul v-else class="mt-6 space-y-2">
                            <li v-for="file in files" :key="file.name">
                              <div
                                class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-end gap-2 rounded-xl border bg-white p-3"
                              >
                                <div class="flex items-center gap-2">
                                  <div class="shrink-0">
                                    <img
                                      class="h-14 w-14 rounded-xl object-cover object-center"
                                      v-if="file.type.startsWith('image')"
                                      :src="preview(file).value"
                                      alt="Image preview"
                                    />

                                    <img
                                      v-else
                                      class="h-14 w-14 rounded-xl object-cover object-center"
                                      src="/img/avatars/placeholder-file.png"
                                      alt="Image preview"
                                    />
                                  </div>

                                  <div class="font-sans">
                                    <span
                                      class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm"
                                    >
                                      {{ file.name }}
                                    </span>

                                    <span class="text-muted-400 block text-xs">
                                      {{ formatFileSize(file.size) }}
                                    </span>
                                  </div>
                                </div>

                                <div
                                  class="ms-auto w-32 px-4 transition-opacity duration-300"
                                  :class="'opacity-100'"
                                >
                                  <BaseProgress
                                    :value="0"
                                    size="xs"
                                    :color="'success'"
                                  />
                                </div>

                                <div class="flex gap-2">
                                  <button
                                    class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60"
                                    disabled
                                    type="button"
                                    tooltip="Cancel"
                                  >
                                    <Icon name="lucide:slash" class="h-4 w-4" />

                                    <span class="sr-only">Cancel</span>
                                  </button>

                                  <button
                                    class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                                    type="button"
                                    tooltip="Upload"
                                  >
                                    <Icon
                                      name="lucide:arrow-up"
                                      class="h-4 w-4"
                                    />

                                    <span class="sr-only">Upload</span>
                                  </button>

                                  <button
                                    class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                                    type="button"
                                    tooltip="Remove"
                                    @click.prevent="remove(file)"
                                  >
                                    <Icon name="lucide:x" class="h-4 w-4" />

                                    <span class="sr-only">Remove</span>
                                  </button>
                                </div>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </BaseInputFileHeadless>
                      <div
                        v-if="selfiePreviewUrl"
                        class="mb-4 h-40 w-full flex items-center justify-center overflow-hidden rounded-xl"
                      >
                        <img
                          :src="selfiePreviewUrl"
                          alt="Image Preview"
                          class="max-h-full max-w-full object-cover object-center rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="col-span-1 xs:hidden sm:flex justify-end">
                    <div class="mx-md-4">
                      <img
                        width="160"
                        src="/img/vector/document_selfie.png"
                        alt=""
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>

      <div
        v-if="activeTemplate?.options?.custom_fields?.length > 0"
        class="flex flex-col items-start gap-4 md:flex-row md:text-left w-full"
      >
        <BaseIconBox
          size="lg"
          shape="full"
          class="bg-gray-200 text-gray-500 dark:bg-gray-800 text-3xl font-bold"
          v-if="$viewport.isGreaterOrEquals('md')"
        >
          {{
            generalKeys.length > 0
              ? documentKeys.length > 0
                ? 3
                : 2
              : documentKeys.length > 0
              ? 2
              : 1
          }}
        </BaseIconBox>
        <div class="w-full">
          <div
            :class="{
              'flex flex-row items-start gap-2 w-full':
                $viewport.isLessThan('md'),
            }"
          >
            <BaseIconBox
              size="lg"
              shape="full"
              class="bg-gray-200 text-gray-500 dark:bg-gray-800 text-3xl font-bold xs:flex md:hidden"
            >
              {{
                generalKeys.length > 0
                  ? documentKeys.length > 0
                    ? 3
                    : 2
                  : documentKeys.length > 0
                  ? 2
                  : 1
              }}
            </BaseIconBox>
            <div>
              <BaseHeading
                as="h2"
                size="xl"
                weight="light"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span>
                  {{
                    $t(
                      'Extra Information for your account verification process',
                    )
                  }}
                </span>
              </BaseHeading>
              <BaseParagraph>
                <span class="text-muted-500">
                  <span>
                    {{
                      $t(
                        'To verify your identity, we ask you to fill in the following information.',
                      )
                    }}
                  </span>
                </span>
              </BaseParagraph>
            </div>
          </div>
          <BaseCard class="mt-5 w-full">
            <div class="p-5 grid gap-5 xs:gird-cols-1">
              <template
                v-for="(item, index) in activeTemplate?.options?.custom_fields"
                :key="key"
              >
                <template v-if="item.type === 'input'">
                  <BaseInput
                    v-model="formValues.custom_fields[index].value"
                    :error="
                      formErrors.custom_fields
                        ? formErrors.custom_fields[index]
                        : null
                    "
                    type="text"
                    :label="item.title"
                    :placeholder="`Enter your ${item.title}`"
                    shape="rounded"
                    class="w-full"
                    @input="
                      handleCustomFieldChange(
                        index,
                        formValues.custom_fields[index].value,
                      )
                    "
                  />
                </template>
                <template v-else-if="item.type === 'textarea'">
                  <BaseTextarea
                    v-model="formValues.custom_fields[index].value"
                    :error="
                      formErrors.custom_fields
                        ? formErrors.custom_fields[index]
                        : null
                    "
                    :label="item.title"
                    :placeholder="`Enter your ${item.title}`"
                    shape="rounded"
                    class="w-full"
                    @input="
                      handleCustomFieldChange(
                        index,
                        formValues.custom_fields[index].value,
                      )
                    "
                  />
                </template>
                <template v-else-if="item.type === 'file upload'">
                  <div
                    class="flex xs:flex-col sm:flex-row justify-between items-center gap-5"
                  >
                    <span class="w-full">
                      <label
                        for="ninja-input-6"
                        class="nui-label pb-1 text-[0.825rem]"
                        >{{ item.title }}</label
                      >
                      <BaseInputFileHeadless
                        v-model="item.value"
                        v-slot="{ open, remove, preview, drop, files }"
                      >
                        <div
                          class=""
                          @dragenter.stop.prevent
                          @dragover.stop.prevent
                          @drop="drop"
                        >
                          <div
                            v-if="!files?.length"
                            class="nui-focus border-muted-300 dark:border-muted-700 hover:border-muted-400 focus:border-muted-400 dark:hover:border-muted-600 dark:focus:border-muted-700 group cursor-pointer rounded-lg border-[3px] border-dashed transition-colors duration-300"
                            tabindex="0"
                            role="button"
                            @click="open"
                            @keydown.enter.prevent="open"
                          >
                            <div class="p-5 text-center">
                              <Icon
                                name="mdi-light:cloud-upload"
                                class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 mb-2 h-10 w-10 transition-colors duration-300"
                              />

                              <h4 class="text-muted-400 font-sans text-sm">
                                {{ $t('Drop file to upload') }}
                              </h4>

                              <div>
                                <span
                                  class="text-muted-400 font-sans text-[0.7rem] font-semibold uppercase"
                                >
                                  {{ $t('Or') }}
                                </span>
                              </div>

                              <label
                                for="file"
                                class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 cursor-pointer font-sans text-sm underline underline-offset-4 transition-colors duration-300"
                              >
                                {{ $t('Select Image') }}
                              </label>
                            </div>
                          </div>

                          <ul v-else class="mt-6 space-y-2">
                            <li v-for="file in files" :key="file.name">
                              <div
                                class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-end gap-2 rounded-xl border bg-white p-3"
                              >
                                <div class="flex items-center gap-2">
                                  <div class="shrink-0">
                                    <img
                                      class="h-14 w-14 rounded-xl object-cover object-center"
                                      v-if="file.type.startsWith('image')"
                                      :src="preview(file).value"
                                      alt="Image preview"
                                    />

                                    <img
                                      v-else
                                      class="h-14 w-14 rounded-xl object-cover object-center"
                                      src="/img/avatars/placeholder-file.png"
                                      alt="Image preview"
                                    />
                                  </div>

                                  <div class="font-sans">
                                    <span
                                      class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm"
                                    >
                                      {{ file.name }}
                                    </span>

                                    <span class="text-muted-400 block text-xs">
                                      {{ formatFileSize(file.size) }}
                                    </span>
                                  </div>
                                </div>

                                <div
                                  class="ms-auto w-32 px-4 transition-opacity duration-300"
                                  :class="'opacity-100'"
                                >
                                  <BaseProgress
                                    :value="0"
                                    size="xs"
                                    :color="'success'"
                                  />
                                </div>

                                <div class="flex gap-2">
                                  <button
                                    class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60"
                                    disabled
                                    type="button"
                                    tooltip="Cancel"
                                  >
                                    <Icon name="lucide:slash" class="h-4 w-4" />

                                    <span class="sr-only">Cancel</span>
                                  </button>

                                  <button
                                    class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                                    type="button"
                                    tooltip="Upload"
                                  >
                                    <Icon
                                      name="lucide:arrow-up"
                                      class="h-4 w-4"
                                    />

                                    <span class="sr-only">Upload</span>
                                  </button>

                                  <button
                                    class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                                    type="button"
                                    tooltip="Remove"
                                    @click.prevent="remove(file)"
                                  >
                                    <Icon name="lucide:x" class="h-4 w-4" />

                                    <span class="sr-only">Remove</span>
                                  </button>
                                </div>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </BaseInputFileHeadless></span
                    >
                    <div
                      class="mt-5 h-40 w-full flex items-center justify-center overflow-hidden rounded-xl"
                    >
                      <img
                        :key="previewUrls[item.title]"
                        v-if="previewUrls[item.title]"
                        :src="previewUrls[item.title]"
                        alt="Image Preview"
                        class="max-h-full max-w-full object-cover object-center rounded-xl"
                      />
                    </div>
                  </div>
                </template>
              </template>
            </div>
          </BaseCard>
        </div>
      </div>

      <div class="flex items-center justify-center mt-5">
        <BaseCard class="p-2 w-64">
          <BaseButton
            :disabled="isSubmitting"
            :loading="isSubmitting"
            :block="true"
            color="primary"
            type="submit"
            class="w-full"
          >
            Submit
          </BaseButton>
        </BaseCard>
      </div>
    </form>
  </TairoContentWrapper>
</template>
