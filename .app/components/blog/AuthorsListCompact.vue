<script setup lang="ts">
import type { Author } from '~~/types'

const props = defineProps({
  authors: {
    type: Object as () => Author[],
    required: true,
  },
})
</script>

<template>
  <div class="mb-2 space-y-5">
    <div
      v-if="props.authors.length > 0"
      v-for="author in props.authors"
      :key="author.id"
      class="flex items-center gap-3"
    >
      <BaseAvatar
        v-if="author.user"
        :src="author.user?.avatar"
        :text="author.user?.first_name + author.user?.last_name"
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
          <span
            >{{ author.user?.first_name }}
            {{ author.user?.last_name.slice(0, 1) }}.</span
          >
        </BaseHeading>
      </div>
      <div class="ms-auto flex items-center gap-1">
        <span class="text-muted-400 font-sans text-xs">
          {{ author.posts?.length }} {{ $t('articles') }}
        </span>
        <BaseButtonIcon shape="curved" muted class="scale-75">
          <Icon name="lucide:arrow-right" class="h-4 w-4" />
        </BaseButtonIcon>
      </div>
    </div>
    <div v-else>
      <span class="text-muted-400 text-sm">
        {{ $t('No authors found') }}.
      </span>
    </div>
  </div>
</template>
