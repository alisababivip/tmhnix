<script setup lang="ts">
import type { KycTemplate } from '~~/types'

const props = defineProps({
  flutter: {
    type: Boolean,
    default: false,
  },
})
const userStore = useUserStore()
const user = computed(() => userStore.getProfile)
const { getActiveKycTemplate } = useKyc()
const activeTemplate = ref<KycTemplate | null>(null)

const lastLevel = ref<number>(0)
const level = computed(() => parseInt(user.value?.kyc?.level) || 0)

const kycDesc = computed(() =>
  user.value?.kyc?.length > 0
    ? 'Verify your identity to participate in our platform.'
    : 'To comply with regulations, each participant is required to go through identity verification (KYC/AML) to prevent fraud, money laundering operations, transactions banned under the sanctions regime, or those which fund terrorism. Please complete our fast and secure verification process to participate in our platform.',
)

const getKycApplicationRoute = (state: string) =>
  `/user/${props.flutter ? 'flutter/' : ''}kyc/application?state=${state}&l=${
    level.value + (state === 'new' ? 1 : 0)
  }`

const statusClassMap = {
  APPROVED:
    'text-success-700 bg-success-100 border border-success-300 rounded-lg dark:bg-gray-800 dark:border-success-800 dark:text-success-400',
  PENDING:
    'text-info-700 bg-info-100 border border-info-300 rounded-lg dark:bg-gray-800 dark:border-info-800 dark:text-info-400',
  REJECTED:
    'text-danger-700 bg-danger-100 border border-danger-300 rounded-lg dark:bg-gray-800 dark:border-danger-800 dark:text-danger-400',
  MUTED:
    'text-gray-900 bg-gray-100 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400',
}

const statusClass = computed(() => {
  const status = user.value?.kyc?.status
  return statusClassMap[status] || statusClassMap['MUTED']
})

const levelMap = {
  0: 'Verified',
  1: 'Verified Plus',
  2: 'Verified Pro',
  3: 'Verified Business',
}

const verificationLevel = computed(() => {
  return levelMap[level.value] || 'Verified'
})

const updateLastLevel = (fields) => {
  for (const key in fields) {
    if (
      activeTemplate.value?.options.hasOwnProperty(key) &&
      parseInt(activeTemplate.value?.options[key].level) > lastLevel.value
    ) {
      lastLevel.value = parseInt(activeTemplate.value?.options[key].level)
    }
  }
}

const router = useRouter()
const { toast } = useUtils()
onMounted(async () => {
  try {
    await userStore.fetchProfile()
    const response = await getActiveKycTemplate()
    if (response.data?.result && response.data?.result?.id) {
      activeTemplate.value = response.data.result
      const { options } = activeTemplate.value
      if (options) {
        updateLastLevel(options)

        // Search in custom_fields inside options
        if (options.custom_fields) {
          updateLastLevel(options.custom_fields)
        }
      }
    } else {
      toast.warning('KYC system under maintenance. Please try again later.')
      router.push('/user')
    }
  } catch (error) {
    console.error(error)
  }
})

const statusIcon = computed(() => {
  switch (user.value?.kyc?.status) {
    case 'APPROVED':
      return 'line-md:confirm'
    case 'PENDING':
      return 'line-md:loading-alt-loop'
    case 'REJECTED':
      return 'line-md:close'
    default:
      return ''
  }
})

const computedLevels = computed(() => {
  const levels = []
  for (let i = 1; i <= lastLevel.value; i++) {
    let item = {
      id: i,
      level: i,
      name: ['Verified', 'Verified Plus', 'Verified Pro'][i - 1],
      cssClass:
        level.value >= i
          ? level.value === i
            ? statusClass.value
            : statusClassMap['APPROVED']
          : statusClassMap['MUTED'],
      icon:
        level.value >= i
          ? level.value === i
            ? statusIcon.value
            : 'line-md:confirm'
          : '',
      showStatus: level.value >= i,
    }
    levels.push(item)
  }
  return levels
})
</script>

