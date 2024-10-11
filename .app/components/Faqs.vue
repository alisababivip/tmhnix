<script lang="ts" setup>
import { useFaqsStore } from '~~/store/extensions/faq/user/entries'

const props = defineProps({
  category: String,
})

const extensionStore = useExtensionStore()
const extensions = computed(() => extensionStore.extensionsUser)
const faqStore = useFaqsStore()
const faqs = computed(() =>
  faqStore.faqs.filter((faq) => faq.category.identifier === props.category),
)

onMounted(async () => {
  if (extensionStore.extensionsUser.length === 0) {
    await extensionStore.fetchExtensionsUser()
  }

  if (extensions.value['knowledge_base'] && faqStore.faqs.length === 0) {
    await faqStore.fetchFaqs()
  }
})

const openFAQIndex = ref(0)

const toggleFAQ = (index) => {
  openFAQIndex.value = openFAQIndex.value === index ? null : index
}
</script>
<template>
  <BaseCard
    shape="curved"
    elevated
    class="my-20 px-6 sm:px-8 md:px-8 lg:px-8 py-6 sm:py-8 md:py-12 lg:py-12"
    v-if="faqs.length > 0"
  >
    <h2
      class="text-3xl lg:text-4xl tracking-tight font-extrabold text-center text-gray-900 dark:text-white pb-6"
    >
      Frequently asked questions
    </h2>
    <div
      class="grid gap-5 grid-cols-1 sm:grid-col-2 md:grid-col-2 lg:grid-cols-4 items-center"
    >
      <client-only>
        <LottieFaq :width="$viewport.isLessThan('lg') ? '240px' : undefined" />
      </client-only>
      <div class="col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-3">
        <div class="mx-auto max-w-screen-md">
          <div id="accordion-flush" class="mx-auto max-w-screen-md">
            <template v-for="(faq, index) in faqs">
              <h2 :id="`accordion-flush-heading-${index}`">
                <button
                  @click="toggleFAQ(index)"
                  :class="{
                    'text-gray-900 dark:text-white': openFAQIndex === index,
                    'text-gray-500 dark:text-gray-400': openFAQIndex !== index,
                    'rounded-t-lg': index === 0,
                    'rounded-b-lg': index === faqs.length - 1,
                  }"
                  class="flex justify-between items-center py-5 w-full font-medium text-left bg-gray-100 border-b border-gray-200 dark:border-gray-700 dark:bg-gray-900 px-4"
                  :aria-expanded="openFAQIndex === index"
                  :aria-controls="`accordion-flush-body-${index}`"
                >
                  <span>{{ faq.question }}</span>
                  <Icon
                    :name="
                      openFAQIndex === index
                        ? 'line-md:chevron-up'
                        : 'line-md:chevron-down'
                    "
                    class="block h-5 w-5"
                  />
                </button>
              </h2>
              <div
                :id="`accordion-flush-body-${index}`"
                :aria-labelledby="`accordion-flush-heading-${index}`"
                :class="{ hidden: openFAQIndex !== index }"
              >
                <div
                  class="py-5 border-b border-gray-200 dark:border-gray-700 pl-6"
                >
                  {{ faq.answer }}
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>
