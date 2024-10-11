<script setup lang="ts">
import { usePostStore } from '~~/store/blog/post'
import type { User } from '~~/types'

definePageMeta({
  title: 'Author Dashboard',
})

const { formatedDate, toast } = useUtils()

const userStore = useUserStore()
const user = computed<User | null>(() => userStore.getProfile)
const postStore = usePostStore()

const { deletePost } = useBlog()
const blogStore = useBlogStore()

const author = computed(() => user.value?.author)

const router = useRouter()
const oldFilter = ref('')

// Load data when component is created
onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.push('/auth/login')
  }

  loading.value = true

  if (blogStore.posts.length === 0) {
    await blogStore.fetchPosts()
  }

  loading.value = false
})

const posts = computed(() => {
  return blogStore.posts?.slice(0, 5)
})

const activePosts = ref('recent')

const route = useRoute()

const loading = ref(false)
const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const authorPosts = computed(() => {
  return (
    blogStore.posts?.filter(
      (post) => post.author?.uuid === author.value?.uuid,
    ) || []
  )
})

const items = computed(() =>
  authorPosts.value
    .filter((post) => {
      // Reference ID Filter
      if (
        filter.value &&
        filter.value !== '' &&
        filter.value !== undefined &&
        filter.value !== oldFilter.value
      ) {
        router.push({
          query: {
            ...route.query,
            page: '1',
            filter: filter.value,
          },
        })
        oldFilter.value = filter.value
      }
      return !filter.value || post.title?.includes(filter.value)
    })
    .sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }),
)

const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

const status = (status: string) => {
  switch (status) {
    case 'PUBLISHED':
      return 'success'
    case 'DRAFT':
      return 'warning'
    case 'TRASH':
      return 'danger'
    default:
      return 'info'
  }
}

// Delete modal
const isDeleteOpen = ref(false)
const isDeleting = ref(false)

function openDeleteModal(item: any) {
  postStore.selectedPost = item
  isDeleteOpen.value = true
}

async function deleteItem() {
  isDeleting.value = true
  try {
    const response = await deletePost(postStore.selectedPost?.id)
    toast.successText('Post deleted successfully')
    await blogStore.fetchPosts()
  } catch (error) {
    toast.danger(error as any)
  }
  isDeleteOpen.value = false
  isDeleting.value = false
}
</script>

