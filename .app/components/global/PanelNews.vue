<script setup lang="ts">
import { useNewsStore } from '~/store/news'
const newsStore = useNewsStore()
const article = newsStore.activeArticle
const { close } = usePanels()
const { time_since } = useUtils()
</script>

<template>
  <div
    class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 border bg-white"
  >
    <div class="flex h-16 w-full items-center justify-between px-10">
      <h2
        class="font-heading text-muted-700 text-lg font-semibold dark:text-white"
      >
        {{ article.source_info.name }}
      </h2>
      <button
        type="button"
        class="text-muted-400 hover:bg-muted-100 hover:text-muted-600 dark:hover:bg-muted-700 flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 dark:hover:text-white"
        @click="close"
      >
        <Icon name="feather:chevron-right" class="h-6 w-6" />
      </button>
    </div>

    <div class="relative h-[calc(100%_-_64px)] w-full px-8">
      <div class="mb-5">
        <div>
          {{ article.title }}
        </div>
        <div class="text-muted-400 text-xs">
          {{ time_since(article.published_on) }}
        </div>
      </div>
      <div class="h-[calc(80vh)] overflow-y-auto pr-1">
        <img
          loading="lazy"
          :src="article.imageurl"
          alt="Post image"
          class="bg-muted-200 rounded-xl h-[200px] w-full object-cover mb-5"
        />
        <p>
          <span class="text-muted-400">{{ article.body }}</span>
        </p>
      </div>
    </div>
  </div>
</template>
