<template>
  <UButton
    color="gray"
    variant="solid"
    class="mr-1"
    icon="i-mingcute-copy-2-line"
    @click="copyAiyueConfig"
  >
    复制配置
  </UButton>
  <UButton
    color="gray"
    variant="solid"
    class="mr-1"
    icon="i-mingcute-file-import-line"
    @click="import2Aiyue"
  >
    导入
  </UButton>
  <UButton
    color="gray"
    variant="solid"
    to="/help/ireadnote"
    icon="i-mingcute-book-2-line"
  >
    教程
  </UButton>
  <UModal v-model="showImportModal">
    <UCard>
      <img :src="directUrlQR" alt="二维码" />
      <span>用 iOS 系统相机扫码即可自动导入</span>
      <UButton
        :to="importUrl"
        icon="i-mingcute-arrow-right-up-line"
        color="gray"
        target="_blank"
        >查看配置</UButton
      >
      <UTextarea :value="importUrl" readonly />
      <UButton icon="i-mingcute-copy-2-line" @click="useCopy(importUrl)"
        >复制一键导入链接</UButton
      >
      <UButton :to="directUrl" icon="i-mingcute-file-import-line"
        >一键导入</UButton
      >
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
import { useQRCode } from "@vueuse/integrations/useQRCode";
const toast = useToast();
const voiceChoice = useVoiceChoiceStore();
const settings = useSettingsStore();
const importUrl = ref("");
const directUrl = computed(() => {
  return `iReadNote://import/itts=${importUrl.value}`;
});
const directUrlQR = useQRCode(directUrl);
const showImportModal = ref(false);
function copyAiyueConfig() {
  const config = voiceChoice.ifreetimeCfg;
  if (config) useCopy(config);
}

function import2Aiyue() {
  if (!voiceChoice.voice) {
    toast.add({
      title: "请先选择声音",
    });
    return {};
  }
  const config = JSON.stringify({
    api: settings,
    vconfig: voiceChoice.stringify,
  });
  importUrl.value = `${window.location.protocol}//${window.location.host}/api/ireadnote?config=${encodeURIComponent(config)}`;
  showImportModal.value = true;
}
</script>
