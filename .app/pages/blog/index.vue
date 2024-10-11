<script setup lang="ts">
import type { User } from '~~/types'

definePageMeta({
  layout: 'nav',
  title: 'Blog',
})

const route = useRoute()
const router = useRouter()

const userStore = useUserStore()
const user = computed<User | null>(() => userStore.getProfile)
const blogStore = useBlogStore()
const posts = computed(() => blogStore.posts ?? [])

onMounted(async () => {
  if (userStore.isLoggedIn) {
    setPageLayout('default')
  }
  if (blogStore.posts.length === 0) {
    await blogStore.fetchPosts()
  }
})

// Pagination Constants
const filter = ref('')
const perPage = ref(12)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

// Filter
const items = computed(() => {
  if (posts.value && Array.isArray(posts.value)) {
    return posts.value.filter(
      (item) => item.title?.toLowerCase().includes(filter.value.toLowerCase()),
    )
  } else {
    return []
  }
})

// Pagination
const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})
</script>

<template>
  <div
    :class="{
      'p-10 pt-20': !user,
    }"
  >
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          shape="curved"
          placeholder="Search posts..."
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
        />
      </template>
      <div>
        <div v-if="filter !== '' && paginatedItems?.length === 0">
          <BasePlaceholderPage
            title="No results found"
            subtitle="Looks like we couldn't find any matching results for your search terms. Try other search terms."
          >
            <template #image>
              <img
                class="block dark:hidden"
                src="/img/illustrations/placeholders/flat/placeholder-search-6.svg"
                alt="Placeholder image"
              />
              <img
                class="hidden dark:block"
                src="/img/illustrations/placeholders/flat/placeholder-search-6-dark.svg"
                alt="Placeholder image"
              />
            </template>
          </BasePlaceholderPage>
        </div>
        <div v-else-if="paginatedItems?.length === 0">
          <BasePlaceholderPage
            title="No posts found"
            subtitle="Looks like there are no posts yet. Try again later."
          >
            <template #image>
              <img
                class="block dark:hidden"
                src="/img/illustrations/placeholders/flat/placeholder-search-6.svg"
                alt="Placeholder image"
              />
              <img
                class="hidden dark:block"
                src="/img/illustrations/placeholders/flat/placeholder-search-6-dark.svg"
                alt="Placeholder image"
              />
            </template>
          </BasePlaceholderPage>
        </div>
        <div v-else>
          <div class="grid gap-5 grid-cols-12">
            <div class="col-span-12 xs:col-span-12 md:col-span-8 lg:col-span-9">
              <div
                class="grid w-full gap-4 xs:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
              >
                <TransitionGroup
                  enter-active-class="transform-gpu"
                  enter-from-class="opacity-0 -translate-x-full"
                  enter-to-class="opacity-100 translate-x-0"
                  leave-active-class="absolute transform-gpu"
                  leave-from-class="opacity-100 translate-x-0"
                  leave-to-class="opacity-0 -translate-x-full"
                >
                  <BlogPostCard
                    v-for="item in posts"
                    :key="item.id"
                    :item="item"
                    :user="user"
                    :categoryName="item.category.name"
                  />
                </TransitionGroup>
              </div>
            </div>
            <div class="col-span-12 xs:col-span-12 md:col-span-4 lg:col-span-3">
              <BlogRightSidebar />
            </div>
          </div>
          <div class="mt-6">
            <BasePagination
              v-if="posts?.length > perPage"
              :total-items="posts?.length ?? 0"
              :item-per-page="perPage"
              :current-page="page"
              shape="curved"
            />
          </div>
        </div>
      </div>
    </TairoContentWrapper>
  </div>
</template>
