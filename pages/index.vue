<template>
  <div
    class="mx-auto mb-auto flex flex-grow flex-col px-4 md:flex-row md:gap-4"
  >
    <ClientOnly>
      <div>
        <ChoicePanel />
        <ExportPanel />
      </div>
      <div>
        <TryListen />
        <ApiSettings />
      </div>
    </ClientOnly>
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
