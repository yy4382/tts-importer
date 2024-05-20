<template>
  <div
    class="mx-auto mb-auto flex flex-grow flex-col px-4 md:flex-row md:gap-4"
  >
    <div>
      <ClientOnly><ChoicePanel /></ClientOnly>
      <ExportPanel />
    </div>
    <div>
      <TryListen />
      <ClientOnly><ApiSettings /></ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "TTS Importer",
  meta: [
    {
      name: "description",
      content: "Azure TTS Importer",
    },
  ],
});
</script>
