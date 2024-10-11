<script setup lang="ts">
definePageMeta({
  title: 'Extension Details',
  permissions: ['Access Extension Details'],
})
const updateData = ref({
  status: false,
  version: '',
  release_date: '',
  summery: '',
  changelog: null,
  update_id: '',
  message: '',
})
const extensionStore = useExtensionStore()
const route = useRoute()
const extension = computed(() => {
  return extensionStore.selectedExtension
})
const purchaseCode = ref('')
const envatoUsername = ref('')
const isSubmitting = ref(false)
const isVerifying = ref(false)
const isUpdating = ref(false)
const activateModel = ref(false)
const licenseStatus = ref(false)
const checkingUpdate = ref(true)
const {
  activateLicense,
  checkUpdate,
  downloadUpdate,
  verifyLicense,
  updateExtensionStatus,
} = useSystem()
const { toast } = useUtils()

const updateSystem = async () => {
  isUpdating.value = true
  try {
    const response = await downloadUpdate(
      extension.value?.product_id,
      updateData.value.update_id,
      updateData.value.version,
      extension.value?.name,
      'extension',
    )

    toast.response(response)
    if (response.status === 'success') {
      extensionStore.selectedExtension.version = updateData.value.version
      await checkForUpdates()
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isUpdating.value = false
}

const checkForUpdates = async () => {
  try {
    const response = await checkUpdate(
      extension.value?.product_id,
      extension.value?.version,
    )
    updateData.value = response.data.result
    updateData.value.message = response.data.message
  } catch (error) {
    toast.danger(error as any)
  }
  checkingUpdate.value = false
}

onMounted(async () => {
  if (extensionStore.extensions.length === 0) {
    await extensionStore.fetchExtensions()
  }
  extensionStore.getExtensionById(route.params.id)

  try {
    await reVerifyLicense()
  } catch (error) {
    toast.danger(error as any)
  }
})

const reVerifyLicense = async () => {
  isVerifying.value = true

  try {
    const response = await verifyLicense(extension.value?.product_id)

    licenseStatus.value = response.status === 'success'
    activateModel.value = !licenseStatus.value
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
      extension.value?.product_id,
      purchaseCode.value,
      envatoUsername.value,
    )
    toast.response(response)
    if (response.status === 'success') {
      licenseStatus.value = true
      activateModel.value = false
    }
  } catch (error) {
    toast.danger(error as any)
  }

  isSubmitting.value = false
}

const updateExtensionStatusAction = async () => {
  isSubmitting.value = true
  try {
    const newStatus = extension.value?.status === true ? false : true
    const response = await updateExtensionStatus(
      extension.value?.product_id,
      newStatus,
    )
    toast.response(response)
    if (response.status === 'success') {
      extensionStore.selectedExtension.status = newStatus
    }
  } catch (error) {
    console.log(error)
    toast.danger(error as any)
  }

  isSubmitting.value = false
}
</script>

<template>
  <div>
    <template v-if="activateModel">
      <div
        v-if="isVerifying"
        class="h-[calc(80vh)] flex justify-center items-center"
      >
        <div class="my-auto text-center flex-col justify-center space-y-5">
          <BaseIconBox size="2xl" shape="full" color="primary">
            <Icon name="svg-spinners:blocks-shuffle-3" class="h-12 w-12" />
          </BaseIconBox>
          <h1 class="text-2xl font-bold">
            {{ $t('Verifying your purchase code') }}...
          </h1>
          <p>{{ $t('Please wait while we verify your purchase code') }}.</p>
        </div>
      </div>
      <div v-else class="mx-auto w-full max-w-5xl flex-col px-4 text-start">
        <BaseHeading class="text-center">
          {{ $t('Activate') }} {{ extension?.title }} {{ $t('purchase code') }}
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
              <span>{{ $t('Activate') }}</span>
            </BaseButton>
          </div>
        </BaseCard>
      </div></template
    >
    <template v-else>
      <div
        v-if="checkingUpdate"
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
        <template #left>
          <BaseHeading class="text-center">
            {{ extension?.title }} {{ $t('Extension') }}
          </BaseHeading>
        </template>
        <template #right>
          <div class="flex items-center justify-end space-x-5">
            <BaseButton color="muted" to="/admin/system/extensions">
              <Icon name="line-md:chevron-left" class="h-4 w-4 mr-1" />
              {{ $t('Back') }}
            </BaseButton>
            <BaseButton
              v-if="!licenseStatus"
              color="primary"
              @click="activateModel = true"
            >
              {{ $t('Activate Purchase Code') }}
            </BaseButton>
            <BaseButton
              :color="extension?.status ? 'danger' : 'success'"
              @click="updateExtensionStatusAction()"
              :loading="isSubmitting"
            >
              <Icon
                :name="extension?.status ? 'line-md:close' : 'line-md:confirm'"
                class="h-4 w-4 mr-1"
              />
              {{ extension?.status ? $t('Deactivate') : $t('Activate') }}
            </BaseButton>
          </div>
        </template>

        <div class="text-start mx-auto max-w-2xl space-y-5 mb-20">
          <BaseMessage
            v-if="updateData.status && extension?.version !== '0.0.1'"
            type="info"
            icon
            >{{
              $t(
                'Please backup your database and script files before upgrading',
              )
            }}.</BaseMessage
          >
          <BaseMessage>{{ updateData.message }}</BaseMessage>
          <div v-if="updateData.status" class="space-y-5">
            <BaseCard
              class="p-5 space-y-5"
              v-if="extension?.version !== '0.0.1'"
            >
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
              :color="licenseStatus ? 'success' : 'danger'"
              class="w-full"
              type="submit"
              :disabled="
                !licenseStatus || updateData.update_id === '' || isUpdating
              "
              :loading="isUpdating"
            >
              {{
                licenseStatus
                  ? extension?.version === '0.0.1'
                    ? 'Install'
                    : 'Update'
                  : 'Invalid Purchase Code'
              }}
            </BaseButton>
          </div>
        </div>
      </TairoContentWrapper></template
    >
  </div>
</template>
