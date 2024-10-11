<script setup lang="ts">
const extensionStore = useExtensionStore()
const extensions = computed(() => extensionStore.extensionsUser)
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)
type NavigationItem = {
  name: string
  to: string
  permission?: string | null
  extension?: string
  divider?: boolean
}
const navigation: Ref<NavigationItem[]> = ref([])
const navigationData = [
  {
    name: 'Fiat Wallets',
    to: '/user/wallets/fiat',
    permission: null,
  },
  {
    name: 'Spot Wallets',
    to: '/user/wallets/spot',
    permission: null,
    setting: ['spot_exchange'],
  },
  {
    name: 'Funding Wallets',
    to: '/user/wallets/funding',
    extension: 'ecosystem',
  },
]
onMounted(async () => {
  if (extensionStore.extensions.length === 0) {
    await extensionStore.fetchExtensionsUser()
  }

  navigation.value = reactive(navigationData.filter(hasAccess))

  if (
    navigation.value.length > 0 &&
    navigation.value[navigation.value.length - 1].divider
  ) {
    navigation.value.pop()
  }
})

const hasAccess = (item: any) => {
  if (item.extension && !extensions.value[item.extension]) {
    return false
  }

  if (
    Array.isArray(item.setting) &&
    item.setting.some((setting) => !settings.value[setting])
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
