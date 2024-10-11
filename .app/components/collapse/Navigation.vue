<script setup lang="ts">
import navigationData from '~~/data/navigation-collapse.json'

const { isOpen, isMobileOpen } = useCollapse()
const app = useAppConfig()
const userStore = useUserStore()
const userRole = computed(() => userStore.getRole)
const userPermissions = computed(() => userStore.getPermissions)
const extensionStore = useExtensionStore()
const extensions = computed(() => extensionStore.extensionsUser)
const navigation = ref([])
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

onMounted(async () => {
  if (extensionStore.extensions.length === 0) {
    await extensionStore.fetchExtensionsUser()
  }

  // Filter the navigation items
  navigation.value = reactive(filterNavigation(navigationData))

  // Add 'Customize' to the menu
  navigation.value.push({
    name: 'Customize',
    icon: { name: 'ph:drop-half-bottom-duotone', class: 'w-5 h-5' },
    click: () => {
      const isSwitcherOpen = useState('switcher-open', () => false)
      isSwitcherOpen.value = true
    },
    position: 'end',
  })

  // Remove last divider if present
  if (
    navigation.value.length > 0 &&
    navigation.value[navigation.value.length - 1].divider
  ) {
    navigation.value.pop()
  }
})

// Recursively filters navigation items based on access rights
const filterNavigation = (items) => {
  return items.filter((item) => {
    if (!hasAccess(item)) return false

    if (item.children) {
      item.children = filterNavigation(item.children)
      if (item.children.length === 0) return false
    }

    return true
  })
}

const hasAccess = (item) => {
  if (item.extension && !extensions.value[item.extension]) {
    return false
  }

  if (
    Array.isArray(item.setting) &&
    item.setting.some((setting) => !settings.value[setting])
  ) {
    return false
  }

  if (userRole.value === 'Super Admin') {
    return true
  }

  if (
    item.permission &&
    !userPermissions.value.some((permission) =>
      permission.includes(item.permission),
    )
  ) {
    return false
  }

  return true
}

const startMenuItems = computed(() =>
  navigation.value.filter(
    (item) => !item.position || item.position === 'start',
  ),
)
const endMenuItems = computed(() =>
  navigation.value.filter((item) => item.position === 'end'),
)
</script>

