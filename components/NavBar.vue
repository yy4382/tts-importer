<template>
    <nav class="bg-white border-gray-200 dark:bg-gray-900">
        <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
            <a href="#" class="flex items-center space-x-3 rtl:space-x-reverse">
                <img src="~/assets/favicon.svg" class="h-8" alt="Azure TTS logo" />
                <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">TTS Importer</span>
            </a>
            <github-button href="https://github.com/yy4382/tts-importer"
                data-color-scheme="no-preference: light; light: light; dark: dark;" data-size="large"
                aria-label="Star yy4382/tts-importer on GitHub">Star</github-button>
        </div>
    </nav>
</template>

<script setup lang="ts">
import GithubButton from 'vue-github-button'
</script>