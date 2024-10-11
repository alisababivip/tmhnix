<script setup lang="ts">
definePageMeta({
  layout: 'nav',
  title: 'Tags',
})

const blogStore = useBlogStore()
const userStore = useUserStore()
const user = computed<User | null>(() => userStore.getProfile)
const router = useRouter()

onMounted(async () => {
  if (userStore.isLoggedIn) {
    setPageLayout('default')
  }
  if (blogStore.tags === null) {
    await blogStore.fetchTags()
  }
  if (blogStore.categories === null) {
    await blogStore.fetchCategories()
  }
})
const tags = computed(() => blogStore.tags ?? [])
const categories = computed(() => blogStore.categories ?? [])
</script>

<template>
  <div
    :class="{
      'p-10 pt-20': !user,
    }"
  >
    <TairoContentWrapper>
      <template #left>
        <div>
          <BaseHeading
            tag="h1"
            size="lg"
            weight="bold"
            class="text-gray-800 dark:text-gray-100"
          >
            {{ $t('Explore Tags') }}
          </BaseHeading>
          <p class="text-muted-400 font-sans text-lg">
            {{
              $t(
                'Browse through our tags to find content that matches your interests',
              )
            }}.
          </p>
        </div>
      </template>
      <template #right>
        <BaseButton
          @click="router.back()"
          shape="rounded"
          color="primary"
          flavor="outline"
          class="mb-4"
        >
          <Icon name="lucide:arrow-left" />
          <span>{{ $t('Back') }}</span>
        </BaseButton>
      </template>
      <div class="flex gap-2">
        <NuxtLink
          v-for="tag in tags"
          :key="tag.id"
          :to="`/blog/tags/${tag.slug}`"
        >
          <BaseTag shape="rounded" color="muted">{{ tag.name }}</BaseTag>
        </NuxtLink>
      </div>
      <div
        class="py-10 mt-10 border-t border-muted-200 dark:border-muted-700/60"
      >
        <div class="mb-6">
          <BaseHeading
            tag="h1"
            size="lg"
            weight="bold"
            class="text-gray-800 dark:text-gray-100"
          >
            {{ $t('Explore Our Categories') }}
          </BaseHeading>
          <p class="text-muted-400 font-sans text-lg">
            {{
              $t(
                'Browse through our diverse collection of categories to find the content that interests you the most',
              )
            }}.
          </p>
        </div>
        <div
          class="grid w-full gap-4 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          <NuxtLink
            v-for="category in categories"
            :key="category.id"
            :to="`/blog/categories/${category.slug}`"
          >
            <BaseCard
              shape="curved"
              class="group p-3 transition duration-300 ease-in-out transform hover:-translate-y-1"
            >
              <div class="relative">
                <img
                  :src="
                    category.image
                      ? category.image
                      : '/img/illustrations/dashboards/writer/post-2.svg'
                  "
                  class="h-60 w-full rounded-lg object-cover"
                />
                <div
                  class="absolute top-0 left-0 h-60 w-full bg-black opacity-0 group-hover:opacity-50 transition-all duration-300"
                ></div>
              </div>
              <div class="mt-3">
                <BaseHeading
                  tag="h3"
                  size="md"
                  weight="medium"
                  lead="snug"
                  class="line-clamp-2 text-gray-800 dark:text-gray-100"
                >
                  {{ category.name }}
                </BaseHeading>
                <p class="text-muted-400 font-sans text-xs">
                  {{ category.description }}
                </p>
              </div>
            </BaseCard>
          </NuxtLink>
        </div>
      </div>
    </TairoContentWrapper>
  </div>
</template>
