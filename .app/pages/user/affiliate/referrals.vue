<script setup lang="ts">
definePageMeta({
  title: 'My Referrals',
})

const userStore = useUserStore()
const user = computed(() => userStore.getProfile)
const config = useRuntimeConfig()
const referUrl = computed(
  () => `${config.public.siteUrl}/register?ref=${user.value?.uuid}`,
)
const isReferOpen = ref(false)
const openModal = () => (isReferOpen.value = true)

const isCopied = ref(false)

const copyAddress = () => {
  try {
    navigator.clipboard.writeText(referUrl.value)
    isCopied.value = true

    setTimeout(() => {
      isCopied.value = false
    }, 3000)
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <div>
    <TairoContentWrapper>
      <!-- Header -->
      <div
        class="bg-muted-800 flex flex-col items-center rounded-2xl p-4 sm:flex-row w-full mb-10"
      >
        <div
          class="relative w-[320px]"
          :class="{
            'h-[170px]': $viewport.isLessThan('sm'),
            'h-[175px]': $viewport.isGreaterOrEquals('sm'),
          }"
        >
          <LottieAds
            classes="pointer-events-none absolute -top-6 start-3 sm:-start-5 sm:-top-8"
            height="260px"
          />
        </div>
        <div class="mt-24 grow sm:mt-0">
          <div
            class="pb-4 text-center sm:pb-0 sm:text-left max-w-xs md:max-w-md lg:max-w-2xl"
          >
            <BaseHeading tag="h1" class="mb-2 text-white opacity-90">
              <span>
                {{ $t('Earn More With Our Referral Program') }}
              </span>
            </BaseHeading>
            <BaseParagraph size="sm" class="text-white opacity-70">
              <span>
                {{
                  $t(
                    'Invite your friends and earn a commission for every trade they make.',
                  )
                }}
              </span>
            </BaseParagraph>
            <div class="mt-2 flex gap-2 flex-col sm:flex-row">
              <BaseButton
                @click="openModal"
                size="sm"
                color="primary"
                flavor="outline"
                class="w-full sm:w-auto"
              >
                <span>{{ $t('Refer a Friend') }}</span>
              </BaseButton>
              <NuxtLink to="/user/affiliate/program">
                <BaseButton
                  size="sm"
                  color="info"
                  flavor="outline"
                  class="w-full sm:w-auto"
                >
                  <span>{{ $t('Referral Program') }}</span>
                  <Icon name="lucide:arrow-right" class="h-4 w-4" />
                </BaseButton>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
      <!-- Charts -->
      <MlmAnalytics class="mb-5" />

      <!-- Tree -->
      <MlmTree />
    </TairoContentWrapper>

    <TairoModal :open="isReferOpen" size="lg">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Refer a Friend
          </h3>
          <BaseButtonClose @click="isReferOpen = false" />
        </div>
      </template>
      <div
        class="pt-5 border-t border-gray-200 dark:border-gray-700 p-5 space-y-5"
      >
        <div class="">
          <BaseHeading tag="h4" class="text-muted-900 dark:text-gray-100">
            Your referral link
          </BaseHeading>
          <BaseParagraph class="text-muted-700 dark:text-gray-400">
            Share this link with your friends and earn a commissions in our
            referral program.
          </BaseParagraph>
        </div>
        <div class="flex items-end gap-5">
          <div class="w-full">
            <BaseInput
              v-model="referUrl"
              readonly
              icon="ph:copy-fill"
              class="bg-muted-800 text-white"
            />
          </div>
          <BaseButton
            :color="isCopied ? 'success' : 'info'"
            flavor="outline"
            @click="copyAddress"
            >{{ isCopied ? 'Copied' : 'Copy' }}</BaseButton
          >
        </div>
      </div>
    </TairoModal>
  </div>
</template>
