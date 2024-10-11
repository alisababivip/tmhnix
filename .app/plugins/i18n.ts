import type { LocaleMessageDictionary } from 'vue-i18n'
import { createI18n } from 'vue-i18n'

export default defineNuxtPlugin(({ vueApp }) => {
  async function loadLocaleMessages(
    locale: string,
  ): Promise<LocaleMessageDictionary> {
    const messages: any = await import(`~/data/locales/${locale}.json`)
    return messages.default
  }

  let savedLanguage: string

  // Get saved language or default to 'en'
  if (typeof window !== 'undefined') {
    savedLanguage = localStorage.getItem('selectedLanguage') || 'en'
  }

  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: savedLanguage,
    messages: {
      en: loadLocaleMessages('en'),
    },
    async missing(locale, key) {
      const messages = await loadLocaleMessages(locale)
      i18n.global.setLocaleMessage(locale, messages)
      return key
    },
  })

  vueApp.use(i18n)
})
