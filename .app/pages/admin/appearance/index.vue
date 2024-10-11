<script setup lang="ts">
definePageMeta({
  permissions: ['Access Appearance'],
  title: 'Appearance',
  layout: 'empty',
})

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = resolve
    script.onerror = reject
    document.body.appendChild(script)
  })
}

function getCookie(name) {
  const matches = document.cookie.match(
    new RegExp(
      '(?:^|; )' +
        name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') +
        '=([^;]*)',
    ),
  )
  return matches ? decodeURIComponent(matches[1]) : undefined
}

onMounted(async () => {
  loadCss('/theme/css/style.css?' + new Date().getTime())

  const isCookieEnabled = navigator.cookieEnabled
  let id = ''

  if (isCookieEnabled && getCookie('justupdated')) {
    id = '?' + new Date().getTime()
  }

  try {
    await loadScript('/theme/js/code-editor/ace/ace.js' + id)
    await loadScript('/theme/js/code-editor/ace/ext-emmet.js' + id)
    await loadScript('/theme/js/code-editor/emmet.js' + id)
    await loadScript('/theme/js/builder.min.js' + id)
  } catch (e) {
    console.error('Error loading scripts: ', e)
  }

  await new Promise((resolve) => setTimeout(resolve, 500))
  replaceWithNuxtLink()

  // Load CSS with a timestamp to prevent caching
})

const router = useRouter()
function replaceWithNuxtLink() {
  const returnHomeLink = document.getElementById('return-home')
  if (returnHomeLink) {
    returnHomeLink.addEventListener('click', (event) => {
      event.preventDefault()
      const href = returnHomeLink.getAttribute('href')
      if (href) {
        router.push(href)
      }
    })
  }
}

function loadCss(href) {
  const link = document.createElement('link')
  link.href = href
  link.type = 'text/css'
  link.rel = 'stylesheet'
  document.head.appendChild(link)
}
</script>

<template>
  <div id="builder"></div>
</template>
