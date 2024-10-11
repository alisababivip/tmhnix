<script setup lang="ts">
import navigationData from '~~/data/navigation.json'

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

  navigation.value = reactive(filterNavigation(navigationData))
})

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
</script>

<template>
  <TairoSubsidebar>
    <template #header>
      <TairoSubsidebarHeader />
    </template>

    <TairoSubsidebarMenu :navigation="navigation" />
  </TairoSubsidebar>
</template>
