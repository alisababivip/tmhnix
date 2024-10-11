<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'

const userStore = useUserStore()
const user = computed(() => userStore.getProfile)

const notificationsStore = useNotificationsStore()
const notifications = computed(() => notificationsStore.notifications)

onMounted(async () => {
  if (notificationsStore.notifications?.length === 0 && userStore.isLoggedIn) {
    await notificationsStore.fetchNotifications()
  }
})

function formatDate(dateString: string) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

async function handleClick(id, close) {
  await notificationsStore.deleteNotification(id)
  close()
}
</script>

<template>
  <div class="group inline-flex items-center justify-center text-right">
    <Menu as="div" class="relative h-9 w-9 text-left" v-slot="{ close }">
      <MenuButton as="div">
        <button
          type="button"
          class="group-hover:ring-muted-200 dark:group-hover:ring-muted-700 dark:ring-offset-muted-900 inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-transparent transition-all duration-300 group-hover:ring-offset-4"
        >
          <span
            class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 flex h-9 w-9 items-center justify-center rounded-full border bg-white"
          >
            <Icon name="ph:bell-duotone" class="text-muted-400 h-5 w-5" />
          </span>
        </button>
      </MenuButton>

      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <MenuItems
          class="divide-muted-100 border-muted-200 dark:divide-muted-700 dark:border-muted-700 dark:bg-muted-800 absolute end-0 mt-2 w-72 origin-top-right divide-y rounded-md border bg-white shadow-lg focus:outline-none"
        >
          <div class="p-4">
            <div class="relative flex items-center justify-between">
              <h4
                class="font-heading text-muted-500 dark:text-muted-200 text-xs uppercase"
              >
                {{ $t('Notifications') }}
              </h4>
              <NuxtLink
                to="/user/notifications"
                class="font-alt text-primary-500 text-sm font-semibold"
                @click.passive="close"
              >
                {{ $t('View All') }}
              </NuxtLink>
            </div>
          </div>
          <div class="p-4 max-h-64 overflow-y-auto overflow-x-hidden">
            <MenuItem
              as="div"
              v-slot="{ active }"
              v-if="notifications.length > 0"
              v-for="item in notifications"
            >
              <NuxtLink
                :to="item.link"
                class="group flex w-full items-center rounded-md p-2 text-sm transition-colors duration-300"
                :class="[
                  active
                    ? 'bg-muted-100 dark:bg-muted-700 text-primary-500'
                    : 'text-muted-500',
                ]"
                @click.passive="handleClick(item.id, close)"
              >
                <div class="relative inline-flex items-center justify-center">
                  <Icon
                    name="line-md:moon-alt-to-sunny-outline-loop-transition"
                    class="text-muted-400 h-6 w-6"
                  />
                </div>
                <div class="ms-2">
                  <h6
                    class="font-heading text-muted-800 text-xs font-semibold leading-tight dark:text-white"
                  >
                    {{ item.title }}
                    <span
                      class="text-muted-500 dark:text-muted-400 font-normal"
                    >
                      {{ item.message }}
                    </span>
                  </h6>
                  <p class="text-muted-400 font-sans text-xs">
                    {{ formatDate(item.created_at) }}
                  </p>
                </div>
              </NuxtLink>
            </MenuItem>
            <div v-else class="text-center text-slate-300 text-sm">
              {{ $t('No activity yet') }}.
            </div>
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  </div>
</template>
