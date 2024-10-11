<script setup lang="ts">
definePageMeta({
  title: 'Notifications',
})
const userStore = useUserStore()
const user = computed(() => userStore.getProfile)

const notificationsStore = useNotificationsStore()
const notifications = computed(() => notificationsStore.notifications)

onMounted(async () => {
  if (userStore.isLoggedIn) {
    await notificationsStore.fetchNotifications()
  }
})

const { time_since } = useUtils()
</script>

<template>
  <div class="min-h-screen overflow-hidden">
    <div class="mx-auto w-full max-w-4xl pt-12">
      <div v-if="notifications && notifications.length === 0">
        <div class="mx-auto w-full max-w-5xl">
          <BasePlaceholderPage
            title="No notifications found"
            subtitle="Looks like we couldn't find any notifications for your account, try again later."
          >
            <template #image>
              <img
                class="block dark:hidden"
                src="/img/illustrations/placeholders/flat/placeholder-search-4.svg"
                alt="Placeholder image"
              />
              <img
                class="hidden dark:block"
                src="/img/illustrations/placeholders/flat/placeholder-search-4-dark.svg"
                alt="Placeholder image"
              />
            </template>
          </BasePlaceholderPage>
        </div>
      </div>
      <div v-else class="">
        <div
          v-for="item in notifications"
          :key="item.id"
          class="ltablet:after:start-[104px] after:border-muted-300 dark:after:border-muted-800 relative flex items-center gap-4 after:absolute after:start-[8px] after:top-3 after:h-full after:w-px after:border-e-2 after:content-[''] lg:after:start-[104px] [&:not(:first-child)]:pt-3"
        >
          <div class="ltablet:block hidden w-24 text-right lg:block">
            <BaseText size="xs" class="text-muted-400">
              {{ item.date }}
            </BaseText>
          </div>
          <div
            class="dark:bg-muted-800 relative z-10 h-4 w-4 shrink-0 rounded-full bg-white"
          >
            <div
              class="h-4 w-4 rounded-full border-2 border-current"
              :class="getRandomColor()"
            ></div>
          </div>

          <BaseCard class="p-4">
            <div class="flex w-full items-center gap-4 justify-between">
              <div class="flex w-full items-center gap-4">
                <div
                  class="h-2 w-2 shrink-0 rounded-full"
                  :class="
                    item.status === 0
                      ? 'bg-primary-500'
                      : 'bg-muted-300 dark:bg-muted-700/50'
                  "
                ></div>
                <BaseAvatar :src="item.user.avatar" size="sm" />
                <div>
                  <BaseText size="sm" lead="tight">
                    <span class="text-primary-500 dark:text-primary-400"
                      >{{ item.title }}:&nbsp;</span
                    >
                    <span class="text-muted-500 dark:text-muted-400"
                      >{{ item.message }}&nbsp;</span
                    >
                    <span class="text-muted-500 dark:text-muted-400"
                      >&nbsp;{{ item.type }}</span
                    >
                  </BaseText>
                  <BaseText size="xs" class="text-muted-400">
                    <span class="ltablet:hidden lg:hidden">{{
                      time_since(item.created_at)
                    }}</span>
                    <span class="ltablet:hidden px-2 lg:hidden">&middot;</span>
                    <span>{{ time_since(item.created_at) }}</span>
                  </BaseText>
                </div>
              </div>
              <TairoButtonIcon
                size="xs"
                color="primary"
                condensed
                flavor="outline"
                data-nui-tooltip="View"
                :to="item.url"
              >
                <Icon name="carbon:view" class="h-4 w-4" />
              </TairoButtonIcon>
              <TairoButtonIcon
                size="xs"
                color="danger"
                condensed
                flavor="outline"
                data-nui-tooltip="Delete"
                @click="notificationsStore.deleteNotification(user, item.id)"
              >
                <Icon name="line-md:close-small" class="h-6 w-6" />
              </TairoButtonIcon>
            </div>
          </BaseCard>
        </div>
      </div>
    </div>
  </div>
</template>
