<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    currency?: string
    balance?: number
    active: boolean
  }>(),
  {
    currency: '',
    balance: 0,
  },
)

const { formatedPrice } = useUtils()
</script>
<template>
  <div
    role="button"
    class="w-full xs:h-[144px] ltablet:h-[130px] relative flex h-[160px] sm:w-[290px] max-w-full cursor-pointer flex-col overflow-hidden rounded-xl p-5 transition-all duration-300 lg:w-full"
    :class="[
      props.active ? 'bg-primary-700' : 'bg-muted-200 dark:bg-muted-900',
    ]"
  >
    <div
      class="absolute -bottom-5 -end-5 h-[120px] w-[120px] rounded-full bg-white opacity-10 dark:opacity-10"
    ></div>
    <div
      class="absolute -top-5 -right-5 h-[100px] w-[100px] rounded-full bg-white opacity-10 dark:opacity-10"
    ></div>
    <div
      class="absolute -bottom-5 left-5 h-[80px] w-[80px] rounded-full bg-white opacity-30 dark:opacity-10"
    ></div>
    <div class="flex items-center justify-between">
      <div>
        <span
          class="block font-sans text-lg font-semibold"
          :class="
            props.active ? 'text-white' : 'text-muted-800 dark:text-muted-200'
          "
        >
          {{ formatedPrice(props.balance, props.currency) }}
        </span>
        <span
          class="block font-sans text-sm"
          :class="
            props.active ? 'text-white' : 'text-muted-500 dark:text-muted-400'
          "
        >
          {{ props.currency }}
        </span>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes bounce200 {
  0%,
  100% {
    transform: translateY(-5%);
  }
  50% {
    transform: translateY(-15%);
  }
}
</style>
