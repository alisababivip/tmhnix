<script setup lang="ts">
import type { Tag } from '~~/types'

const props = defineProps({
  tags: {
    type: Array as () => Tag[],
    required: true,
  },
})
</script>

<template>
  <div class="mb-2 space-y-5">
    <div
      v-if="props.tags?.length > 0"
      v-for="tag in props.tags"
      :key="tag.id"
      class="flex gap-3 items-center"
    >
      <NuxtLink :to="`/blog/tags/${tag.slug}`">
        <BaseTag>
          <span>{{ tag.name }}</span>
        </BaseTag></NuxtLink
      >
    </div>
    <div v-else>
      <span class="text-muted-400 text-sm"> {{ $t('No Tags found') }}. </span>
    </div>
  </div>
</template>
