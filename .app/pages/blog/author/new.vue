<script setup lang="ts">
definePageMeta({
  title: 'Action',
})

const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)
const userStore = useUserStore()
const user = computed(() => userStore.getProfile)
const { toast } = useUtils()
const { createAuthor } = useBlog()
const router = useRouter()

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/auth/login')
  }
  if (user.value?.author?.status === 'APPROVED') {
    router.push('/blog/author')
    toast.successText('You are already an author')
  }
  if (user.value?.author?.status === 'REJECTED') {
    router.push('/blog/author')
    toast.dangerText('Your application has been rejected')
  }
  if (user.value?.author?.status === 'PENDING') {
    router.push('/blog/author')
    toast.info('Your application is pending')
  }
})

const submit = async () => {
  try {
    const response = await createAuthor()
    toast.response(response)
    await userStore.fetchProfile()
    router.push('/blog/author')
  } catch (error) {
    toast.danger(error)
  }
}
</script>

<template>
  <div class="flex items-center justify-center py-8">
    <div class="mx-auto w-full max-w-4xl">
      <BaseCard>
        <div
          class="divide-muted-200 dark:divide-muted-700 grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0"
        >
          <div class="flex flex-col p-8">
            <BaseAvatar class="mx-auto" size="xl" src="/img/avatars/10.svg" />
            <div class="mx-auto mb-4 max-w-xs text-center">
              <BaseHeading as="h2" size="md" weight="medium" class="mt-4">
                {{ $t('Application for') }} {{ settings?.site_name }}
                {{ $t('Authorship Program') }}
              </BaseHeading>
            </div>
            <div class="mx-auto max-w-sm">
              <BaseCard elevated class="p-6">
                <BaseHeading
                  as="h3"
                  size="xs"
                  weight="medium"
                  class="text-muted-400 mb-2 !text-[0.65rem] uppercase"
                >
                  {{ $t('Note from Editorial Team') }}
                </BaseHeading>
                <BaseParagraph
                  size="xs"
                  class="text-muted-500 dark:text-muted-400"
                >
                  {{
                    $t(
                      "Dear Applicant, We have noticed your interest in contributing to our platform. Due to the increasing volume of content, we are currently expanding our team of authors. We'd be delighted to consider you for this role",
                    )
                  }}.
                </BaseParagraph>
              </BaseCard>

              <div class="mt-6 flex items-center justify-between gap-2">
                <BaseButton class="w-full" to="/blog/author">{{
                  $t('Decline')
                }}</BaseButton>
                <BaseButton color="primary" class="w-full" @click="submit">{{
                  $t('Accept')
                }}</BaseButton>
              </div>
            </div>
          </div>
          <div>
            <div class="flex flex-col p-8">
              <BaseHeading tag="h2" size="md" weight="medium" class="mt-4">
                {{ $t('Onboarding Guidelines') }}
              </BaseHeading>
              <BaseText
                size="xs"
                class="text-muted-500 dark:text-muted-400 max-w-xs"
              >
                {{
                  $t(
                    'Please review the following guidelines carefully before accepting this invitation',
                  )
                }}.
              </BaseText>
              <div class="mt-6">
                <ul class="space-y-6">
                  <li class="flex gap-3">
                    <div
                      class="border-muted-200 dark:border-muted-600 dark:bg-muted-700 shadow-muted-300/30 dark:shadow-muted-800/20 flex h-9 w-9 items-center justify-center rounded-full border bg-white shadow-xl"
                    >
                      <Icon
                        name="fa-solid:gem"
                        class="text-warning-500 h-4 w-4"
                      />
                    </div>
                    <div>
                      <BaseHeading as="h3" size="sm" weight="medium">
                        {{ $t('Content Quality') }}
                      </BaseHeading>
                      <BaseText
                        size="xs"
                        class="text-muted-500 dark:text-muted-400 max-w-[210px]"
                      >
                        {{
                          $t(
                            'Ensure your articles meet our editorial standards for accuracy, depth, and quality',
                          )
                        }}.
                      </BaseText>
                    </div>
                  </li>
                  <li class="flex gap-3">
                    <div
                      class="border-muted-200 dark:border-muted-600 dark:bg-muted-700 shadow-muted-300/30 dark:shadow-muted-800/20 flex h-9 w-9 items-center justify-center rounded-full border bg-white shadow-xl"
                    >
                      <Icon
                        name="lucide:check"
                        class="text-success-500 h-4 w-4"
                      />
                    </div>
                    <div>
                      <BaseHeading as="h3" size="sm" weight="medium">
                        {{ $t('Plagiarism') }}
                      </BaseHeading>
                      <BaseText
                        size="xs"
                        class="text-muted-500 dark:text-muted-400 max-w-[210px]"
                      >
                        {{
                          $t(
                            'Plagiarism is strictly prohibited. All content must be original and properly cited',
                          )
                        }}.
                      </BaseText>
                    </div>
                  </li>
                  <li class="flex gap-3">
                    <div
                      class="border-muted-200 dark:border-muted-600 dark:bg-muted-700 shadow-muted-300/30 dark:shadow-muted-800/20 flex h-9 w-9 items-center justify-center rounded-full border bg-white shadow-xl"
                    >
                      <Icon
                        name="fluent:prohibited-20-regular"
                        class="text-danger-500 h-4 w-4"
                      />
                    </div>
                    <div>
                      <BaseHeading as="h3" size="sm" weight="medium">
                        {{ $t('Prohibited Content') }}
                      </BaseHeading>
                      <BaseText
                        size="xs"
                        class="text-muted-500 dark:text-muted-400 max-w-[210px]"
                      >
                        {{
                          $t(
                            'Content that includes hate speech, harassment, violence, or explicit material is strictly prohibited',
                          )
                        }}.
                      </BaseText>
                    </div>
                  </li>
                  <li class="flex gap-3">
                    <div
                      class="border-muted-200 dark:border-muted-600 dark:bg-muted-700 shadow-muted-300/30 dark:shadow-muted-800/20 flex h-9 w-9 items-center justify-center rounded-full border bg-white shadow-xl"
                    >
                      <Icon
                        name="healthicons:communication-outline"
                        class="text-info-500 h-4 w-4"
                      />
                    </div>
                    <div>
                      <BaseHeading as="h3" size="sm" weight="medium">
                        {{ $t('Communication') }}
                      </BaseHeading>
                      <BaseText
                        size="xs"
                        class="text-muted-500 dark:text-muted-400 max-w-[210px]"
                      >
                        {{
                          $t(
                            'Maintain open and clear communication with the editorial team',
                          )
                        }}.
                      </BaseText>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
