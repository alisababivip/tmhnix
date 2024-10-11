<script setup lang="ts">
definePageMeta({
  title: 'Extensions',
  permissions: ['Access Extensions'],
})

const extensionStore = useExtensionStore()
const pending = computed(() => {
  return extensionStore.loading
})

onMounted(async () => {
  await extensionStore.fetchExtensions()
})

const extensions = computed(() => {
  return extensionStore.extensions
})
</script>

<template>
  <div>
    <template v-if="!pending && extensions.length === 0">
      <BasePlaceholderPage
        title="No results"
        subtitle="Looks like we don\'t have any data here yet."
      >
        <template #image>
          <img
            class="block dark:hidden"
            src="/img/illustrations/placeholders/flat/placeholder-search-7.svg"
            alt="Placeholder image"
          />
          <img
            class="hidden dark:block"
            src="/img/illustrations/placeholders/flat/placeholder-search-7-dark.svg"
            alt="Placeholder image"
          />
        </template>
      </BasePlaceholderPage>
    </template>
    <div v-else>
      <div
        class="ltablet:grid-cols-3 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <BaseCard
          v-for="item in extensions"
          :key="item.product_id"
          shape="curved"
        >
          <div class="relative">
            <img
              :src="`/img/${item.image ?? 'placeholder'}.png`"
              :alt="item.title"
              class="w-full rounded-t-[10px] h-48 cover-object"
            />
            <BaseTag
              v-if="item.version !== '0.0.1'"
              flavor="solid"
              shape="curved"
              condensed
              :color="item.status ? 'success' : 'danger'"
              class="absolute -bottom-2 left-4 shadow-md"
            >
              {{ item.status ? $t('Active') : $t('Inactive') }}
            </BaseTag>
            <BaseTag
              v-if="item.version !== '0.0.1'"
              flavor="solid"
              shape="curved"
              condensed
              color="primary"
              class="absolute -bottom-2 right-4 shadow-md"
            >
              {{ item.version }}
            </BaseTag>
          </div>
          <div class="p-4 space-y-5">
            <h4
              class="text-muted-800 dark:text-muted-100 font-sans text-base font-medium"
            >
              {{ item.title }}
            </h4>
            <div class="flex items-center w-full gap-2">
              <template v-if="item.link !== null">
                <BaseButton
                  shape="curved"
                  class="w-full"
                  :to="item.link"
                  target="_blank"
                  >View</BaseButton
                >
                <BaseButton
                  shape="curved"
                  class="w-full"
                  :color="item.version !== '0.0.1' ? 'info' : 'success'"
                  :to="`/admin/system/extensions/${item.product_id?.toLowerCase()}`"
                >
                  {{ item.version !== '0.0.1' ? $t('Manage') : $t('Install') }}
                </BaseButton>
              </template>
              <template v-else>
                <BaseButton
                  shape="curved"
                  class="w-full"
                  color="muted"
                  disabled
                >
                  {{ $t('Not available yet.') }}
                </BaseButton>
              </template>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>
