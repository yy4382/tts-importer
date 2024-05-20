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
    <template #trailing>
      <UIcon name="i-mingcute-arrow-right-up-line" class="-ml-1 h-4 w-4" />
    </template>
  </UButton>
  <UModal v-model="showImportModal">
    <UCard>
      <template #header>
        <h3 class="text-xl font-semibold">导入到爱阅记</h3>
      </template>
      <div class="flex flex-col items-center gap-1">
        <img :src="directUrlQR" alt="二维码" />
        <span class="text-sm">用 iOS 系统相机扫码即可自动导入</span>
      </div>
      <template #footer>
        <div class="flex justify-end gap-4">
          <UButton
            :to="importUrl"
            icon="i-mingcute-arrow-right-up-line"
            color="gray"
            target="_blank"
            >查看配置</UButton
          >
          <UButtonGroup>
            <UButton
              :to="directUrl"
              icon="i-mingcute-file-import-line"
              color="white"
            >
              一键导入
            </UButton>
            <UButton
              icon="i-mingcute-copy-2-line"
              color="gray"
              square
              @click="useCopy(directUrl, '一键导入链接')"
            >
            </UButton>
          </UButtonGroup>
        </div>
      </template>
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
    api: settings.$state,
    vconfig: voiceChoice.$state,
  });
  importUrl.value = `${window.location.protocol}//${window.location.host}/api/ireadnote?config=${encodeURIComponent(config)}`;
  showImportModal.value = true;
}
</script>
