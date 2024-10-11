<script setup lang="ts">
import { useTopnav } from '../../../.app/composables/topnav'
import type { LayoutDisplay } from './TairoTopnavLayout.vue'

const props = withDefaults(
  defineProps<{
    display: LayoutDisplay
    position: 'fixed' | 'absolute'
  }>(),
  {
    display: 'expanded-md',
    position: 'absolute',
  },
)
const { menuItems, isMobileOpen } = useTopnav()
const dropdowns = ref({})
const target = ref(null)

onClickOutside(target, () => {
  Object.keys(dropdowns.value).forEach((key) => {
    dropdowns.value[key] = false
  })
})

const toggleDropdown = (index) => {
  dropdowns.value[index] = !dropdowns.value[index]
}
</script>

<template>
  <div
    class="dark:bg-muted-800 border-muted-200 dark:border-muted-700 left-0 top-0 z-40 w-full border-b bg-white transition-all duration-300"
    :class="[
      props.position === 'fixed' && 'fixed',
      props.position === 'absolute' && 'absolute',
    ]"
  >
    <nav
      class="relative"
      :class="[
        props.display === 'condensed' && 'w-full',
        props.display === 'horizontal-scroll' && 'mx-auto w-full pe-4',
        props.display === 'expanded-sm' &&
          'mx-auto w-full max-w-5xl px-4 lg:px-0',
        props.display === 'expanded-md' &&
          'mx-auto w-full max-w-6xl px-4 lg:px-0',
        props.display === 'expanded-lg' &&
          'mx-auto w-full max-w-7xl px-4 lg:px-0',
        props.display === 'expanded-xl' && 'mx-auto w-full px-4 lg:px-0',
      ]"
    >
      <div
        class="flex w-full flex-col items-center justify-between md:h-16 md:flex-row"
      >
        <div class="w-full grow md:w-auto">
          <slot></slot>
        </div>
        <div
          class="dark:bg-muted-800 fixed start-0 top-0 z-20 w-full grow items-center bg-white p-3 md:static md:z-0 md:block md:w-auto md:bg-transparent md:p-0"
          :class="isMobileOpen ? 'flex' : 'hidden'"
        >
          <div class="me-auto block md:hidden">
            <BaseButtonClose
              color="muted"
              shape="full"
              @click="isMobileOpen = false"
            />
          </div>
          <slot name="toolbar">
            <BaseButton to="#" color="primary">Get Started</BaseButton>
          </slot>
        </div>
      </div>
    </nav>
    <div
      class="flex items-center"
      :class="[
        props.display === 'condensed' && 'w-full',
        props.display === 'horizontal-scroll' && 'mx-auto w-full',
        props.display === 'expanded-sm' && 'mx-auto w-full max-w-5xl',
        props.display === 'expanded-md' && 'mx-auto w-full max-w-6xl',
        props.display === 'expanded-lg' && 'mx-auto w-full max-w-7xl',
        props.display === 'expanded-xl' && 'mx-auto w-full',
      ]"
    >
      <div class="flex overflow-x-auto">
        <template v-for="(item, index) in menuItems">
          <NuxtLink
            v-if="!item.children && !item.divider"
            :key="'item-' + index"
            :to="item.to"
            class="text-muted-400 hover:text-muted-500 dark:text-muted-500 dark:hover:text-muted-400 flex items-center justify-center border-b-2 border-transparent p-3 text-center transition-colors duration-300"
            exact-active-class="!border-primary-500 !text-muted-800 dark:!text-muted-100"
          >
            <BaseText size="sm">{{ item.name }}</BaseText>
          </NuxtLink>
          <div
            :key="'divider-' + index"
            v-else-if="item.divider"
            class="border-muted-200 dark:border-muted-700 border-r"
          ></div>
          <span
            v-else
            :key="'dropdown-' + index"
            ref="target"
            class="text-muted-400 hover:text-muted-500 dark:text-muted-500 dark:hover:text-muted-400 relative border-b-2 border-transparent text-center transition-colors duration-300"
            :class="{
              '!border-primary-500 !text-muted-800 dark:!text-muted-100':
                dropdowns[index],
            }"
            exact-active-class="!border-primary-500 !text-muted-800 dark:!text-muted-100"
          >
            <button
              @click="toggleDropdown(index)"
              class="flex w-full items-center p-3"
            >
              <BaseText size="sm">{{ item.name }}</BaseText>
              <i class="fas fa-chevron-down ml-2"></i>
            </button>

            <Transition
              enter-active-class="transition duration-100 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <div
                v-if="dropdowns[index]"
                class="border-muted-200 dark:border-muted-800 dark:bg-muted-950 shadow-muted-400/10 dark:shadow-muted-800/10 fixed z-50 mt-1 rounded-xl border bg-white shadow-xl"
              >
                <NuxtLink
                  v-for="(child, childIndex) in item.children"
                  :key="'child-' + childIndex"
                  :to="child.to"
                  exact-active-class="!bg-primary-500/10 dark:!bg-primary-500/20 !text-primary-500 dark:!text-primary-500"
                  class="py-2nui-focus text-muted-500 dark:text-muted-400/80 hover:bg-muted-100 dark:hover:bg-muted-700/60 hover:text-muted-600 dark:hover:text-muted-200 flex cursor-pointer items-center gap-4 rounded-lg p-3 transition-colors duration-300"
                >
                  <Icon :name="child.icon.name" :class="child.icon.class" />
                  <span class="whitespace-nowrap font-sans text-sm">
                    {{ child.name }}
                  </span>
                </NuxtLink>
              </div>
            </Transition>
          </span>
        </template>
      </div>
    </div>
  </div>
</template>
