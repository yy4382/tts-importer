<template>
  <nav
    class="mx-auto flex w-[calc(100vw-1rem)] max-w-screen-xl items-center justify-between rounded-b-lg bg-stone-100 p-4 shadow dark:bg-gray-900"
  >
    <ULink
      to="/"
      class="flex items-center space-x-3 md:flex-1 rtl:space-x-reverse"
    >
      <img src="~/assets/favicon.svg" class="h-8" alt="Azure TTS logo" />
      <span
        class="self-center whitespace-nowrap text-lg font-semibold md:text-2xl dark:text-white"
        >TTS Importer</span
      >
    </ULink>
    <div class="flex items-center justify-center space-x-4">
      <ULink
        to="/"
        active-class="text-primary"
        inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      >
        导入器
      </ULink>
      <ULink
        to="/help"
        active-class="text-primary"
        inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      >
        帮助
      </ULink>
    </div>
    <div class="flex items-center justify-end space-x-1 md:flex-1">
      <UButton
        icon="i-mingcute-github-line"
        color="primary"
        square
        variant="ghost"
        to="https://github.com/yy4382/tts-importer"
      />
    </div>
  </nav>
</template>
