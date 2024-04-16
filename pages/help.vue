<script setup lang="ts"></script>

<template>
  <main class="flex-grow self-center">
    <UCard
      class="w-[calc(100vw-2rem)] md:w-[48rem] prose dark:prose-invert prose-code:before:content-none prose-code:after:content-none"
    >
      <template #header>
        <h1 class="mb-0">帮助</h1>
      </template>
      <ContentDoc path="/help" />
    </UCard>
  </main>
</template>

<style>
h2 > a {
  text-decoration: none !important;
}
</style>
