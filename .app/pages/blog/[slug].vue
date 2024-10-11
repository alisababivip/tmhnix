<script setup lang="ts">
definePageMeta({
  layout: 'nav',
  title: 'Blog',
})

const route = useRoute()
const router = useRouter()
const slug = route.params.slug as string

const blogStore = useBlogStore()
const post = ref(null)
const userStore = useUserStore()
const user = computed<User | null>(() => userStore.getProfile)

onMounted(async () => {
  if (userStore.isLoggedIn) {
    setPageLayout('default')
  }
  if (blogStore.posts.length === 0) {
    await blogStore.fetchPosts() // Fetch posts if not already loaded
  }
  post.value = blogStore.posts.find((p) => p.slug === slug)
})

const formattedDate = computed(() => {
  return new Date(post.value?.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const { time_since } = useUtils()
</script>

<template>
  <div
    :class="{
      'p-10 pt-20': !user,
    }"
  >
    <TairoContentWrapper v-if="post">
      <div class="relative w-full pb-20 px-2 lg:px-4 overflow-hidden">
        <div
          class="w-full max-w-7xl mx-auto grid grid-cols-12 md:gap-x-10 gap-y-10 pt-6 sm:pt-10"
        >
          <!-- Featured image -->
          <div
            class="col-span-12 ltablet:col-span-5 ltablet:col-start-2 lg:col-span-5"
          >
            <img
              :src="
                post?.image || '/img/illustrations/dashboards/writer/post-1.svg'
              "
              alt="featured image"
              class="block max-w-full w-full md:w-[540px] md:h-[447px] ltablet:w-[459px] ltablet:h-[380px] object-cover rounded-2xl mx-auto"
            />
          </div>
          <!-- Post Details -->
          <div
            class="col-span-12 ltablet:col-span-5 lg:col-span-5 ltablet:col-start-7 lg:col-start-7"
          >
            <div class="h-full flex items-center">
              <div class="w-full max-w-md ptablet:mx-auto">
                <!-- Categories -->
                <div class="mb-4">
                  <div class="flex flex-row flex-wrap items-start gap-2">
                    <NuxtLink
                      :to="`/blog/categories/${post?.category?.slug}`"
                      class="inline-block font-sans text-xs capitalize text-white py-1 px-3 rounded-full bg-primary-500 shadow-lg shadow-primary-500/20"
                    >
                      {{ post?.category?.name }}
                    </NuxtLink>
                  </div>
                </div>
                <!-- Title -->
                <h1
                  class="font-sans text-muted-800 dark:text-white font-bold text-3xl"
                >
                  {{ post?.title }}
                </h1>
                <p
                  class="font-sans text-sm text-muted-500 dark:text-muted-400 my-4"
                >
                  {{ post?.description }}
                </p>
                <!-- Author and Date -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <img
                      :src="post?.author.user.avatar || '/img/placeholder.png'"
                      alt="Author"
                      class="sm:w-12 sm:h-12 w-10 h-10 rounded-full"
                    />
                    <div class="font-sans text-sm">
                      <span
                        class="text-muted-800 dark:text-muted-100 font-medium leading-none hover:text-indigo-600 transition duration-500 ease-in-out"
                      >
                        {{ post?.author.user.first_name }}
                        {{ post?.author.user.last_name }}
                      </span>
                      <p class="text-muted-600 dark:text-muted-400 text-xs">
                        {{ formattedDate }}
                      </p>
                    </div>
                  </div>
                  <!-- Reading Time -->
                  <div class="font-sans text-xs sm:text-sm text-muted-400">
                    <span class="pr-2">—</span>
                    <span>{{ time_since(post?.created_at) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section class="px-16 py-10 bg-white dark:bg-muted-800 -mx-16">
        <div class="max-w-2xl mx-auto">
          <div class="post-body" v-html="post?.content"></div>
          <!-- <div class="comments-section mt-10"></div> -->
          <div
            class="py-10 mt-10 border-t border-muted-200 dark:border-muted-700/60"
          >
            <div
              class="flex flex-row flex-wrap items-start gap-4 lg:gap-2 mt-2"
            >
              <NuxtLink
                v-for="entry in post?.post_tag"
                :key="entry.id"
                :to="`/blog/tags/${entry.tag.slug}`"
              >
                <BaseTag shape="rounded">{{ entry.tag.name }}</BaseTag>
              </NuxtLink>
            </div>
          </div>
          <div class="pb-16">
            <a
              class="flex items-center gap-2 font-sans text-sm no-underline text-primary-500 cursor-pointer"
              @click="router.back()"
            >
              <Icon name="lucide:arrow-left" />
              <span>{{ $t('Back') }}</span>
            </a>
          </div>
        </div>
      </section>
    </TairoContentWrapper>
    <template v-else>
      <BasePlaceholderPage
        title="Post not found"
        subtitle="Looks like the post you're looking for doesn't exist."
        class="h-[calc(100vh_-_200px)]"
      >
        <template #image>
          <img
            src="/img/illustrations/magician.svg"
            class="slow-bounce"
            alt="Placeholder image"
          />
        </template>
        <BaseButton
          @click="router.back()"
          shape="rounded"
          color="primary"
          flavor="outline"
          class="mt-8"
        >
          <Icon name="lucide:arrow-left" />
          <span>{{ $t('Back') }}</span>
        </BaseButton>
      </BasePlaceholderPage>
    </template>
  </div>
</template>
