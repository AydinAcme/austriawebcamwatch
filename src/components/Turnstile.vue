<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const SITE_KEY = '0x4AAAAAAGWzHKLfMVIiu8mK'

const token = defineModel<string>({ default: '' })
const container = ref<HTMLElement | null>(null)
let widgetId: string | undefined

let scriptLoading: Promise<void> | undefined

function loadScript(): Promise<void> {
  scriptLoading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.onload = () => resolve()
    script.onerror = reject
    document.head.appendChild(script)
  })
  return scriptLoading
}

onMounted(async () => {
  await loadScript()
  widgetId = window.turnstile.render(container.value, {
    sitekey: SITE_KEY,
    size: 'flexible',
    callback: (value: string) => { token.value = value },
    'expired-callback': () => { token.value = '' },
  })
})

onBeforeUnmount(() => {
  if (widgetId) {
    window.turnstile.remove(widgetId)
  }
})

function reset() {
  token.value = ''
  if (widgetId) {
    window.turnstile.reset(widgetId)
  }
}

defineExpose({ reset })
</script>

<template>
  <div ref="container" />
</template>
