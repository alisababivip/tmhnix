<script setup lang="ts">
const newsStore = useNewsStore()

const displayCount = ref(5)
const isFetching = ref(false)

const moreNewsAvailable = computed(
  () => newsStore.news.length > displayCount.value,
)

onMounted(() => {
  newsStore.setupInterval()
})

onUnmounted(() => {
  newsStore.cleanupInterval()
})
const { open } = usePanels()
const { truncateText, time_since } = useUtils()

const openArticle = (article: any) => {
  newsStore.setActiveArticle(article)
  open('news')
}

const loadMoreArticles = () => {
  if (!isFetching.value) {
    isFetching.value = true
    displayCount.value += 5
    isFetching.value = false
  }
}
</script>
<template>
  <div class="my-10">
    <BaseHeading tag="h2" size="xl" weight="bold" class="pb-5">
      <span>{{ $t('Latest News') }}</span>
    </BaseHeading>
    <div class="flex flex-col gap-6">
      <!-- Post -->
      <button
        v-for="(article, index) in newsStore.news.slice(0, displayCount)"
        :key="index"
        type="button"
        @click="openArticle(article)"
        class="flex flex-col sm:flex-row transition duration-300 ease-in-out translate-y-0 hover:-translate-y-1 rounded-xl shadow-md hover:shadow-lg bg-white dark:bg-muted-800/70"
      >
        <img
          loading="lazy"
          :src="article.imageurl"
          alt="Post image"
          class="bg-muted-200 xs:rounded-t-xl sm:rounded-l-xl xs:h-[220px] sm:h-[200px] sm:w-[200px] w-full object-cover"
        />
        <div class="flex flex-col justify-between w-full text-left p-4">
          <BaseHeading
            as="h4"
            size="md"
            weight="light"
            lead="tight"
            class="text-muted-800 mb-1 dark:text-white"
          >
            <span>{{ article.title }}</span>
          </BaseHeading>
          <BaseParagraph size="xs">
            <span class="text-muted-400">
              {{ truncateText(article.body, 300) }}
            </span>
          </BaseParagraph>
          <div class="flex gap-3 mt-3">
            <BaseAvatar
              src="/img/avatars/6.svg"
              text="BT"
              size="xs"
              class="bg-primary-100 dark:bg-primary-500/20 text-primary-500 shrink-0"
            />
            <div>
              <BaseHeading
                as="h4"
                size="xs"
                weight="light"
                lead="tight"
                class="text-muted-800 dark:text-white text-left"
              >
                <span>{{ article.source_info.name }}</span>
              </BaseHeading>
              <BaseParagraph size="xs" class="text-left">
                <span class="text-muted-400">{{
                  time_since(article.published_on)
                }}</span>
              </BaseParagraph>
            </div>
          </div>
        </div>
      </button>
      <BaseButton
        v-if="moreNewsAvailable"
        flavor="pastel"
        color="muted"
        shope="rounded"
        @click="loadMoreArticles"
      >
        <Icon name="line-md:downloading-loop" class="w-4 h-4 mr-2" />
        {{ $t('Load More') }}
      </BaseButton>
    </div>
  </div>
</template>