<template>
  <div class="mx-auto">
    <TairoContentWrapper>
      <template #left>
        <h4 class="text-xl font-medium">
          {{ $t('Identity Verification Center') }}
        </h4></template
      >
      <template #right>
        <BaseButton to="/user" color="muted" v-if="!flutter">
          <Icon name="line-md:chevron-left" class="mr-2" />
          {{ $t('Back') }}
        </BaseButton>
      </template>
      <div class="grid gap-5 xs:grid-cols-1 md:grid-cols-3">
        <div
          class="xs:col-span-1 md:col-span-2 md:border-r border-gray-400 dark:border-gray-600 md:pr-5"
        >
          <div class="text-gray-800 dark:text-gray-200 py-5">
            <p class="large">{{ kycDesc }}</p>
          </div>
          <div class="mx-auto">
            <!-- IF NOT SUBMITTED -->
            <BaseCard
              v-if="
                !user?.kyc || (level === 0 && user?.kyc?.status !== 'PENDING')
              "
              class="px-5 py-10 text-center border-muted-500 rounded"
            >
              <div class="flex flex-col jsutify-center items-center">
                <BaseIconBox
                  size="2xl"
                  shape="full"
                  class="bg-gray-200 text-gray-600 dark:text-gray-300 dark:bg-gray-700"
                >
                  <Icon name="system-uicons:files-multi" class="h-10 w-10" />
                </BaseIconBox>
                <span
                  class="text-gray-700 dark:text-gray-300 text-2xl font-medium my-5"
                  >{{
                    $t(
                      'You have not submitted your necessary documents to verify your identity.',
                    )
                  }}{{
                    $t(
                      ' In order to trade in our platform, please verify your identity.',
                    )
                  }}</span
                >
                <p class="px-md-5">
                  {{
                    $t(
                      'It would be great if you could submit the form. If you have any questions, please feel free to contact our support team.',
                    )
                  }}
                </p>
                <BaseButton
                  :to="getKycApplicationRoute('new')"
                  color="primary"
                  class="mt-5"
                  >{{ $t('Click here to complete your KYC') }}
                </BaseButton>
              </div>
            </BaseCard>
            <!-- IF PENDING -->
            <BaseCard
              v-else-if="user?.kyc?.status === 'PENDING'"
              class="px-5 py-10 text-center border-info rounded flex items-center"
            >
              <div class="flex flex-col jsutify-center items-center">
                <BaseIconBox
                  size="2xl"
                  shape="full"
                  color="info"
                  flavor="pastel"
                  class="mb-5"
                >
                  <Icon name="line-md:loading-alt-loop" class="h-16 w-16" />
                </BaseIconBox>
                <span class="text-info-500 text-2xl font-medium mb-5">{{
                  $t('Your identity verification is processing.')
                }}</span>
                <p class="px-md-5">
                  {{
                    $t(
                      'We are still working on your identity verification. Once our team verifies your identity, you will be notified by email.',
                    )
                  }}
                </p>
              </div>
            </BaseCard>
            <!-- IF REJECTED -->
            <BaseCard
              v-else-if="user?.kyc?.status === 'REJECTED'"
              class="px-5 py-10 text-center border-warning rounded"
            >
              <div class="flex flex-col jsutify-center items-center">
                <BaseIconBox
                  size="2xl"
                  shape="full"
                  color="danger"
                  flavor="pastel"
                  class="mb-5"
                >
                  <Icon name="line-md:alert" class="h-12 w-12" />
                </BaseIconBox>
                <span class="text-danger-500 text-2xl font-medium mb-5">
                  {{ $t('Sorry! Your application was rejected.') }}
                </span>
                <p class="">
                  {{
                    $t(
                      'In our verification process, we found information that is incorrect or missing. Please resubmit the form. In case of any issues with the submission, please contact our support team.',
                    )
                  }}
                </p>
                <BaseButton
                  :to="getKycApplicationRoute('resubmit')"
                  color="primary"
                  class="mt-5"
                  >{{ $t('Submit Again') }}
                </BaseButton>
              </div>
            </BaseCard>
            <!-- IF VERIFIED -->
            <BaseCard
              v-else-if="user?.kyc?.status === 'APPROVED'"
              class="px-5 py-10 text-center border-success rounded"
            >
              <div class="flex flex-col jsutify-center items-center">
                <BaseIconBox
                  size="2xl"
                  shape="full"
                  color="success"
                  flavor="pastel"
                  class="mb-5"
                >
                  <Icon
                    name="fluent:shield-task-28-regular"
                    class="h-16 w-16"
                  />
                </BaseIconBox>
                <span class="text-success-500 text-2xl font-medium mb-5">{{
                  $t('Your identity has been verified successfully.')
                }}</span>
                <p class="px-md-5">
                  {{
                    $t(
                      'One of our team members has verified your identity. Now you can participate in our platform. Thank you.',
                    )
                  }}
                </p>
                <BaseButton
                  v-if="lastLevel > level"
                  :to="`/user/${
                    flutter ? 'flutter/' : ''
                  }kyc/application?state=new&l=${level + 1}`"
                  color="primary"
                  class="mt-5"
                  >{{ $t('Get') + ' ' + verificationLevel }}
                </BaseButton>
              </div>
            </BaseCard>
          </div>
        </div>
        <div>
          <h4 class="mt-4 mb-2 text-lg">
            {{ $t('Verification Levels') }}
          </h4>
          <ul class="space-y-4">
            <li v-for="item in computedLevels" :key="item.id">
              <BaseCard class="w-full p-4" :class="item.cssClass" role="alert">
                <div class="flex items-center justify-between">
                  <h3 class="font-medium">{{ item.level }}. {{ item.name }}</h3>
                  <Icon
                    v-if="item.showStatus"
                    :name="item.icon"
                    color="currentColor"
                    class="h-5 w-5 text-gray-400"
                  />
                </div>
              </BaseCard>
            </li>
          </ul>
        </div>
      </div>
    </TairoContentWrapper>
    <Faqs category="KYC" />
  </div>
</template>
