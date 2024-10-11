<script setup lang="ts">
const { activeLayoutComponent } = useLayoutSwitcher()
</script>

<template>
  <component :is="activeLayoutComponent">
    <slot />
  </component>
</template>
