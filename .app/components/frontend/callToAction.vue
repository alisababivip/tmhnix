<template>
  <div
    class="py-20 bg-primary-600 dark:bg-primary-500 flex items-center justify-center flex-col gap-5 z-50"
  >
    <BaseHeading class="text-4xl font-semibold text-center text-white">
      <span class="text-4xl">{{ $t('Start Your Crypto Journey Now!') }}</span>
    </BaseHeading>
    <NuxtLink to="/register" class="z-50">
      <button
        color="success"
        class="ml-4 z-50 text-xl font-semibold rounded-full px-8 py-4 text-white bg-primary-500 hover:bg-primary-400 dark:bg-primary-900 dark:hover:bg-primary-800 shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
        size="xl"
        shadow="flat"
      >
        {{ $t('Get Started') }}
      </button>
    </NuxtLink>
  </div>
</template>
