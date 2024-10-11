<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    toolbar?: boolean
    condensed?: boolean
    horizontalScroll?: boolean
  }>(),
  {
    toolbar: true,
  },
)

const app = useAppConfig()
const { setup, currentName, isOpen } = useSidebar()
setup()

onUnmounted(() => {
  currentName.value = ''
  isOpen.value = undefined
})

const toolbarEnabled = computed(() => {
  return (
    app.tairo.sidebar?.toolbar?.enabled !== false && props.toolbar !== false
  )
})
</script>

<template>
  <div class="bg-muted-100 overflow-hidden dark:bg-gray-900 min-h-screen">
    <slot name="toolbar">
      <LayoutSidebarToolbarOnly
        v-if="toolbarEnabled"
        :horizontal-scroll="props.horizontalScroll"
      >
        <template #title><slot name="toolbar-title"></slot></template>
      </LayoutSidebarToolbarOnly>
    </slot>

    <main>
      <slot />
    </main>

    <TairoPanels />
  </div>
</template>
