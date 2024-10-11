<script setup lang="ts">
const props = defineProps<{
  label?: string
  hideLabel?: boolean
  tabletHidden?: boolean
  loading?: boolean
}>()
</script>

<template>
  <div
    class="relative flex h-8 items-center justify-end px-6 sm:h-10 sm:justify-center sm:px-2"
    :class="props.tabletHidden && 'ptablet:hidden'"
  >
    <span
      v-if="props.label"
      class="text-muted-400 absolute start-8 top-1/2 mx-auto -translate-y-1/2 text-center font-sans text-xs font-medium uppercase sm:inset-x-0 sm:-top-10 sm:translate-y-0"
      :class="props.hideLabel ? 'sm:hidden' : ''"
    >
      {{ props.label }}
    </span>

    <div v-if="loading" class="flex flex-col gap-1 px-4 text-center">
      <BasePlaceload class="h-3 w-16 rounded-lg" />
    </div>
    <slot v-else></slot>
  </div>
</template>
