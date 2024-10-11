<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import languages from '~/data/languages.json' // Synchronous import

const { t, locale } = useI18n()
const { close } = usePanels()
const filter = ref('')

// Filter to only include languages with status 1
const activeLanguages = languages.filter((lang) => lang.status === 1)

// Build languageMap using only the active languages
const languageMap = computed(() =>
  Object.fromEntries(
    activeLanguages
      .filter((locale) => {
        // Reference ID Filter
        return (
          !filter.value ||
          locale.code?.toLowerCase().includes(filter.value.toLowerCase())
        )
      })
      .map((l) => [l.code, { code: l.code, flag: l.flag }]),
  ),
)

const setLanguage = (lang: string) => {
  locale.value = lang
  if (typeof window !== 'undefined') {
    localStorage.setItem('selectedLanguage', lang)
  }
  close()
}
</script>

<template>
  <div
    class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 border bg-white"
  >
    <div class="flex h-16 w-full items-center justify-between px-10">
      <h2
        class="font-heading text-muted-700 text-lg font-semibold dark:text-white"
      >
        {{ $t('Select language') }}
      </h2>
      <button
        type="button"
        class="text-muted-400 hover:bg-muted-100 hover:text-muted-600 dark:hover:bg-muted-700 flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 dark:hover:text-white"
        @click="close"
      >
        <Icon name="feather:chevron-right" class="h-6 w-6" />
      </button>
    </div>

    <div class="relative h-[calc(100%_-_64px)] w-full px-10 pt-5">
      <BaseInput
        v-model="filter"
        icon="lucide:search"
        :classes="{
          wrapper: 'w-full sm:w-auto',
        }"
        placeholder="Search Locale Code..."
      />
      <div class="grid grid-cols-3 py-6">
        <div
          v-for="(language, index) in languageMap"
          :key="index"
          class="relative my-4 flex items-center justify-center"
          @click="setLanguage(language.code)"
        >
          <div class="relative">
            <input
              type="radio"
              :name="`language_selection_${language.code}`"
              class="peer absolute start-0 top-0 z-20 h-full w-full cursor-pointer opacity-0"
              :checked="locale === language.code"
            />
            <div
              class="border-muted-200 peer-checked:border-primary-500 dark:border-muted-600 flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-lg transition-all duration-300"
            >
              <img
                loading="lazy"
                class="h-10 w-10 rounded-full"
                :src="language.flag"
                alt="flag icon"
              />
            </div>
            <div
              class="bg-primary-500 dark:border-muted-800 absolute -end-1 -top-1 hidden h-7 w-7 items-center justify-center rounded-full border-4 border-white text-white peer-checked:flex"
            >
              <Icon name="feather:check" class="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <img
          loading="lazy"
          src="/img/illustrations/translation.svg"
          class="mx-auto w-full max-w-[280px] dark:hidden"
          alt="illustration"
        />
        <img
          loading="lazy"
          src="/img/illustrations/translation-dark.svg"
          class="mx-auto hidden w-full max-w-[280px] dark:block"
          alt="illustration"
        />
      </div>
    </div>
  </div>
</template>
