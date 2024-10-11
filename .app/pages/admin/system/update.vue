<script setup lang="ts">
definePageMeta({
  title: 'System Update',
  permissions: ['Access System Update'],
})
const updateData = ref({
  status: false,
  message: '',
  changelog: null,
  update_id: '',
  version: '',
})
const purchaseCode = ref('')
const envatoUsername = ref('')
const productId = ref('')
const productName = ref('bicrypto')
const productVersion = ref('')
const licenseVerified = ref(false)
const isSubmitting = ref(false)
const isVerifying = ref(false)
const {
  activateLicense,
  checkUpdate,
  downloadUpdate,
  getProduct,
  verifyLicense,
} = useSystem()
const isLoading = ref(false)
const { toast } = useUtils()

const updateSystem = async () => {
  try {
    const response = await downloadUpdate(
      productId.value,
      updateData.value.update_id,
      updateData.value.version,
      productName.value,
    )
    productVersion.value = updateData.value.version
    toast.response(response)
    await checkForUpdates()
  } catch (error) {
    toast.danger(error as any)
  }
}

const checkForUpdates = async () => {
  isLoading.value = true
  try {
    const response = await checkUpdate(productId.value, productVersion.value)
    updateData.value = response.data.result
    updateData.value.message = response.data.message
  } catch (error) {
    toast.danger(error as any)
  }
  isLoading.value = false
}
onMounted(async () => {
  const response = await getProduct(productName.value)
  productId.value = response.data.result.id
  productVersion.value = response.data.result.version
  await reVerifyLicense()
})

const reVerifyLicense = async () => {
  isVerifying.value = true

  try {
    const response = await verifyLicense(productId.value)
    licenseVerified.value = response.status === 'success'
    await checkForUpdates()
  } catch (error) {
    toast.danger(error as any)
  }

  isVerifying.value = false
}

const activateLicenseAction = async () => {
  isSubmitting.value = true
  try {
    const response = await activateLicense(
      productId.value,
      purchaseCode.value,
      envatoUsername.value,
    )

    licenseVerified.value = response.status === 'success'
    toast.response(response)
  } catch (error) {
    toast.danger(error as any)
  }

  isSubmitting.value = false
}
</script>

<template>
  <div>
    <template v-if="!licenseVerified">
      <div
        v-if="isVerifying"
        class="h-[calc(80vh)] flex justify-center items-center"
      >
        <div class="my-auto text-center flex-col justify-center space-y-5">
          <BaseIconBox size="2xl" shape="full" color="primary">
            <Icon name="svg-spinners:blocks-shuffle-3" class="h-12 w-12" />
          </BaseIconBox>
          <h1 class="text-2xl font-bold">
            {{ $t('Verifying your license') }}...
          </h1>
          <p>{{ $t('Please wait while we verify your license') }}.</p>
        </div>
      </div>
      <div v-else class="mx-auto w-full max-w-5xl flex-col px-4 text-start">
        <BaseHeading class="text-center">
          {{ $t('Verify your license') }}
        </BaseHeading>
        <BaseCard class="mt-8 p-5 max-w-md mx-auto space-y-5">
          <BaseInput
            v-model="purchaseCode"
            type="text"
            label="Purchase Code"
            placeholder="Enter your purchase code"
          />
          <BaseInput
            v-model="envatoUsername"
            type="text"
            label="Envato Username"
            placeholder="Enter your Envato username"
          />
          <div class="mt-8">
            <BaseButton
              color="primary"
              class="w-full"
              @click="activateLicenseAction()"
              :disabled="isSubmitting"
              :loading="isSubmitting"
            >
              <span>{{ $t('Activate License') }}</span>
            </BaseButton>
          </div>
        </BaseCard>
      </div></template
    >
    <template v-else>
      <div
        v-if="isLoading"
        class="h-[calc(80vh)] flex justify-center items-center"
      >
        <div class="my-auto text-center flex-col justify-center space-y-5">
          <BaseIconBox size="2xl" shape="full" color="info">
            <Icon name="svg-spinners:blocks-shuffle-3" class="h-12 w-12" />
          </BaseIconBox>
          <h1 class="text-2xl font-bold">
            {{ $t('Checking for updates') }}...
          </h1>
          <p>{{ $t('Please wait while we check for updates') }}.</p>
        </div>
      </div>
      <TairoContentWrapper v-else>
        <div class="text-start mx-auto max-w-2xl space-y-5 mb-20">
          <BaseMessage v-if="updateData.status" type="info" icon
            >{{
              $t(
                'Please backup your database and script files before upgrading',
              )
            }}.</BaseMessage
          >
          <BaseMessage>{{ updateData.message }}</BaseMessage>
          <div v-if="updateData.status" class="space-y-5">
            <BaseCard class="p-5 space-y-5">
              <span
                class="text-gray-800 dark:text-gray-200 font-semibold text-lg"
              >
                {{ $t('Update Notes') }}
              </span>
              <div
                class="pl-5 post-body changelog text-start"
                v-html="updateData.changelog"
              ></div>
            </BaseCard>
            <BaseButton
              @click="updateSystem"
              color="success"
              class="w-full"
              type="submit"
              :disabled="updateData.update_id === ''"
            >
              {{ 'Update' }}
            </BaseButton>
          </div>
        </div>
      </TairoContentWrapper></template
    >
  </div>
</template>
