<script setup lang="ts">
definePageMeta({
  title: 'KYC Application Details',
  permissions: ['Access KYC Application Details'],
})
const kyc = ref<any>(null)
const { getKyc, updateKycStatus } = useKyc()
const route = useRoute()
const router = useRouter()
const isRejectOpen = ref(false)
const isApproveOpen = ref(false)
const { toast, formatedDate } = useUtils()
const kycId = computed(() => route.params.id)
const rejectionMessage = ref(
  'We are sorry, your kyc has been rejected. Please contact support for more information. \n\nRejection reason goes here.  \n\nThank you.',
)
const kycDetails = computed(() => kyc.value?.data)

onMounted(async () => {
  try {
    const response = await getKyc(kycId.value)
    kyc.value = response.data.result
  } catch (error) {
    router.back()
    toast.danger(error as any)
  }
})

const updateKyc = async (status: string, message?: string) => {
  try {
    const response = await updateKycStatus(kycId.value, status, message)

    kyc.value.status = response.data.result.status
    kyc.value.notes = response.data.result.notes
    toast.response(response)
  } catch (error) {
    toast.danger(error as any)
  }
  if (status === 'REJECTED') {
    isRejectOpen.value = false
  }
  if (status === 'APPROVED') {
    isApproveOpen.value = false
  }
}

const status = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'success'
    case 'PENDING':
      return 'warning'
    case 'REJECTED':
      return 'danger'
    default:
      return 'info'
  }
}

const levelClass = (type: number) => {
  switch (type) {
    case 1:
      return 'info'
    case 2:
      return 'primary'
    case 3:
      return 'success'
    default:
      return 'info'
  }
}

const documentType = computed(() => {
  if (kycDetails.value) {
    if (kycDetails.value.document_passport) {
      return 'Passport'
    }
    if (kycDetails.value.document_drivers_license) {
      return "Driver's License"
    }
    if (kycDetails.value.document_id_card) {
      return 'ID Card'
    }
  }
})

const currentImage = ref<string | null>(null)
const isLightboxOpen = ref<boolean>(false)

function openLightbox(image: string) {
  currentImage.value = image
  isLightboxOpen.value = true
}

function closeLightbox() {
  isLightboxOpen.value = false
}
</script>

