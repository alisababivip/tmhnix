<script setup lang="ts">
definePageMeta({
  title: 'Exchange Wizard — Step 2',
})
const router = useRouter()
const { data: project } = useMultiStepForm()
if (!project.value.exchange) {
  router.push('/admin/exchange/wizard')
}

const purchaseCode = ref('')
const envatoUsername = ref('')
const licenseAlert = ref<string | null>(null)
const licenseVerified = ref(false)
const isSubmitting = ref(false)

onMounted(async () => {
  if (project.value.licenseStatus) {
    await reVerifyLicense()
  }
})

const { activateExchangeLicense } = useSystem()
const apiPath = useRuntimeConfig().public.apiPath

const verifyLicenseCommon = async (payload) => {
  project.value.loading = true
  try {
    const response = await $fetch(
      apiPath + `/api/exchange/settings/verify/license`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: JSON.stringify(payload),
      },
    )
    if (response.status === 'success') {
      project.value.licenseStatus = true
      licenseVerified.value = true
      licenseAlert.value = response.data.message
    } else {
      project.value.licenseStatus = false
      licenseVerified.value = false
      licenseAlert.value = response.error.message
    }
  } catch (error) {
    project.value.licenseStatus = false
  }
  project.value.loading = false
}

const reVerifyLicense = async () => {
  const payload = {
    productId: project.value.productId,
  }
  await verifyLicenseCommon(payload)
}

const verifyLicenseAction = async () => {
  const payload = {
    productId: project.value.productId,
    purchaseCode: purchaseCode.value,
    envatoUsername: project.value.username,
  }
  await verifyLicenseCommon(payload)
}

const activateLicenseAction = async () => {
  isSubmitting.value = true
  try {
    const response = await activateExchangeLicense(
      project.value.productId,
      purchaseCode.value,
      envatoUsername.value,
    )
    if (response.status === 'success') {
      project.value.licenseStatus = true
      licenseVerified.value = true
      licenseAlert.value = response.data.message
    } else {
      project.value.licenseStatus = false
      licenseVerified.value = false
      licenseAlert.value = response.error.message
    }
  } catch (error) {
    project.value.licenseStatus = false
    licenseVerified.value = false
    licenseAlert.value = 'License verification failed!'
  }
  isSubmitting.value = false
}

const shouldVerify = computed(() => {
  return (
    project.value.licenseStatus === true &&
    project.value.exchange === project.value.activeExchange
  )
})
</script>

<template>
  <div>
    <WizardStepTitle />
    <div v-if="licenseAlert" class="mt-4 flex justify-center">
      <BaseMessage :type="licenseVerified ? 'success' : 'danger'">
        {{ licenseAlert }}
      </BaseMessage>
    </div>
    <div
      v-if="!licenseVerified"
      class="mx-auto w-full max-w-5xl flex-col px-4 text-center"
    >
      <BaseCard class="mt-8 p-5 max-w-md mx-auto">
        <BaseInput
          v-model="purchaseCode"
          type="text"
          label="Purchase Code"
          placeholder="Enter your purchase code"
        />
        <BaseInput
          v-if="!shouldVerify"
          v-model="envatoUsername"
          type="text"
          label="Envato Username"
          placeholder="Enter your Envato username"
        />
        <div class="mt-8">
          <BaseButton
            :color="shouldVerify ? 'success' : 'primary'"
            class="w-full"
            @click="
              shouldVerify ? verifyLicenseAction() : activateLicenseAction()
            "
            :disabled="isSubmitting"
            :loading="isSubmitting"
          >
            <span
              >{{ shouldVerify ? 'Verify' : 'Activate' }}
              {{ $t('License') }}</span
            >
          </BaseButton>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
