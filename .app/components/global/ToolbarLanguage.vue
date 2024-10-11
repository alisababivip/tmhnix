<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import languages from '~~/data/languages.json' // Synchronous import

const { t, locale } = useI18n()

const { open } = usePanels()

// Filter to only include languages with status 1
const activeLanguages = languages.filter((lang) => lang.status === 1)

// Build flagIcons using only the active languages
const flagIcons = Object.fromEntries(
  activeLanguages.map((l) => [l.code, l.flag]),
)
const flagIcon = computed(() => flagIcons[locale.value] || flagIcons['en'])
</script>

<template>
  <button
    type="button"
    class="border-muted-200 hover:ring-muted-200 dark:hover:ring-muted-700 dark:border-muted-700 dark:bg-muted-800 dark:ring-offset-muted-900 flex h-9 w-9 items-center justify-center rounded-full border bg-white ring-1 ring-transparent transition-all duration-300 hover:ring-offset-4"
    @click="open('language')"
  >
    <img
      loading="lazy"
      class="h-7 w-7 rounded-full"
      :src="flagIcon"
      :key="flagIcon"
      alt="flag icon"
    />
  </button>
</template>
