<script setup lang="ts">
import type { User } from '~~/types'
definePageMeta({
  layout: 'nav',
  title: 'Category Posts',
})

const route = useRoute()
const router = useRouter()
const slug = route.params.slug as string

const userStore = useUserStore()
const user = computed<User | null>(() => userStore.getProfile)

const blogStore = useBlogStore()

const category = ref(null)

onMounted(async () => {
  if (userStore.isLoggedIn) {
    setPageLayout('default')
  }
  if (blogStore.categories.length === 0) {
    await blogStore.fetchCategories() // Make sure to use fetchCategories here
  }
  category.value = blogStore.categories.find(
    (category) => category.slug === slug,
  )
  blogStore.selectCategory(category.value)
})

// Use a computed property to get the posts of the selected category
const posts = computed(() => blogStore.selectedCategoryPosts)
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
            {{ category?.name }}
          </BaseHeading>
          <p class="text-muted-400 font-sans text-lg">
            {{ category?.description }}
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
      <div
        class="grid w-full gap-4 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
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
            :categoryName="category?.name"
          />
        </TransitionGroup>
      </div>
    </TairoContentWrapper>
  </div>
</template>
