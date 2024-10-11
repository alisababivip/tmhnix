<script lang="ts">
import 'vue3-carousel/dist/carousel.css'
</script>

<script setup lang="ts">
import { Carousel, Navigation, Slide } from 'vue3-carousel'
import { useAiTradingPlanStore } from '~~/store/extensions/ai-trading/plans'

export interface CarouselProps {
  show?: number
}

const props = withDefaults(defineProps<CarouselProps>(), {
  show: 3,
  navigation: false,
})

const aiTradingPlanStore = useAiTradingPlanStore()
const plans = computed(() => aiTradingPlanStore.plans)
onMounted(async () => {
  if (aiTradingPlanStore.plans.length === 0) {
    await aiTradingPlanStore.fetchAiTradingPlans()
  }
})

// :breakpoints="{
//   300: {
//     itemsToShow: 1,
//     snapAlign: 'start',
//   },
//   768: {
//     itemsToShow: 2,
//     snapAlign: 'start',
//   },
//   1024: {
//     itemsToShow: 3,
//     snapAlign: 'start',
//   },
// }"
</script>

<template>
  <div class="relative">
    <Carousel
      :autoplay="5000"
      :wrap-around="true"
      :items-to-show="show"
      :slides="plans"
    >
      <Slide v-for="(slide, index) in plans" :key="index">
        <NuxtLink :to="slide.to"> </NuxtLink>
      </Slide>

      <template #addons v-if="props.navigation">
        <navigation />
      </template>
    </Carousel>
  </div>
</template>

<style lang="pcss" scoped>
.carousel__slide {
  @apply px-3;
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