<template>
  <TairoContentWrapper class="mb-20">
    <template #right>
      <BaseButton @click="router.back()" color="muted">
        <Icon name="line-md:chevron-left" class="mr-2" /> {{ $t('Back') }}
      </BaseButton>
    </template>
    <BaseCard class="px-8 pt-8 pb-4 mx-auto">
      <!-- Header Section -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          {{ $t('KYC Application Details') }}
        </h1>
        <div class="flex items-center xs:flex-col sm:flex-row gap-2">
          <BaseTag
            shape="rounded"
            :color="status(kyc?.status)"
            flavor="pastel"
            class="dark:bg-opacity-80"
            >{{ kyc?.status }}</BaseTag
          >
          <BaseTag
            shape="rounded"
            :color="levelClass(kyc?.level)"
            class="dark:bg-opacity-80"
            >{{ $t('Level') }} {{ kyc?.level }}</BaseTag
          >
        </div>
      </div>

      <!-- Details Section -->
      <div
        v-if="kycDetails"
        class="p-4 border rounded-md dark:border-gray-600 mb-6"
      >
        <h2 class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
          {{ $t('General Details') }}:
        </h2>
        <div class="grid gap-5 xs:grid-cols-1 sm:grid-cols-2">
          <div class="text-sm">
            <strong>{{ $t('First Name') }}:</strong> {{ kycDetails.first_name
            }}<br />
            <strong>{{ $t('Last Name') }}:</strong> {{ kycDetails.last_name
            }}<br />
            <strong>{{ $t('Email') }}:</strong> {{ kycDetails.email }}<br />
            <strong>{{ $t('Phone') }}:</strong> {{ kycDetails.phone }}<br />
            <strong>{{ $t('Date of Birth') }}:</strong> {{ kycDetails.dob
            }}<br />
            <strong>{{ $t('Social Security Number') }}:</strong>
            {{ kycDetails.ssn }}<br />
          </div>
          <div class="text-sm">
            <strong>{{ $t('Address') }}:</strong> {{ kycDetails.address }}<br />
            <strong>{{ $t('City') }}:</strong> {{ kycDetails.city }}<br />
            <strong>{{ $t('State') }}:</strong> {{ kycDetails.state }}<br />
            <strong>{{ $t('Country') }}:</strong> {{ kycDetails.country }}<br />
            <strong>{{ $t('ZIP') }}:</strong> {{ kycDetails.zip }}<br />
          </div>
        </div>
      </div>

      <div
        v-if="kycDetails"
        class="p-4 border rounded-md dark:border-gray-600 mb-6"
      >
        <!-- Document Grid -->
        <h3 class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
          {{ $t('Uploaded Document') }}: {{ documentType }}
        </h3>

        <div v-if="kycDetails.document_passport">
          <div>
            <strong>{{ $t('Passport Documents') }}</strong>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <div>{{ $t('Front') }}:</div>
              <div class="image-container">
                <img
                  loading="lazy"
                  :src="
                    kycDetails?.documents?.document_passport?.front ||
                    '/img/placeholder.png'
                  "
                  alt="Front Document"
                  class="dark:bg-muted-800 rounded-2xl bg-white p-1"
                  @click="
                    openLightbox(
                      kycDetails?.documents?.document_passport?.front,
                    )
                  "
                  height="180"
                />
                <div
                  class="overlay"
                  @click="
                    openLightbox(
                      kycDetails?.documents?.document_passport?.front,
                    )
                  "
                >
                  <Icon name="lucide:zoom-in" class="h-5 w-5 zoom-icon" />
                </div>
              </div>
            </div>
            <div>
              <div>{{ $t('Selfie') }}:</div>
              <div class="image-container">
                <img
                  loading="lazy"
                  :src="
                    kycDetails?.documents?.document_passport?.selfie ||
                    '/img/placeholder.png'
                  "
                  alt="Selfie Document"
                  class="dark:bg-muted-800 rounded-2xl bg-white p-1"
                  @click="
                    openLightbox(
                      kycDetails?.documents?.document_passport?.selfie,
                    )
                  "
                  height="180"
                />
                <div
                  class="overlay"
                  @click="
                    openLightbox(
                      kycDetails?.documents?.document_passport?.selfie,
                    )
                  "
                >
                  <Icon name="lucide:zoom-in" class="h-5 w-5 zoom-icon" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="kycDetails.document_drivers_license">
          <div>
            <strong>{{ $t('Driver License Documents') }}</strong>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <div>{{ $t('Front') }}:</div>
              <div class="image-container">
                <img
                  loading="lazy"
                  :src="
                    kycDetails?.documents?.document_drivers_license?.front ||
                    '/img/placeholder.png'
                  "
                  alt="Front Document"
                  class="dark:bg-muted-800 rounded-2xl bg-white p-1"
                  @click="
                    openLightbox(
                      kycDetails?.documents?.document_drivers_license?.front,
                    )
                  "
                  height="180"
                />
                <div
                  class="overlay"
                  @click="
                    openLightbox(
                      kycDetails?.documents?.document_drivers_license?.front,
                    )
                  "
                >
                  <Icon name="lucide:zoom-in" class="h-5 w-5 zoom-icon" />
                </div>
              </div>
            </div>
            <div>
              <div>{{ $t('Selfie') }}:</div>
              <div class="image-container">
                <img
                  loading="lazy"
                  :src="
                    kycDetails?.documents?.document_drivers_license?.selfie ||
                    '/img/placeholder.png'
                  "
                  alt="Selfie Document"
                  class="dark:bg-muted-800 rounded-2xl bg-white p-1"
                  @click="
                    openLightbox(
                      kycDetails?.documents?.document_drivers_license?.selfie,
                    )
                  "
                  height="180"
                />
                <div
                  class="overlay"
                  @click="
                    openLightbox(
                      kycDetails?.documents?.document_drivers_license?.selfie,
                    )
                  "
                >
                  <Icon name="lucide:zoom-in" class="h-5 w-5 zoom-icon" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="kycDetails.document_id_card">
          <div>
            <strong>{{ $t('National ID Documents') }}</strong>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <div>{{ $t('Front') }}:</div>
              <div class="image-container">
                <img
                  loading="lazy"
                  :src="
                    kycDetails?.documents?.document_id_card?.front ||
                    '/img/placeholder.png'
                  "
                  alt="Front Document"
                  class="dark:bg-muted-800 rounded-2xl bg-white p-1"
                  @click="
                    openLightbox(kycDetails?.documents?.document_id_card?.front)
                  "
                  height="180"
                />
                <div
                  class="overlay"
                  @click="
                    openLightbox(kycDetails?.documents?.document_id_card?.front)
                  "
                >
                  <Icon name="lucide:zoom-in" class="h-5 w-5 zoom-icon" />
                </div>
              </div>
            </div>
            <div>
              <div>{{ $t('Back') }}:</div>
              <div class="image-container">
                <img
                  loading="lazy"
                  :src="
                    kycDetails?.documents?.document_id_card?.back ||
                    '/img/placeholder.png'
                  "
                  alt="Back Document"
                  class="dark:bg-muted-800 rounded-2xl bg-white p-1"
                  @click="
                    openLightbox(kycDetails?.documents?.document_id_card?.back)
                  "
                  height="180"
                />
                <div
                  class="overlay"
                  @click="
                    openLightbox(kycDetails?.documents?.document_id_card?.back)
                  "
                >
                  <Icon name="lucide:zoom-in" class="h-5 w-5 zoom-icon" />
                </div>
              </div>
            </div>
            <div>
              <div>{{ $t('Selfie') }}:</div>
              <div class="image-container">
                <img
                  loading="lazy"
                  :src="
                    kycDetails?.documents?.document_id_card?.selfie ||
                    '/img/placeholder.png'
                  "
                  alt="Selfie Document"
                  class="dark:bg-muted-800 rounded-2xl bg-white p-1"
                  @click="
                    openLightbox(
                      kycDetails?.documents?.document_id_card?.selfie,
                    )
                  "
                  height="180"
                />
                <div
                  class="overlay"
                  @click="
                    openLightbox(
                      kycDetails?.documents?.document_id_card?.selfie,
                    )
                  "
                >
                  <Icon name="lucide:zoom-in" class="h-5 w-5 zoom-icon" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="kycDetails"
        class="p-4 border rounded-md dark:border-gray-600 mb-6"
      >
        <!-- Custom Fields -->
        <h3 class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
          {{ $t('Custom Fields') }}:
        </h3>
        <div class="grid gap-5 grid-cols-3">
          <template
            v-for="(field, index) in kycDetails.custom_fields"
            :key="index"
          >
            <div v-if="field.type === 'input' || field.type === 'textarea'">
              <strong>{{ field.title }}:</strong> {{ field.value }}
            </div>
            <div v-else-if="field.type === 'file upload'">
              <div>
                <strong>{{ field.title }}:</strong>
              </div>
              <div class="image-container">
                <img
                  loading="lazy"
                  :src="field.value || '/img/placeholder.png'"
                  alt="Custom Document"
                  class="dark:bg-muted-800 rounded-2xl bg-white p-1"
                  @click="openLightbox(field.value)"
                  height="180"
                />
                <div class="overlay" @click="openLightbox(field.value)">
                  <Icon name="lucide:zoom-in" class="h-5 w-5 zoom-icon" />
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- User & Date Information -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-gray-700 dark:text-gray-400"
      >
        <div class="p-4 border rounded-md dark:border-gray-600">
          <div class="flex jsutify-start items-center">
            <img
              :src="kyc?.user?.avatar || '/img/avatars/placeholder-file.png'"
              class="mr-2 h-16 w-16 rounded-full"
            />
            <div>
              <div class="font-bold">
                {{ kyc?.user?.first_name }}
                {{ kyc?.user?.last_name }}
              </div>
              <div>
                {{ kyc?.user?.uuid }}
              </div>
            </div>
          </div>
        </div>
        <div class="p-4 border rounded-md dark:border-gray-600">
          <h2
            class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200"
          >
            {{ $t('Date') }}:
          </h2>
          <p>
            {{ formatedDate(kyc?.created_at, true) }}
          </p>
        </div>
      </div>

      <!-- Rejection Notes Section -->
      <div
        v-if="kyc?.notes && kyc?.status === 'REJECTED'"
        class="p-4 border rounded-md dark:border-gray-600 mb-6"
      >
        <h2 class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
          {{ $t('Notes') }}:
        </h2>
        <p v-html="kyc?.notes.replace(/\n/g, '<br />')"></p>
      </div>

      <!-- Approve Kyc Button -->
      <div
        v-if="kyc?.status === 'PENDING'"
        class="w-full flex gap-2 xs:flex-col sm:flex-row mb-2"
      >
        <BaseButton
          @click="isApproveOpen = true"
          color="success"
          class="w-full"
        >
          {{ $t('Approve Kyc') }}
        </BaseButton>
        <BaseButton @click="isRejectOpen = true" color="danger" class="w-full">
          {{ $t('Reject Kyc') }}
        </BaseButton>
      </div>
    </BaseCard>
    <TairoModal
      :open="isApproveOpen"
      size="lg"
      @close="() => (isApproveOpen = false)"
    >
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Approve Kyc') }}
          </h3>
          <BaseButtonClose @click="isApproveOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <p>
            {{
              $t(
                'Are you sure you want to approve this kyc? This action cannot be undone',
              )
            }}.
          </p>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isApproveOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="success"
              flavor="solid"
              @click="updateKyc('APPROVED')"
            >
              {{ $t('Approve') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
    <TairoModal
      :open="isRejectOpen"
      size="lg"
      @close="() => (isRejectOpen = false)"
    >
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Reject Kyc') }}
          </h3>
          <BaseButtonClose @click="isRejectOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <BaseTextarea
            v-model="rejectionMessage"
            type="text"
            rows="10"
            label="Please provide a reason for rejection."
            placeholder="Enter rejection reason"
            shape="curved"
            :classes="{ input: 'h-12' }"
          />
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isRejectOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="danger"
              flavor="solid"
              @click="updateKyc('REJECTED', rejectionMessage)"
            >
              {{ $t('Reject') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
    <VueEasyLightbox
      :visible="isLightboxOpen"
      :imgs="[currentImage]"
      @hide="closeLightbox"
    ></VueEasyLightbox>
  </TairoContentWrapper>
</template>

<style scoped>
.image-container {
  position: relative;
  display: inline-block;
}

.image-container:hover .overlay {
  opacity: 1;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
}

.zoom-icon {
  font-size: 2rem;
  color: white;
}
</style>
