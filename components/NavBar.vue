<template>
  <nav
    class="bg-stone-100 dark:bg-gray-900 shadow mx-auto w-[calc(100vw-1rem)] rounded-b-lg flex items-center justify-between p-4 max-w-screen-xl"
  >
    <ULink
      to="/"
      class="md:flex-1 flex items-center space-x-3 rtl:space-x-reverse"
    >
      <img src="~/assets/favicon.svg" class="h-8" alt="Azure TTS logo" >
      <span
        class="self-center text-lg md:text-2xl font-semibold whitespace-nowrap dark:text-white"
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
    <div class="md:flex-1 flex items-center justify-end space-x-1">
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
