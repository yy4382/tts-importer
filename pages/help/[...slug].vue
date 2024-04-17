<script setup lang="ts">
const { data } = await useAsyncData("all", () => queryContent("/").find());
const dataDoc = computed(() => {
  return data.value?.map((item) => ({ label: item.title, to: item._path }));
});
</script>

<template>
  <main class="flex-grow self-center">
    <UCard class="w-[calc(100vw-2rem)] md:w-[48rem]">
      <template #header>
        <h1 class="mb-0 text-4xl font-bold">帮助</h1>
      </template>
      <span class="text-gray-700 dark:text-gray-400 text-sm">目录</span>
      <UVerticalNavigation :links="dataDoc" class="mb-8" />
      <ContentDoc
        class="prose dark:prose-invert prose-code:before:content-none prose-code:after:content-none font-sans"
      />
    </UCard>
  </main>
</template>

<style>
h2 > a {
  text-decoration: none !important;
}
</style>
