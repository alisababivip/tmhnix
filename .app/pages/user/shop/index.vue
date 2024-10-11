<script lang="ts">
import 'vue3-carousel/dist/carousel.css'
</script>
<script setup lang="ts">
import { useUserEcommerceCategoriesStore } from '~~/store/extensions/ecommerce/user/categories'
import { Carousel, Navigation, Slide } from 'vue3-carousel'
definePageMeta({
  title: 'Shop',
})

const productsPerPage = 9
const userCategoriesStore = useUserEcommerceCategoriesStore()
const activeCategory = ref(null)
const displayLimit = ref(productsPerPage)

const categories = computed(() => {
  return userCategoriesStore.categories.map((category) => ({
    ...category,
    products: category.products
      ? category.products.map((product) => ({
          ...product,
          rating:
            product.reviews && product.reviews.length
              ? product.reviews.reduce(
                  (acc, review) => acc + review.rating,
                  0,
                ) / product.reviews.length
              : 0,
          reviewsCount: product.reviews ? product.reviews.length : 0,
        }))
      : [],
  }))
})

const displayedProducts = computed(() => {
  const activeCat = categories.value.find(
    (category) => category.id === activeCategory.value,
  )
  return activeCat ? activeCat.products.slice(0, displayLimit.value) : []
})

function loadMore() {
  displayLimit.value += productsPerPage
}

function selectCategory(categoryId) {
  activeCategory.value = categoryId
  displayLimit.value = productsPerPage
}

onMounted(async () => {
  if (userCategoriesStore.categories.length === 0) {
    await userCategoriesStore.fetchCategories()
  }
  if (userCategoriesStore.categories.length && !activeCategory.value) {
    activeCategory.value = userCategoriesStore.categories[0].id
  }
})
</script>

