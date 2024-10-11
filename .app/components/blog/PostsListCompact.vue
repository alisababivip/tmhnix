<script setup lang="ts">
import type { Post } from '~~/types'

const props = defineProps({
  posts: {
    type: Object as () => Post[],
    required: true,
  },
})
</script>

<template>
  <div class="mb-2 space-y-5">
    <div
      v-if="posts.length > 0"
      v-for="post in posts"
      :key="post.id"
      class="flex items-center gap-3"
    >
      <BaseAvatar
        v-if="post.image"
        :src="post.image"
        shape="straight"
        mask="blob"
        class="bg-primary-100 dark:bg-primary-500/20 text-primary-500 shrink-0"
      />
      <div>
        <BaseHeading
          as="h4"
          size="sm"
          weight="light"
          lead="tight"
          class="text-muted-800 dark:text-white"
        >
          <span>{{ post.title }}</span>
        </BaseHeading>
        <BaseParagraph size="xs">
          <span class="text-muted-400">
            {{ formatDate(post.created_at) }}
          </span>
        </BaseParagraph>
      </div>
      <div class="ms-auto flex items-center gap-1">
        <BaseButtonIcon
          shape="curved"
          muted
          class="scale-75"
          :to="`/blog/${post.slug}`"
        >
          <Icon name="lucide:arrow-right" class="h-4 w-4" />
        </BaseButtonIcon>
      </div>
    </div>
    <div v-else>
      <span class="text-muted-400 text-sm"> {{ $t('No posts found') }}. </span>
    </div>
  </div>
</template>
