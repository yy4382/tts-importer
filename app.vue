<template>
  <div class="flex flex-col min-h-screen bg-stone-200 dark:bg-gray-950">
    <div class="flex flex-col min-h-screen space-y-6">
      <NavBar />
      <NuxtPage />
      <IFooter />
    </div>
    <UNotifications />
  </div>
</template>

<script setup lang="ts">
const script =
  process.env.NODE_ENV === "production"
    ? [
        {
          defer: true,
          src: "https://analy.yfi.moe/script.js",
          "data-website-id": "dc186793-78e6-4d5c-b535-66ae59b7e63b",
        },
      ]
    : undefined;
useHead({
  link: [
    // 网站link，可以在这里引入css和icon等
    { rel: "shortcut icon", href: "/favicon.png" },
    { rel: "apple-touch-icon", href: "/favicon.png" },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon.png",
    },
  ],
  script,
});
useSeoMeta({
  title: "Azure TTS Importer 听书导入器",
  ogTitle: "Azure TTS Importer",
  description: "轻松将微软 Azure TTS 导入到小说软件",
  ogDescription: "轻松将微软 Azure TTS 导入到小说软件",
  ogImage: "/og-image.png",
  twitterCard: "summary_large_image",
  twitterDescription: "轻松将微软 Azure TTS 导入到小说软件",
  twitterImageAlt: "Azure TTS Importer",
  twitterTitle: "Azure TTS Importer 听书导入器",
});
</script>
