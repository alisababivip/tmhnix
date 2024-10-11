<script setup lang="ts">
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)
const frontendType = computed(() => settings.value?.frontend_type ?? 'Basic')
</script>
<template>
  <LayoutNavigationLayout v-if="frontendType === 'Basic'">
    <slot />
  </LayoutNavigationLayout>

  <slot v-else />
</template>
