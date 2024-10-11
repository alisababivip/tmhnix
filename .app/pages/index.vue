<script setup lang="ts">
definePageMeta({
  layout: 'frontend',
})
const frontendStore = useFrontendStore()
const sectionsMap = ref<Record<string, any>>({})
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)
const frontendType = computed(() => settings.value?.frontend_type ?? 'Basic')
const customHtml = ref('')
const userStore = useUserStore()
const user = computed(() => userStore.getProfile)
const isPageLoading = ref(true)
const router = useRouter()
const customContentContainer = ref<HTMLElement | null>(null)
const config = useRuntimeConfig()
const wsUrl = config.public.appWebSocketUrl
const apiUrl = config.public.apiPath
const shouldTeleportMarketAnalysis = ref(false)

function replaceApiAndWebSocketUrls(scriptContent) {
  return scriptContent
    .replace(/ws:\/\/localhost:4000/g, wsUrl)
    .replace(/http:\/\/localhost:4000/g, apiUrl)
}

async function loadScript(src, textContent) {
  return new Promise(async (resolve, reject) => {
    const script = document.createElement('script')
    if (src) {
      try {
        const response = await fetch(src)
        const scriptContent = await response.text()
        const replacedScriptContent = replaceApiAndWebSocketUrls(scriptContent)
        script.textContent = replacedScriptContent
        resolve()
      } catch (error) {
        reject(error)
      }
    } else if (textContent) {
      const replacedScriptContent = replaceApiAndWebSocketUrls(textContent)
      script.textContent = replacedScriptContent
      resolve()
    }
    document.body.appendChild(script)
  })
}

const { getFrontendHtml } = useFrontend()

onMounted(async () => {
  if (frontendType.value === 'Basic') {
    if (frontendStore.sections.length === 0) {
      await frontendStore.fetchSections()
    }
    frontendStore.sections.forEach((section: any) => {
      sectionsMap.value[section.section] = section
    })
  } else {
    try {
      const path =
        settings.value?.frontend_path ?? `/theme/projects/template/index.html`
      const response = await getFrontendHtml(path)
      const htmlContent = await response.data.result

      // Parse the HTML content
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlContent, 'text/html')

      // Get the base path (excluding the filename)
      const basePath = path.substring(0, path.lastIndexOf('/') + 1)

      // List of directories to update
      const directories = [
        'images',
        'fonts',
        'video',
        'css',
        'js',
        'bat',
        'mash',
        'audio',
      ]

      // Update the src/href for relevant tags
      directories.forEach((dir) => {
        const selector = `[src^="${dir}/"], [href^="${dir}/"], [data-slide-bg^="${dir}/"]`
        doc.querySelectorAll(selector).forEach((el) => {
          // Determine which attribute to update
          const attrsToUpdate = ['src', 'href', 'data-slide-bg']
          attrsToUpdate.forEach((attr) => {
            if (el.hasAttribute(attr)) {
              el.setAttribute(attr, basePath + el.getAttribute(attr))
            }
          })
        })
      })

      // Update the src/href for relevant tags
      function updateStyleUrls(el, baseUrl) {
        let style = el.getAttribute('style')
        if (style) {
          style = style.replace(/url\(['"]?(.*?)['"]?\)/g, (match, url) => {
            // Check if the URL is relative and needs the base path
            if (
              !url.startsWith('http://') &&
              !url.startsWith('https://') &&
              !url.startsWith('//')
            ) {
              return `url(${baseUrl}${url})`
            }
            return match
          })
          el.setAttribute('style', style)
        }
      }

      // Update URLs within style attributes
      doc
        .querySelectorAll('[style]')
        .forEach((el) => updateStyleUrls(el, basePath))

      // Convert the document back to a string
      customHtml.value = doc.documentElement.outerHTML

      await nextTick() // Ensure the DOM is updated with the new HTML content

      const jQueryScript = doc.querySelector('script[src*="jquery"]')
      jQueryScript?.parentNode?.removeChild(jQueryScript)
      if (jQueryScript) {
        try {
          const jQueryModule = await import('jquery')
          window.$ = window.jQuery = jQueryModule.default
          await import('jquery-migrate')
          jQuery.migrateMute = true
        } catch (error) {
          console.error('Error loading jQuery: ', error)
        }
      }

      const coreScript = doc.querySelector('script[src*="core"]')
      coreScript?.parentNode?.removeChild(coreScript)
      if (coreScript) {
        try {
          await loadScript(coreScript.src, coreScript.text)
        } catch (error) {
          console.error('Error loading core script: ', error)
        }
      }

      // Handle other scripts
      const otherScripts = Array.from(doc.querySelectorAll('script')).filter(
        (script) => script !== coreScript && script !== jQueryScript,
      )

      // Remove the original script elements to avoid duplicate execution
      otherScripts.forEach((script) => script.parentNode?.removeChild(script))

      await nextTick()

      // Re-create and append other script elements
      for (const script of otherScripts) {
        try {
          await loadScript(script.src, script.text)
        } catch (error) {
          console.error('Error loading script: ', error)
        }
      }

      const marketsOverviewContainer = document.getElementById(
        'markets-overview-container',
      )
      if (marketsOverviewContainer) {
        shouldTeleportMarketAnalysis.value = true
      }
    } catch (error) {
      console.error('Error fetching and processing HTML content:', error)
    }

    await nextTick()

    const containerElement = document.getElementById('frontend')
    if (containerElement) {
      replaceElementsWithRouterLinks(containerElement, router)
    }
    isPageLoading.value = false
  }
})

