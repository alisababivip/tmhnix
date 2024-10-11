<script setup lang="ts">
definePageMeta({
  permissions: ['Access Locales Management'],
  title: 'Locales Management',
})

const route = useRoute()
const langCode = route.params.code as string
const { toast } = useUtils()

const filter = ref('')
const perPage = ref(50)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const loading = ref(false)

const translations = ref({}) // To hold original translations
const modifiedTranslations = ref({}) // To hold modified translations
const enTranslations = ref({}) // To hold English translations

const loadLocale = async (langCode, isDefault = false) => {
  try {
    const module = await import(`../../../data/locales/${langCode}.json`)
    if (isDefault) {
      enTranslations.value = module.default
    } else {
      translations.value = module.default
    }
  } catch (e) {
    console.error(`Could not load locale ${langCode}`, e)
  }
}

onMounted(async () => {
  await loadLocale('en', true) // Load English translations
  await loadLocale(langCode) // Load target language translations
  Object.keys(enTranslations.value).forEach((key) => {
    modifiedTranslations.value[key] = translations.value[key] || ''
  })
})

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (Object.keys(a).length !== Object.keys(b).length) return false

    for (const key in a) {
      if (!b.hasOwnProperty(key)) return false
      if (!deepEqual(a[key], b[key])) return false
    }

    return true
  }

  return false
}

const hasChanges = computed(() => {
  return !deepEqual(translations.value, modifiedTranslations.value)
})

const { editLocale, batchTranslate } = useSettings()
const saveChanges = async () => {
  try {
    const response = await editLocale(langCode, modifiedTranslations.value)
    toast.response(response)
  } catch (error) {
    toast.danger(error)
  }
}

const items = computed(() => {
  // Filter the keys based on the filter value
  const filteredKeys = Object.keys(enTranslations.value)
    .filter(
      (key) =>
        !filter.value || key.toLowerCase().includes(filter.value.toLowerCase()),
    )
    .sort((a, b) => a.localeCompare(b)) // Sort keys alphabetically

  // Reconstruct the filtered and sorted items based on the keys
  const filteredAndSortedItems = filteredKeys.map((key) => [
    key,
    modifiedTranslations.value[key] || '',
  ])

  return filteredAndSortedItems
})

const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

const autoTranslateEmptyFields = async () => {
  if (!modifiedTranslations.value) {
    console.error('modifiedTranslations.value is null or undefined')
    return
  }

  const keysToTranslate = []

  for (const [key, value] of Object.entries(modifiedTranslations.value)) {
    if (!value) {
      keysToTranslate.push(key)
    }
  }

  if (keysToTranslate.length === 0) {
    return
  }

  try {
    loading.value = true
    const response = await batchTranslate(keysToTranslate, langCode)

    if (response.status !== 'success') {
      toast.danger(response)
      loading.value = false
      return
    }

    for (const [original, translation] of Object.entries(
      response.data.result,
    )) {
      modifiedTranslations.value[original] = translation
    }
  } catch (error) {
    console.error('Failed to batch translate', error)
  }
  loading.value = false
}
</script>

<template>
  <div class="pb-10">
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
          placeholder="Search Languages..."
        />
        <BaseSelect
          v-model="perPage"
          label=""
          :classes="{
            wrapper: 'w-full sm:w-40',
          }"
        >
          <option :value="10">10 {{ $t('per page') }}</option>
          <option :value="25">25 {{ $t('per page') }}</option>
          <option :value="50">50 {{ $t('per page') }}</option>
          <option :value="100">100 {{ $t('per page') }}</option>
        </BaseSelect>
      </template>
      <template #right>
        <div class="w-full flex xs:flex-col sm:flex-row gap-2">
          <BaseButton to="/admin/settings/locales" color="muted">
            <Icon name="line-md:chevron-left" class="mr-2" />
            Back
          </BaseButton>
          <BaseButton
            @click="autoTranslateEmptyFields"
            v-if="langCode !== 'en'"
            color="info"
            :loading="loading"
            flavor="outline"
          >
            Auto Translate
          </BaseButton>
          <BaseButton
            @click="saveChanges"
            :disabled="!hasChanges || loading"
            :loading="loading"
            color="primary"
          >
            Save Changes
          </BaseButton>
        </div>
      </template>
      <div>
        <template v-if="!loading && paginatedItems?.length === 0">
          <BasePlaceholderPage
            title="No matching results"
            subtitle="Looks like we couldn't find any matching results for your search terms. Try other search terms."
          >
            <template #image>
              <img
                class="block dark:hidden"
                src="/img/illustrations/placeholders/flat/placeholder-search-4.svg"
                alt="Placeholder image"
              />
              <img
                class="hidden dark:block"
                src="/img/illustrations/placeholders/flat/placeholder-search-4-dark.svg"
                alt="Placeholder image"
              />
            </template>
          </BasePlaceholderPage>
        </template>
        <div v-else class="w-full sm:pt-5">
          <TairoFlexTable>
            <TransitionGroup
              enter-active-class="transform-gpu"
              enter-from-class="opacity-0 -translate-x-full"
              enter-to-class="opacity-100 translate-x-0"
              leave-active-class="absolute transform-gpu"
              leave-from-class="opacity-100 translate-x-0"
              leave-to-class="opacity-0 -translate-x-full"
            >
              <TableFlexTableRow
                v-for="(item, index) in paginatedItems"
                :key="item[0]"
                spaced
              >
                <template #start>
                  <TableFlexTableStart
                    :hide-label="index > 0"
                    label="Key"
                    :title="item[0]"
                  />
                </template>
                <template #end>
                  <TableFlexTableCell
                    label="Translation"
                    :hide-label="index > 0"
                    class="w-full xs:w-full"
                  >
                    <BaseInput
                      v-model="modifiedTranslations[item[0]]"
                      placeholder="Translation"
                    />
                  </TableFlexTableCell>
                </template>
              </TableFlexTableRow>
            </TransitionGroup>
          </TairoFlexTable>
        </div>

        <div class="mt-6">
          <BasePagination
            v-if="items.length > perPage"
            :total-items="items.length"
            :current-page="page"
            :item-per-page="perPage"
          />
        </div>
      </div>
    </TairoContentWrapper>
  </div>
</template>
