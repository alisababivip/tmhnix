<script setup lang="ts">
definePageMeta({
  title: 'Investment Details',
  permissions: ['Access Investment Details'],
})
const transaction = ref<any>(null)
const { getInvestment } = useInvestment()
const route = useRoute()
const router = useRouter()
const { toast } = useUtils()
const transactionId = computed(() => route.params.uuid)

onMounted(async () => {
  try {
    const response = await getInvestment(transactionId.value)
    transaction.value = response.data.result
  } catch (error) {
    router.back()
    toast.danger(error as any)
  }
})

const status = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'success'
    case 'PENDING':
      return 'warning'
    case 'FAILED':
      return 'danger'
    case 'CANCELLED':
      return 'danger'
    case 'REJECTED':
      return 'danger'
    case 'EXPIRED':
      return 'danger'
    default:
      return 'info'
  }
}
const { formatedDate } = useUtils()
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
          {{ $t('Investment Details') }}
        </h1>
        <div class="flex items-center xs:flex-col sm:flex-row gap-2">
          <BaseTag
            shape="rounded"
            :color="status(transaction?.status)"
            flavor="pastel"
            class="dark:bg-opacity-80"
            >{{ transaction?.status }}</BaseTag
          >
        </div>
      </div>

      <!-- Summary Section -->
      <div
        class="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-gray-700 dark:text-gray-400"
      >
        <div class="flex flex-col">
          <label class="text-sm font-semibold text-gray-600 dark:text-gray-200"
            >{{ $t('Total Amount') }}:</label
          >
          {{ formatPrice(transaction?.amount, transaction?.wallet?.currency) }}
        </div>
        <div class="flex flex-col">
          <label class="text-sm font-semibold text-gray-600 dark:text-gray-200"
            >{{ $t('Return Of Investment') }}:</label
          >
          {{ formatPrice(transaction?.roi, transaction?.wallet?.currency) }}
        </div>
        <div class="flex flex-col">
          <label class="text-sm font-semibold text-gray-600 dark:text-gray-200"
            >{{ $t('Duration') }}:</label
          >
          {{ transaction?.duration }} {{ $t('Days') }}
        </div>
      </div>

      <!-- Details Section -->
      <div
        class="p-4 border rounded-md mb-6 text-gray-700 dark:border-gray-600 dark:text-gray-400"
      >
        <h2 class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
          {{ $t('Plan') }} {{ transaction?.plan?.title }}:
        </h2>
        <p class="mb-4">{{ transaction?.plan?.description }}</p>

        <div>
          <h2
            class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200"
          >
            {{ $t('Investment ID') }}:
          </h2>
          <p>{{ transaction?.uuid }}</p>
        </div>
      </div>

      <!-- User & Date Information -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-gray-700 dark:text-gray-400"
      >
        <div class="p-4 border rounded-md dark:border-gray-600">
          <div class="flex jsutify-start items-center">
            <img
              loading="lazy"
              :src="
                transaction?.user?.avatar || '/img/avatars/placeholder-file.png'
              "
              class="mr-2 h-16 w-16 rounded-full"
            />
            <div>
              <div class="font-bold">
                {{ transaction?.user.first_name }}
                {{ transaction?.user.last_name }}
              </div>
              <div>
                {{ transaction?.user.uuid }}
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
            {{ formatedDate(transaction?.created_at, true) }}
          </p>
        </div>
      </div>
    </BaseCard>
  </TairoContentWrapper>
</template>
