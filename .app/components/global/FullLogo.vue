<script setup lang="ts">
const settingsStore = useSettingsStore()
const darkModeStore = useDarkModeStore()
const isDarkMode = computed(() => darkModeStore.isDarkMode)
const logoUrl = computed(() =>
  isDarkMode.value
    ? settingsStore.settings?.dark_full_logo
    : settingsStore.settings?.full_logo,
)
</script>

<template>
  <img
    loading="lazy"
    height="96"
    :src="logoUrl ? logoUrl : '/img/placeholder.png'"
    alt="Site Logo"
  />
</template>
