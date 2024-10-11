<script setup lang="ts">
import type { Category } from '~~/types'

const props = defineProps({
  categories: {
    type: Array as () => Category[],
    required: true,
  },
})
</script>

<template>
  <div class="mb-2 space-y-5">
    <div
      v-if="props.categories?.length > 0"
      v-for="category in props.categories"
      :key="category.id"
      class="flex gap-3 items-center hover:bg-gray-300 dark:hover:bg-gray-900 rounded px-2 py-1"
    >
      <img
        :src="category.image ? category.image : '/img/placeholder.png'"
        class="w-8 h-8 rounded"
      />

      <div>
        <BaseHeading
          as="h4"
          size="sm"
          weight="light"
          lead="tight"
          class="text-muted-800 dark:text-white"
        >
          <span> {{ category.name }} </span>
        </BaseHeading>
        <BaseParagraph size="xs">
          <span class="text-muted-400">
            <span class="text-muted-400 font-sans text-xs">
              {{ category.post?.length }}
              {{ category.post?.length > 1 ? $t('posts') : $t('post') }}
            </span>
          </span>
        </BaseParagraph>
      </div>
      <div class="ms-auto">
        <BaseButtonIcon
          :to="`/blog/categories/${category.slug}`"
          shape="curved"
          muted
          class="scale-75"
        >
          <Icon name="lucide:arrow-right" class="h-4 w-4" />
        </BaseButtonIcon>
      </div>
    </div>
    <div v-else>
      <span class="text-muted-400 text-sm">
        {{ $t('No Categories found') }}.
      </span>
    </div>
  </div>
</template>
