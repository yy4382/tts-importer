<script setup lang="ts"></script>

<template>
  <UCard class="mb-4 max-w-xl">
    <template #header>
      <h2>📤 导入</h2>
    </template>
    <div class="flex flex-col gap-4">
      <ExportLegado />
      <ExportIReadNote />
      <ExportSourceReader />
      <ExportDefault id="ifreetimeButton" title="爱阅书香">
        <UButton
          color="gray"
          variant="solid"
          to="/help/ifreetime"
          icon="i-mingcute-book-2-line"
        >
          教程
          <template #trailing>
            <UIcon
              name="i-mingcute-arrow-right-up-line"
              class="-ml-1 h-4 w-4"
            />
          </template>
        </UButton>
      </ExportDefault>
    </div>
  </UCard>
</template>
