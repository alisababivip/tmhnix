<script setup lang="ts">
import type { Comment } from '~~/types'

const props = defineProps({
  comments: {
    type: Array as () => Comment[],
    required: true,
  },
})
</script>

<template>
  <div class="mb-2 space-y-5">
    <div
      v-if="props.comments?.length > 0"
      v-for="comment in props.comments"
      :key="comment.id"
      class="flex gap-3"
    >
      <BaseAvatar
        :src="comment.author?.user?.avatar"
        :text="
          comment.author?.user?.first_name +
          '' +
          comment.author?.user?.last_name
        "
        size="xs"
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
          <span>
            {{ comment.author?.user?.first_name }}
            {{ comment.author?.user?.last_name.slice(0, 1) }}.
          </span>
        </BaseHeading>
        <BaseParagraph size="xs">
          <span class="text-muted-400">
            {{ comment.content }}
          </span>
        </BaseParagraph>
      </div>
    </div>
    <div v-else>
      <span class="text-muted-400 text-sm">
        {{ $t('No Comments found') }}.
      </span>
    </div>
  </div>
</template>
