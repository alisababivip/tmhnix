<script setup lang="ts">
import '~/assets/css/apexcharts.css'

const props = defineProps<{
  type: string
  height: number
  width?: number
  series: any[]
  icon?: string
  iconColor?: string
  /**
   * ApexCharts options - Without `series`, `chart.type` / `chart.height` / `chart.width`  properties
   * @see https://apexcharts.com/docs/options/
   */
  options?: Record<string, any>
}>()
const { LazyApexCharts, isLoaded } = useLazyApexCharts()
const target = ref(null)
const targetIsVisible = ref(false)

// When the target is visible on viewport, load the chart
const { stop } = useIntersectionObserver(target, ([{ isIntersecting }]) => {
  if (isIntersecting) {
    targetIsVisible.value = isIntersecting
    stop()
  }
})

const iconSpanClasses = {
  primary: 'bg-primary-500/10 text-primary-500',
  success: 'bg-success-500/10 text-success-500',
  danger: 'bg-danger-500/10 text-danger-500',
  warning: 'bg-warning-500/10 text-warning-500',
  info: 'bg-info-500/10 text-info-500',
}
</script>

<template>
  <div ref="target" class="relative">
    <BasePlaceload
      class="m-4 w-[calc(100%-32px)]"
      v-if="!isLoaded && !targetIsVisible"
      :style="{ height: `${height - 32}px` }"
    />
    <ClientOnly>
      <div class="relative">
        <LazyApexCharts
          v-if="targetIsVisible"
          v-show="isLoaded"
          v-bind="props"
          class="relative z-10"
        />
        <BasePlaceload
          class="m-4 w-[calc(100%-32px)]"
          v-else
          :style="{ height: `${height - 32}px` }"
        />
        <span
          v-if="props.icon"
          :class="iconSpanClasses[props.iconColor]"
          class="inline-flex shrink-0 items-center justify-center h-10 w-10 nui-mask nui-mask-hexed absolute top-0 right-4 z-20"
          ><Icon :name="props.icon" class="h-6 w-6"
        /></span>
      </div>
    </ClientOnly>
  </div>
</template>