<template>
  <div
    class="dark:bg-muted-800 border-muted-200 dark:border-muted-700 fixed start-0 top-0 z-[60] flex h-full flex-col border-r bg-white transition-all duration-300"
    :class="[
      !isOpen ? 'w-[80px]' : 'w-[280px]',
      isMobileOpen
        ? 'translate-x-0 lg:translate-x-0'
        : '-translate-x-full lg:translate-x-0',
    ]"
  >
    <!--Header-->
    <slot name="header">
      <component
        v-if="app.tairo.collapse?.navigation?.header?.component"
        :is="
          resolveComponentOrNative(
            app.tairo.collapse?.navigation?.header?.component,
          )
        "
      />
    </slot>
    <!--Body-->
    <div
      class="nui-slimscroll relative flex w-full grow flex-col overflow-y-auto py-6"
      :class="!isOpen ? 'px-4' : 'px-6'"
    >
      <!--Menu-->
      <ul v-if="startMenuItems?.length" class="space-y-2">
        <!--Menu item-->
        <li v-for="(item, index) in startMenuItems" :key="index">
          <component
            v-if="item?.component?.name"
            :is="resolveComponentOrNative(item?.component?.name)"
            v-bind="item?.component?.props"
          />
          <CollapseNavigationCollapseLinks
            v-else-if="item.children"
            :item="item"
            :expanded="isOpen"
            @clicked="isOpen = true"
          />
          <NuxtLink
            v-else-if="item.to"
            :to="item.to"
            exact-active-class="!bg-primary-500/10 dark:!bg-primary-500/20 !text-primary-500 dark:!text-primary-500"
            class="nui-focus text-muted-500 dark:text-muted-400/80 hover:bg-muted-100 dark:hover:bg-muted-700/60 hover:text-muted-600 dark:hover:text-muted-200 flex cursor-pointer items-center gap-4 rounded-lg py-3 transition-colors duration-300"
            :class="!isOpen ? 'px-1 justify-center' : 'px-4'"
          >
            <Icon :name="item.icon.name" :class="item.icon.class" />
            <span
              class="whitespace-nowrap font-sans text-sm"
              :class="!isOpen ? 'hidden' : 'block'"
            >
              {{ item.name }}
            </span>
          </NuxtLink>
          <div
            v-else-if="item.divider"
            class="border-muted-200 dark:border-muted-700 my-3 h-px w-full border-t"
          ></div>
          <button
            v-else
            class="nui-focus text-muted-500 dark:text-muted-400/80 hover:bg-muted-100 dark:hover:bg-muted-700/60 hover:text-muted-600 dark:hover:text-muted-200 flex w-full cursor-pointer items-center gap-4 rounded-lg py-3 transition-colors duration-300"
            :class="!isOpen ? 'px-1 justify-center' : 'px-4'"
            @click="item.click"
          >
            <Icon :name="item.icon.name" :class="item.icon.class" />
            <span
              class="whitespace-nowrap font-sans text-sm"
              :class="!isOpen ? 'hidden' : 'block'"
            >
              {{ item.name }}
            </span>
          </button>
        </li>
      </ul>
      <div class="mb-2 grow"></div>
      <!--Menu-->
      <ul v-if="endMenuItems?.length" class="space-y-2">
        <!--Menu item-->
        <li v-for="(item, index) in endMenuItems" :key="index">
          <component
            v-if="item?.component?.name"
            :is="resolveComponentOrNative(item?.component?.name)"
            v-bind="item?.component?.props"
          />
          <CollapseNavigationCollapseLinks
            v-else-if="item.children"
            :item="item"
            :expanded="isOpen"
            @clicked="isOpen = true"
          />
          <NuxtLink
            v-else-if="item.to"
            :to="item.to"
            exact-active-class="!bg-primary-500/10 dark:!bg-primary-500/20 !text-primary-500 dark:!text-primary-500"
            class="nui-focus text-muted-500 dark:text-muted-400/80 hover:bg-muted-100 dark:hover:bg-muted-700/60 hover:text-muted-600 dark:hover:text-muted-200 flex cursor-pointer items-center gap-4 rounded-lg py-3 transition-colors duration-300"
            :class="!isOpen ? 'px-1 justify-center' : 'px-4'"
          >
            <Icon :name="item.icon.name" :class="item.icon.class" />
            <span
              class="whitespace-nowrap font-sans text-sm"
              :class="!isOpen ? 'hidden' : 'block'"
            >
              {{ item.name }}
            </span>
          </NuxtLink>
          <div
            v-else-if="item.divider"
            class="border-muted-200 dark:border-muted-700 my-3 h-px w-full border-t"
          ></div>
          <button
            v-else
            class="nui-focus text-muted-500 dark:text-muted-400/80 hover:bg-muted-100 dark:hover:bg-muted-700/60 hover:text-muted-600 dark:hover:text-muted-200 flex w-full cursor-pointer items-center gap-4 rounded-lg py-3 transition-colors duration-300"
            :class="!isOpen ? 'px-1 justify-center' : 'px-4'"
            @click="item.click"
          >
            <Icon :name="item.icon.name" :class="item.icon.class" />
            <span
              class="whitespace-nowrap font-sans text-sm"
              :class="!isOpen ? 'hidden' : 'block'"
            >
              {{ item.name }}
            </span>
          </button>
        </li>
      </ul>
    </div>
    <!--Footer-->
    <slot name="footer">
      <component
        v-if="app.tairo.collapse?.navigation?.footer?.component"
        :is="
          resolveComponentOrNative(
            app.tairo.collapse?.navigation?.footer?.component,
          )
        "
      />
    </slot>
  </div>
</template>
