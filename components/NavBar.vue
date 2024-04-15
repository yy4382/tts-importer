<template>
  <nav
    class="bg-stone-100 dark:bg-gray-900 shadow mx-auto w-[calc(100vw-1rem)] rounded-b-lg flex flex-wrap items-center justify-between p-4 max-w-screen-xl"
  >
    <a href="#" class="flex items-center space-x-3 rtl:space-x-reverse">
      <img src="~/assets/favicon.svg" class="h-8" alt="Azure TTS logo" />
      <span
        class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white"
        >TTS Importer</span
      >
    </a>
    <github-button
      href="https://github.com/yy4382/tts-importer"
      data-color-scheme="no-preference: light; light: light; dark: dark;"
      data-size="large"
      aria-label="Star yy4382/tts-importer on GitHub"
      data-show-count="true"
    >
      Star
    </github-button>
  </nav>
</template>

<script setup lang="ts">
import GithubButton from "vue-github-button";
</script>
