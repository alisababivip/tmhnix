<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string
    message?: string
    color?: 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'muted'
    icon?: string
    closable?: boolean
    duration?: number
  }>(),
  {
    title: undefined,
    message: undefined,
    color: 'muted',
    icon: undefined,
    closable: true,
    duration: 5000,
  },
)

const state = useNinjaToasterState()
const { percent, closeIn, endAt } = useNinjaToasterProgress()

const wrapperClasses = computed(() => {
  switch (props.color) {
    case 'primary':
      return 'dark:border-primary-800 border-primary-200'
    case 'success':
      return 'dark:border-success-800 border-success-200'
    case 'danger':
      return 'dark:border-danger-800 border-danger-200'
    case 'warning':
      return 'dark:border-warning-800 border-warning-200'
    case 'info':
      return 'dark:border-info-800 border-info-200'
    case 'muted':
    default:
      return 'dark:border-muted-800 border-muted-200'
  }
})
const progressClasses = computed(() => {
  switch (props.color) {
    case 'primary':
      return 'bg-primary-200 dark:bg-primary-900'
    case 'success':
      return 'bg-success-200 dark:bg-success-900'
    case 'danger':
      return 'bg-danger-200 dark:bg-danger-900'
    case 'warning':
      return 'bg-warning-200 dark:bg-warning-900'
    case 'info':
      return 'bg-info-200 dark:bg-info-900'
    case 'muted':
    default:
      return 'bg-muted-200 dark:bg-muted-900'
  }
})
const iconBgClasses = computed(() => {
  switch (props.color) {
    case 'primary':
      return 'bg-primary-100 dark:bg-primary-600'
    case 'success':
      return 'bg-success-100 dark:bg-success-600'
    case 'danger':
      return 'bg-danger-100 dark:bg-danger-600'
    case 'warning':
      return 'bg-warning-100 dark:bg-warning-600'
    case 'info':
      return 'bg-info-100 dark:bg-info-600'
    case 'muted':
    default:
      return 'bg-muted-100 dark:bg-muted-600'
  }
})
const iconClasses = computed(() => {
  switch (props.color) {
    case 'primary':
      return 'text-primary-400 dark:text-primary-100'
    case 'success':
      return 'text-success-400 dark:text-success-100'
    case 'danger':
      return 'text-danger-400 dark:text-danger-100'
    case 'warning':
      return 'text-warning-400 dark:text-warning-100'
    case 'info':
      return 'text-info-400 dark:text-info-100'
    case 'muted':
    default:
      return 'text-muted-400 dark:text-muted-100'
  }
})

onMounted(() => {
  if (props.duration) {
    setTimeout(() => {
      state.close()
    }, props.duration)
  }
})
</script>

<template>
  <BaseCard
    class="dark:bg-muted-900 pointer-events-auto relative z-[200] mb-5 flex border bg-white shadow-md"
    :class="wrapperClasses"
  >
    <div class="absolute inset-x-0 bottom-0 h-1">
      <div
        class="h-1 rounded-es-lg"
        :class="progressClasses"
        :style="{
          width: `${
            percent * 100 * (props.duration ? 5000 / props.duration : 1)
          }%`,
        }"
      ></div>
    </div>

    <div v-if="props.closable" class="absolute end-2 top-2">
      <BaseButtonClose @click="state.close" />
    </div>

    <div
      v-if="props.icon"
      class="flex w-16 items-center justify-center rounded-s-lg"
      :class="iconBgClasses"
    >
      <Icon :name="props.icon" class="h-8 w-8" :class="iconClasses" />
    </div>
    <div class="text-md min-w-[220px] max-w-xl py-4 pe-12 ps-8">
      <strong
        v-if="props.title"
        class="text-semibold font-heading maw-w-lg block truncate"
      >
        {{ props.title }}
      </strong>
      <p
        v-if="props.message"
        class="text-muted-600 dark:text-muted-400 whitespace-pre-wrap"
      >
        {{ props.message }}
      </p>
    </div>
  </BaseCard>
</template>