<template>
  <div>
    <!-- Column -->
    <div class="ltablet:col-span-8 col-span-12 lg:col-span-8">
      <div class="flex flex-col gap-6">
        <!-- Header -->
        <div class="col-span-12">
          <div
            class="bg-primary-800 mb-8 flex w-full flex-col items-center rounded-2xl p-4 sm:flex-row"
          >
            <div
              class="relative w-[320px]"
              :class="{
                'mb-16 h-[170px]': $viewport.isLessThan('sm'),
                'h-[175px]': $viewport.isGreaterOrEquals('sm'),
              }"
            >
              <LottieMarketplace
                classes="pointer-events-none absolute -top-6 start-3 sm:-start-5 sm:-top-8"
                height="280px"
              />
            </div>
            <div class="mt-6 grow sm:mt-0">
              <div class="pb-4 text-center sm:pb-0 sm:text-left">
                <BaseHeading tag="h1" class="mb-2 text-white opacity-90">
                  <span>
                    Welcome to Our Online Store
                    <span class="text-3xl">🎉</span>
                  </span>
                </BaseHeading>
                <BaseParagraph size="sm" class="max-w-xs text-white opacity-70">
                  <span>
                    Explore our wide selection of products and find what you
                    love.
                  </span>
                </BaseParagraph>
              </div>
            </div>
          </div>
        </div>
        <!-- Grid -->
        <div class="relative">
          <!-- Category Item -->
          <div class="mb-14">
            <div class="flex items-center justify-between">
              <BaseHeading tag="h3" size="xl" weight="semibold">
                <span> Shop by Category</span>
              </BaseHeading>
            </div>
            <Carousel
              :items-to-show="3.4"
              :slides="categories"
              :breakpoints="{
                300: {
                  itemsToShow: 1.5,
                  snapAlign: 'start',
                },
                768: {
                  itemsToShow: 2.5,
                  snapAlign: 'start',
                },
                1024: {
                  itemsToShow: 3.4,
                  snapAlign: 'start',
                },
              }"
            >
              <Slide v-for="(category, index) in categories" :key="index">
                <NuxtLink
                  class="group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-3xl border"
                  @click="selectCategory(category.id)"
                  :class="{
                    'border-primary-500': activeCategory === category.id,
                    'border-white': activeCategory !== category.id,
                  }"
                >
                  <img
                    class="h-48 w-full rounded-2xl object-cover object-center transition-all duration-300 ease-in-out group-hover:scale-105"
                    :src="category.image || '/img/placeholder.png'"
                    :alt="category.name"
                  />
                  <div
                    class="bg-muted-900 absolute inset-0 z-10 h-full w-full opacity-0 transition-opacity duration-300 group-hover:opacity-50"
                  ></div>
                  <div
                    class="absolute inset-0 z-20 flex h-full w-full flex-col justify-between p-6"
                  >
                    <div class="flex items-center justify-between">
                      <h3
                        class="-translate-y-2 font-sans tracking-wider text-white opacity-0 transition-all delay-100 duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                      >
                        {{ category.name }}
                      </h3>
                    </div>
                    <div class="flex items-center justify-between">
                      <h3
                        class="translate-y-2 font-sans text-sm text-white underline underline-offset-4 opacity-0 transition-all delay-300 duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                      >
                        View products
                      </h3>
                      <Icon
                        name="lucide:arrow-right"
                        class="h-4 w-4 translate-y-2 text-white opacity-0 transition-all delay-700 duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                      />
                    </div>
                  </div>
                </NuxtLink>
              </Slide>

              <template #addons>
                <Navigation />
              </template>
            </Carousel>
          </div>
          <!-- Products -->
          <div class="grid gap-x-3 gap-y-6 sm:grid-cols-3">
            <!-- Grid item -->
            <template v-if="activeCategory">
              <NuxtLink
                v-for="product in displayedProducts"
                :key="product.id"
                :to="`/user/shop/product/${product.id}-${product.name.replace(
                  / /g,
                  '-',
                )}`"
                class="relative"
              >
                <BaseCard
                  shape="curved"
                  class="hover:border-primary-500 hover:shadow-muted-300/30 dark:hover:shadow-muted-900/40 group p-3 hover:shadow-xl"
                >
                  <div
                    class="ltablet:h-48 bg-muted-100 dark:bg-muted-900 relative mb-3 h-48 w-full rounded-xl sm:h-32 md:h-48"
                  >
                    <img
                      class="absolute inset-0 h-full w-full rounded-xl border border-transparent object-cover transition-all duration-300 ease-in-out group-hover:-translate-y-1 group-hover:scale-105"
                      :src="product.image || '/img/placeholder.png'"
                      :alt="product.name"
                    />
                  </div>
                  <div class="mb-2">
                    <BaseHeading
                      tag="h4"
                      size="sm"
                      weight="medium"
                      class="text-muted-800 dark:text-muted-100"
                    >
                      <span>{{ product.name }}</span>
                    </BaseHeading>
                    <BaseParagraph
                      size="xs"
                      class="text-muted-500 dark:text-muted-400 line-clamp-1"
                    >
                      <span>{{ product.description }}</span>
                    </BaseParagraph>
                  </div>
                  <div class="flex items-center justify-between">
                    <div
                      class="divide-muted-200 dark:divide-muted-700 flex items-center divide-x"
                    >
                      <div class="pe-4">
                        <span
                          class="text-muted-800 dark:text-muted-100 font-sans font-bold"
                        >
                          {{ product.price }} {{ product.currency }}
                        </span>
                      </div>
                      <div class="flex items-center gap-1 ps-4">
                        <Icon
                          name="uiw:star-on"
                          class="h-3 w-3 text-yellow-400"
                          :class="product.rating == 0 ? 'grayscale' : ''"
                        />
                        <span class="text-muted-400 font-sans text-xs">
                          {{ product.rating.toFixed(1) }} ({{
                            product.reviewsCount
                          }})
                        </span>
                      </div>
                    </div>
                    <div>
                      <BaseButtonAction shape="curved">
                        <span>Order</span>
                      </BaseButtonAction>
                    </div>
                  </div>
                </BaseCard>
              </NuxtLink>
            </template>
            <template v-else>
              <p>No products available.</p>
            </template>
          </div>
          <div
            v-if="
              displayedProducts.length <
              categories?.find((category) => category.id === activeCategory)
                ?.products?.length
            "
            class="my-16 flex items-center justify-center"
          >
            <BaseButton shape="full" color="default" @click="loadMore">
              <Icon name="ph:dots-nine-bold" class="h-4 w-4" />
              <span>Load more</span>
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
    <Faqs category="ECOMMERCE" />
  </div>
</template>

<style lang="pcss" scoped>
.carousel__slide {
  @apply p-2;
}

:deep(.carousel__next--in-active),
:deep(.carousel__prev--in-active) {
  @apply opacity-70;
}

:deep(.carousel__next) {
  @apply end-0;
}

:deep(.carousel__next) svg {
  @apply -end-px;
}

:deep(.carousel__prev) {
  @apply end-8;
}

:deep(.carousel__prev) svg {
  @apply -start-px;
}

:deep(.carousel__next),
:deep(.carousel__prev) {
  @apply absolute -top-5 text-muted-400 transition-colors duration-300;
  left: initial;
}

:deep(.carousel__next) svg,
:deep(.carousel__prev) svg {
  @appy relative w-3 h-3;
}

:deep(.carousel__next:hover),
:deep(.carousel__prev:hover) {
  @apply text-primary-500;
}
</style>
