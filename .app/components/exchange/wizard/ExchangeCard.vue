<script setup lang="ts">
const props = defineProps({
  exchange: String,
  productId: String,
  imgSrc: String,
  title: String,
  content: String,
  link: String,
  selectedExchange: String,
  nextStep: String,
  onSelect: Function,
})
</script>

<template>
  <div
    class="relative dark:hover:bg-muted-800 hover:shadow-muted-300/30 dark:hover:shadow-muted-800/30 group rounded-2xl transition-all duration-300 hover:bg-white hover:shadow-xl pb-20 pt-5 border border-gray-300 dark:border-gray-700"
    :class="[
      selectedExchange === exchange
        ? 'dark:bg-muted-800 shadow-muted-300/30 dark:shadow-muted-800/30 bg-white shadow-xl'
        : '',
    ]"
  >
    <img
      :src="imgSrc"
      class="h-[100px] w-full mx-auto py-3 px-5"
      :alt="exchange"
    />
    <div class="my-4 px-5">
      <BaseHeading
        tag="h3"
        weight="medium"
        size="xl"
        class="text-muted-800 dark:text-muted-100 mb-2"
      >
        <span>{{ title }}</span>
      </BaseHeading>
      <BaseParagraph v-if="!link" class="text-muted-400">
        <span>{{ content }}</span>
      </BaseParagraph>
      <a
        v-if="link"
        class="font-medium text-blue-600 underline dark:text-blue-500 hover:no-underline"
        :href="link"
        target="_blank"
        >{{ content }}</a
      >
    </div>
    <div
      class="p-4 bg-gray-100 dark:bg-gray-900 rounded-b-2xl absolute bottom-0 w-full"
    >
      <BaseButton
        :to="nextStep"
        :color="selectedExchange === exchange ? 'success' : 'primary'"
        class="w-full py-2 transition-colors duration-200"
        @click.prevent="() => onSelect(exchange, productId)"
      >
        <span>
          {{ selectedExchange === exchange ? 'Selected' : 'Select' }}
        </span>
      </BaseButton>
    </div>
  </div>
</template>
