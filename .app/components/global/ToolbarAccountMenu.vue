<script setup lang="ts">
import { Menu, MenuButton, MenuItems } from '@headlessui/vue'

const { logout } = useAuth()

const userStore = useUserStore()
const user = computed(() => userStore.getProfile)

const { toast } = useUtils()
const router = useRouter()
async function Logout() {
  const response = await logout()
  userStore.clearProfile()
  userStore.setIsLoggedIn(false)
  router.push({ name: 'login' })
  toast.response(response)
}
</script>

<template>
  <div class="group inline-flex items-center justify-center text-right">
    <Menu as="div" class="relative h-9 w-9 text-left" v-slot="{ close }">
      <MenuButton as="template">
        <button
          type="button"
          class="group-hover:ring-primary-500 dark:ring-offset-muted-900 inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-transparent transition-all duration-300 group-hover:ring-offset-4"
        >
          <div
            class="relative inline-flex h-9 w-9 items-center justify-center rounded-full"
          >
            <img
              loading="lazy"
              :src="user?.avatar ? user.avatar : '/img/avatars/1.svg'"
              class="max-w-full rounded-full object-cover shadow-sm dark:border-transparent h-full"
              alt=""
            />
          </div>
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
          class="divide-muted-100 border-muted-200 dark:divide-muted-700 dark:border-muted-700 dark:bg-muted-800 absolute end-0 mt-2 w-64 origin-top-right divide-y rounded-md border bg-white shadow-lg focus:outline-none"
        >
          <div class="p-6 text-center">
            <div
              class="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full"
            >
              <img
                loading="lazy"
                :src="user?.avatar ? user.avatar : '/img/avatars/1.svg'"
                class="max-w-full rounded-full object-cover shadow-sm dark:border-transparent h-full"
                alt=""
              />
            </div>
            <div class="mt-3">
              <h6
                class="font-heading text-muted-800 text-sm font-medium dark:text-white"
              >
                {{ user?.first_name }} {{ user?.last_name }}
              </h6>
              <p class="text-muted-400 mb-4 font-sans text-xs">
                {{ user?.email }}
              </p>
              <BaseButton
                to="/user/profile-edit"
                shape="curved"
                class="w-full"
                @click.passive="close"
                >{{ $t('Manage Account') }}</BaseButton
              >
            </div>
          </div>

          <div class="p-6">
            <BaseButton @click="Logout" shape="curved" class="w-full">
              {{ $t('Logout') }}
            </BaseButton>
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  </div>
</template>