<template>
  <div class="relative">
    <!-- Grid -->
    <div class="grid grid-cols-12 gap-6">
      <!-- Column -->
      <div class="ltablet:col-span-8 col-span-12 lg:col-span-8">
        <!-- Inner grid -->
        <div class="grid grid-cols-12 gap-6">
          <!-- Header -->
          <div class="col-span-12">
            <div
              class="bg-primary-800 flex flex-col items-center rounded-2xl p-4 sm:flex-row"
            >
              <div class="relative h-[150px] w-[320px] shrink-0 sm:h-[175px]">
                <img
                  class="pointer-events-none absolute start-6 top-0 sm:-start-10"
                  src="/img/illustrations/dashboards/writer/readers.svg"
                  alt="Readers illustration"
                />
              </div>
              <div class="mt-6 grow sm:mt-0">
                <div class="pb-4 text-center sm:pb-0 sm:text-left">
                  <BaseHeading tag="h1" class="text-white opacity-90">
                    <span>{{ $t('Hello') }}, {{ user.first_name }}</span>
                  </BaseHeading>
                  <BaseParagraph
                    size="sm"
                    class="max-w-xs text-white opacity-70"
                  >
                    <span>
                      <!-- No author account -->
                      <template v-if="!author?.status">
                        {{
                          $t(
                            "You don't have an author profile yet. Create one to start writing articles",
                          )
                        }}.
                      </template>
                      <!-- Author account is pending -->
                      <template v-else-if="author?.status === 'PENDING'">
                        {{
                          $t(
                            'Your author profile is currently pending for approval',
                          )
                        }}.
                      </template>
                      <!-- Author account is rejected -->
                      <template v-else-if="author?.status === 'REJECTED'">
                        {{ $t('Your author profile has been rejected') }}.
                      </template>
                      <!-- Author account is approved -->
                      <template v-else-if="author?.status === 'APPROVED'">
                        {{
                          $t(
                            'Have any ideas for a new article? If not, you should definitely check the feed for some inspiration',
                          )
                        }}.
                      </template>
                    </span>
                  </BaseParagraph>
                  <div class="mt-2">
                    <BaseButton
                      v-if="author?.status === 'APPROVED'"
                      size="sm"
                      color="light"
                      flavor="outline"
                      class="w-full sm:w-auto"
                      to="/blog/author/post?type=new"
                    >
                      <Icon name="lucide:plus" class="h-4 w-4" />
                      <span>New article</span>
                    </BaseButton>
                    <BaseButton
                      v-else-if="!author?.status"
                      size="sm"
                      color="light"
                      flavor="outline"
                      class="w-full sm:w-auto"
                      to="/blog/author/new"
                    >
                      <Icon name="lucide:plus" class="h-4 w-4" />
                      <span>{{ $t('Create author profile') }}</span>
                    </BaseButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Content -->
          <div class="col-span-12">
            <TairoContentWrapper>
              <template #left>
                <div class="w-full">
                  <BaseInput
                    v-model="filter"
                    icon="lucide:search"
                    :classes="{
                      wrapper: 'w-full sm:w-auto',
                    }"
                    placeholder="Search Post Title..."
                  />
                </div>
              </template>
              <template #right>
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
              <div>
                <template v-if="!loading && paginatedItems?.length === 0">
                  <BasePlaceholderPage
                    :title="
                      filter && filter !== ''
                        ? 'No matching results'
                        : 'No results'
                    "
                    :subtitle="
                      filter && filter !== ''
                        ? 'Looks like we couldn\'t find any matching results for your search terms. Try other search terms.'
                        : 'Looks like we don\'t have any data here yet.'
                    "
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
                        :key="item.id"
                        spaced
                      >
                        <template #start>
                          <TableFlexTableStart
                            label="Post"
                            :hide-label="index > 0"
                            :picture="item.image || '/img/placeholder.png'"
                            :title="item.title"
                            :subtitle="formatedDate(item.created_at, true)"
                          />
                        </template>
                        <template #end>
                          <TableFlexTableCell
                            label="Status"
                            :hide-label="index > 0"
                            class="w-20 xs:w-full"
                          >
                            <BaseTag
                              :color="status(item.status)"
                              flavor="pastel"
                              condensed
                              >{{ item.status }}</BaseTag
                            >
                          </TableFlexTableCell>
                          <TableFlexTableCell
                            label="Actions"
                            :hide-label="index > 0"
                            class="w-20 xs:justify-end xs:w-full"
                          >
                            <BaseDropdown
                              flavor="context"
                              label="Dropdown"
                              orientation="end"
                            >
                              <BaseDropdownItem
                                :to="`/blog/${item.slug}`"
                                title="View Post"
                              >
                                <template #start>
                                  <Icon
                                    name="ph:eye-duotone"
                                    class="me-2 block h-5 w-5"
                                  />
                                </template>
                              </BaseDropdownItem>

                              <BaseDropdownItem
                                :to="`/blog/author/post?type=edit&slug=${item.slug}`"
                                title="Edit Post"
                              >
                                <template #start>
                                  <Icon
                                    name="line-md:edit-twotone"
                                    class="me-2 block h-5 w-5"
                                  />
                                </template>
                              </BaseDropdownItem>

                              <BaseDropdownItem
                                @click="openDeleteModal(item)"
                                title="Delete Post"
                              >
                                <template #start>
                                  <Icon
                                    name="line-md:close"
                                    class="me-2 block h-5 w-5"
                                  />
                                </template>
                              </BaseDropdownItem>
                            </BaseDropdown>
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
        </div>
      </div>
      <!-- Column -->
      <div class="ltablet:col-span-4 col-span-12 lg:col-span-4">
        <div class="bg-muted-200 dark:bg-muted-800/70 rounded-2xl p-6">
          <!-- Title -->
          <div class="mb-8 flex items-center justify-between">
            <BaseHeading
              as="h3"
              size="md"
              weight="semibold"
              lead="tight"
              class="text-muted-800 dark:text-white"
            >
              <span>{{ $t('New articles') }}</span>
            </BaseHeading>
            <!-- <div
              class="flex scale-90 gap-2 sm:justify-end"
              v-if="posts?.length > 0"
            >
              <BaseButtonAction
                small
                :color="activePosts === 'recent' ? 'primary' : 'default'"
                @click="activePosts = 'recent'"
              >
                Recent
              </BaseButtonAction>
              <BaseButtonAction
                small
                :color="activePosts === 'popular' ? 'primary' : 'default'"
                @click="activePosts = 'popular'"
              >
                Popular
              </BaseButtonAction>
            </div> -->
          </div>
          <!-- Posts-->
          <div
            class="ptablet:grid ptablet:grid-cols-2 flex flex-col gap-6 overflow-y-auto pr-1"
            :class="{
              'h-[calc(70vh)]': posts?.length > 2,
              'h-[calc(100%)]': posts?.length <= 2 && posts?.length > 0,
            }"
          >
            <!-- Post -->
            <NuxtLink
              :to="`/blog/${post.slug}`"
              class="flex flex-col"
              v-if="posts?.length"
              v-for="post in posts?.slice(0, 5)"
              :key="post.id"
            >
              <img
                :src="
                  post.image ||
                  '/img/illustrations/dashboards/writer/post-1.svg'
                "
                alt="Post image"
                class="bg-muted-200 rounded-xl"
              />
              <BaseCard
                class="shadow-muted-300/30 dark:shadow-muted-900/20 -mt-8 !rounded-2xl p-6 shadow-xl"
              >
                <div class="mb-3">
                  <BaseHeading
                    as="h4"
                    size="md"
                    weight="light"
                    lead="tight"
                    class="text-muted-800 mb-1 dark:text-white"
                  >
                    <span>
                      {{
                        post.title.length > 50
                          ? post.title.slice(0, 50) + '...'
                          : post.title
                      }}
                    </span>
                  </BaseHeading>
                  <BaseParagraph size="xs">
                    <span class="text-muted-400">
                      {{
                        post.description.length > 100
                          ? post.description.slice(0, 100) + '...'
                          : post.description
                      }}
                    </span>
                  </BaseParagraph>
                </div>
                <div class="flex gap-3">
                  <BaseAvatar
                    :src="post.author?.user?.avatar || '/img/placeholder.png'"
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
                      <span>
                        {{ post.author?.user?.first_name }}
                        {{ post.author?.user?.last_name }}
                      </span>
                    </BaseHeading>
                    <BaseParagraph size="xs" class="text-left">
                      <span class="text-muted-400">
                        {{ formatedDate(post.created_at) }}
                      </span>
                    </BaseParagraph>
                  </div>
                </div>
              </BaseCard>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <TairoModal :open="isDeleteOpen" size="sm" @close="isDeleteOpen = false">
      <!-- Deletion confirmation UI -->
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Delete') }} {{ $t('Post') }}
          </h3>
          <BaseButtonClose @click="isDeleteOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Are you sure?') }}
          </h3>
          <p
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5 mb-3"
          >
            {{ $t('Do you really want to delete this') }} {{ $t('post') }}?
            {{ $t('This process cannot be undone') }}.
          </p>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isDeleteOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="danger"
              flavor="solid"
              @click="deleteItem()"
              :disabled="isDeleting"
              :loading="isDeleting"
            >
              {{ $t('Delete') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
