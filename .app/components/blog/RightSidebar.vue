<script setup lang="ts">
const blogStore = useBlogStore()

onMounted(async () => {
  if (blogStore.categories.length === 0) {
    await blogStore.fetchCategories()
  }
  if (blogStore.tags.length === 0) {
    await blogStore.fetchTags()
  }
})
const categories = computed(() => blogStore.categories ?? [])
const tags = computed(() => blogStore.tags ?? [])
</script>
<template>
  <div class="space-y-5">
    <BaseCard class="p-3">
      <BaseHeading as="h4" size="sm" weight="bold" class="mb-3">
        {{ $t('Categories') }}
      </BaseHeading>
      <BlogCategoryListCompact :categories="categories" />
    </BaseCard>
    <BaseCard class="p-3">
      <BaseHeading as="h4" size="sm" weight="bold" class="mb-3">
        {{ $t('Tags') }}
      </BaseHeading>
      <BlogTagCloud :tags="tags" />
    </BaseCard>
  </div>
</template>
