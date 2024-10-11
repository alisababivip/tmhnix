<script setup lang="ts">
const settingsStore = useSettingsStore()
const darkModeStore = useDarkModeStore()
const isDarkMode = computed(() => darkModeStore.isDarkMode)
const logoUrl = computed(() =>
  isDarkMode.value
    ? settingsStore.settings?.dark_logo
    : settingsStore.settings?.logo,
)
</script>

<template>
  <img
    loading="lazy"
    height="96"
    class="object-cover w-12 h-12 rounded-lg"
    :src="logoUrl ? logoUrl : '/img/placeholder.png'"
    alt="Site Logo"
  />
</template>