function replaceElementsWithRouterLinks(container, router) {
  const clickableElements = container.querySelectorAll('a, .nuxt-link-button')

  clickableElements.forEach((element) => {
    const href =
      element.tagName === 'A'
        ? element.getAttribute('href')
        : element.getAttribute('data-nuxt-link')
    if (href && !href.startsWith('http') && !href.startsWith('//')) {
      element.addEventListener('click', (event) => {
        event.preventDefault()
        router.push(href)
      })
    }
  })
}

const isBannerVisible = computed(
  () => sectionsMap.value.banner?.status ?? false,
)
const isFeaturesVisible = computed(
  () => sectionsMap.value.features?.status ?? false,
)
const isMarketsVisible = computed(
  () => sectionsMap.value.markets?.status ?? false,
)
const isOnboardingVisible = computed(
  () => sectionsMap.value.steps?.status ?? false,
)
const isFooterVisible = computed(
  () => sectionsMap.value.footer?.status ?? false,
)
const isAnimatedBgVisible = computed(
  () => sectionsMap.value.animated_bg?.status ?? false,
)
const callToActionVisible = computed(
  () => sectionsMap.value.call_to_action?.status ?? false,
)
</script>

<template>
  <div class="relative" v-if="frontendType === 'Basic'">
    <div class="animated-bg w-full flex-col">
      <FrontendAnimatedBg v-if="isAnimatedBgVisible" />
      <FrontendBanner v-if="isBannerVisible" />
      <FrontendMarkets v-if="isMarketsVisible" />
      <FrontendFeatures v-if="isFeaturesVisible" />
      <FrontendOnboarding v-if="isOnboardingVisible" />
      <FrontendCallToAction v-if="callToActionVisible" />
      <FrontendFooter v-if="isFooterVisible" />
    </div>
  </div>
  <template v-else>
    <div>
      <div
        v-if="user?.role?.name === 'Super Admin'"
        class="absolute top-0 z-50 flex h-8 w-full items-center justify-between bg-[#1D2327] px-4 py-2 text-sm"
      >
        <!-- Left side content, e.g., site name or logo -->
        <div class="flex items-center justify-start gap-4">
          <div class="flex items-center justify-start gap-2">
            <Icon name="vaadin:dashboard" class="h-4 w-4" />
            <a href="/admin" class="text-white no-underline hover:underline">{{
              settings?.site_name
            }}</a>
          </div>
          <div class="flex items-center justify-start gap-2">
            <Icon name="dashicons:admin-appearance" class="h-4 w-4" />
            <a
              href="/admin/appearance"
              class="text-white no-underline hover:underline"
              >Appearance</a
            >
          </div>
        </div>

        <!-- Right side content, e.g., user info, logout button -->
        <div>
          <!-- You can use `user` variable here to show user info -->
          <span class="text-white"
            >Howdy,
            <NuxtLink to="/user/profile-edit">{{
              user?.first_name
            }}</NuxtLink></span
          >
        </div>
      </div>
      <div v-if="isPageLoading" class="page-loader">
        <Icon
          name="svg-spinners:blocks-shuffle-3"
          class="text-info-500 h-16 w-16"
        />
      </div>
      <div
        ref="customContentContainer"
        :class="{
          'xs-0 lg:mt-8': user?.role?.name === 'Super Admin',
        }"
        id="frontend"
        v-html="customHtml"
      ></div>
      <Teleport
        to="#markets-overview-container"
        v-if="shouldTeleportMarketAnalysis"
      >
        <MarketAnalysis :is-bootstrap="true" />
      </Teleport>
    </div>
  </template>
</template>

<style>
.page-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.92);
  z-index: 10000;
}
</style>
