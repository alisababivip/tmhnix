<script setup lang="ts">
const app = useAppConfig()
const route = useRoute()
const userStore = useUserStore()
const user = computed(() => userStore.getProfile)
const logoUrl = computed(() => getLogoUrl())

const getLogoUrl = () => {
  switch (route.path.split('/')[1]) {
    case 'trade':
      return '/user'
    case 'binary':
      return '/user/binary'
    case 'forex':
      return '/user/forex'
    case 'ai-trading':
      return '/user/ai-trading'
    default:
      return '/user'
  }
}
</script>

<template>
  <div
    class="flex h-16 items-center gap-2 py-3 px-4 supports-backdrop-blur:bg-white/60 fixed top-0 z-40 w-full border-b navbarBgColor backdrop-blur transition-colors duration-500 dark:border-slate-50/[0.06] lg:z-50 lg:border-b lg:border-slate-900/10"
  >
    <slot name="logo">
      <NuxtLink :to="logoUrl" class="flex items-center justify-center gap-2">
        <component
          v-if="$viewport.isGreaterOrEquals('xs')"
          :is="
            resolveComponentOrNative(
              app.tairo.sidebar?.navigation.fulllogo.component,
            )
          "
          v-bind="app.tairo.sidebar?.navigation.fulllogo.props"
        ></component>
        <component
          v-else
          :is="
            resolveComponentOrNative(
              app.tairo.sidebar?.navigation.logo.component,
            )
          "
          v-bind="app.tairo.sidebar?.navigation.logo.props"
        ></component>
        <NuxtLink
          :to="userStore.isLoggedIn ? '/user' : '/'"
          v-if="$route.path !== '/'"
        >
          <BaseButtonIcon shape="full">
            <Icon name="carbon:home" class="h-5 w-5" />
          </BaseButtonIcon>
        </NuxtLink>
      </NuxtLink>
    </slot>
    <BaseHeading
      v-if="app.tairo.sidebar?.toolbar?.showTitle"
      as="h1"
      size="2xl"
      weight="light"
      class="text-muted-800 hidden dark:text-white md:block"
    >
      <slot name="title">{{ route.meta.title }}</slot>
    </BaseHeading>

    <div class="ms-auto"></div>
    <TairoSidebarTools class="h-12" v-if="user && user?.id" />
    <template v-else>
      <component
        :is="
          resolveComponentOrNative(
            app.tairo.sidebar?.toolbar?.tools[0].component,
          )
        "
        v-if="app.tairo.sidebar?.toolbar?.tools[0].component"
        :key="app.tairo.sidebar?.toolbar?.tools[0].component"
        v-bind="app.tairo.sidebar?.toolbar?.tools[0].props"
      />
      <BaseButton variant="primary" size="sm" class="h-12" to="/login">
        <Icon name="solar:login-line-duotone" class="w-5 h-5" />
        <span class="ml-2">{{ $t('Login') }}</span>
      </BaseButton>
    </template>
  </div>
</template>
