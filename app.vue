<template>
  <div class="flex flex-col min-h-screen bg-stone-200 dark:bg-gray-900">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
useHead({  link: [//网站link，可以在这里引入css和icon等
    { rel: 'shortcut icon', href: '/favicon.png' },
    { rel: 'apple-touch-icon', href: '/favicon.png' }
  ]
})
useSeoMeta({
  title: 'Azure TTS Importer',
  ogTitle: 'Azure TTS Importer',
  description: '轻松将微软 Azure TTS 导入到小说软件',
  ogDescription: '轻松将微软 Azure TTS 导入到小说软件',
  ogImage: '/favicon.png',
  twitterCard: 'summary_large_image',
})
</script>