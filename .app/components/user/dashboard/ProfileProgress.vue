<script setup lang="ts">
import type { User, KycTemplate } from '~~/types'

const props = defineProps({
  user: Object as PropType<User>,
})
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)
const isKycEnabled = computed(() => settings.value?.kyc_status)

const { user } = props

// Fields with their respective progress values
const fieldProgressMap = [
  { field: 'avatar', value: 10 },
  { field: 'metadata.role', value: 2 },
  { field: 'metadata.bio', value: 8 },
  { field: 'metadata.info.experience', value: 2 },
  { field: 'metadata.info.firstJob.value', value: 2 },
  { field: 'metadata.info.flexible.value', value: 2 },
  { field: 'metadata.info.remote.value', value: 2 },
  { field: 'twofactor.enabled', value: 20 },
  { field: 'metadata.social.facebook', value: 2 },
  { field: 'metadata.social.twitter', value: 2 },
  { field: 'metadata.social.dribbble', value: 2 },
  { field: 'metadata.social.instagram', value: 2 },
  { field: 'metadata.social.github', value: 2 },
  { field: 'metadata.social.gitlab', value: 2 },
  { field: 'metadata.location.address', value: 10 },
  { field: 'metadata.location.city', value: 10 },
  { field: 'metadata.location.country', value: 10 },
  { field: 'metadata.location.zip', value: 10 },
]

// Calculate progress
const calculateProgress = (user) => {
  let totalProgress = 0
  let achievedProgress = 0

  fieldProgressMap.forEach(({ field, value }) => {
    const keys = field.split('.')
    let temp = user
    for (const key of keys) {
      temp = temp?.[key]
    }
    if (temp) achievedProgress += value
    totalProgress += value
  })

  return (achievedProgress / totalProgress) * 100
}

// Final progress percentage
const progressPercentage = computed(() => {
  if (!isKycEnabled.value) {
    return calculateProgress(props.user).toFixed(2)
  }
  return 0 // Or some other default value
})

const { getActiveKycTemplate } = useKyc()
const activeTemplate = ref<KycTemplate | null>(null)

const lastLevel = ref<number>(0)
const level = computed(() => parseInt(user?.kyc?.level) || 0)

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

onMounted(async () => {
  try {
    const response = await getActiveKycTemplate()
    if (!response.data.result) {
      return
    }
    activeTemplate.value = response.data.result
    const { options } = activeTemplate.value

    if (options) {
      updateLastLevel(options)

      // Search in custom_fields inside options
      if (options.custom_fields) {
        updateLastLevel(options.custom_fields)
      }
    }
  } catch (error) {
    console.error(error)
  }
})
</script>

<template>
  <BaseCard shape="curved" class="p-5 h-full w-full" v-if="!isKycEnabled">
    <UserDashboardProgressCircle
      :image="props.user?.avatar ?? '/img/avatars/6.svg'"
      :title="`${progressPercentage}% completed!`"
      :text="
        progressPercentage === 100
          ? 'Congratulations! Your profile is complete.'
          : 'Complete your profile to get verified'
      "
      :value="progressPercentage"
    />
  </BaseCard>

  <BaseCard v-else shape="curved" class="p-5 h-full w-full">
    <NuxtLink to="/user/kyc">
      <!-- IF NOT SUBMITTED -->
      <template
        v-if="!user?.kyc || (level === 0 && user?.kyc?.status !== 'PENDING')"
      >
        <div class="flex flex-col jsutify-center items-center">
          <BaseIconBox
            size="xl"
            shape="full"
            class="bg-gray-200 text-gray-600 dark:text-gray-300 dark:bg-gray-700 mb-5"
          >
            <Icon name="system-uicons:files-multi" class="h-10 w-10" />
          </BaseIconBox>
          <span
            class="text-gray-700 dark:text-gray-300 text-center font-medium"
            >{{ $t('You have not verified your identity yet.') }}</span
          >
        </div>
      </template>
      <!-- IF PENDING -->
      <template v-else-if="user?.kyc?.status === 'PENDING'">
        <div class="flex flex-col jsutify-center items-center">
          <BaseIconBox
            size="xl"
            shape="full"
            color="info"
            flavor="pastel"
            class="mb-5"
          >
            <Icon name="line-md:loading-alt-loop" class="h-12 w-12" />
          </BaseIconBox>
          <span class="text-info-500 text-center font-medium">{{
            $t('Your identity verification is processing.')
          }}</span>
        </div>
      </template>
      <!-- IF REJECTED -->
      <template v-else-if="user?.kyc?.status === 'REJECTED'">
        <div class="flex flex-col jsutify-center items-center">
          <BaseIconBox
            size="xl"
            shape="full"
            color="danger"
            flavor="pastel"
            class="mb-5"
          >
            <Icon name="line-md:alert" class="h-12 w-12" />
          </BaseIconBox>
          <span class="text-danger-500 text-center font-medium">
            {{ $t('Sorry! Your application was rejected.') }}
          </span>
        </div>
      </template>
      <!-- IF VERIFIED -->
      <template v-else-if="user?.kyc?.status === 'APPROVED'">
        <div class="flex flex-col jsutify-center items-center">
          <BaseIconBox
            size="xl"
            shape="full"
            color="success"
            flavor="pastel"
            class="mb-5"
          >
            <Icon name="fluent:shield-task-28-regular" class="h-12 w-12" />
          </BaseIconBox>
          <span class="text-success-500 text-center font-medium">{{
            $t('Your identity has been verified successfully.')
          }}</span>
        </div>
      </template></NuxtLink
    >
  </BaseCard>
</template>
