<template>
  <div>
    <slot name="header">
      <label :for="id" class="label-general">{{ title }}</label>
    </slot>
    <div :id="id" class="flex items-center gap-2 pb-2"><slot></slot></div>
    <div class="text-sm text-gray-600 dark:text-gray-400">
      <slot name="help">
        {{ help }}
      </slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  title?: string;
  id?: string;
  help?: string;
}>();
</script>
