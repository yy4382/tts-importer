<template>
  <ExportDefault id="iReadNote" title="爱阅记">
    <UButton
      color="gray"
      variant="solid"
      icon="i-mingcute-copy-2-line"
      @click="useCopy(voiceChoice.ifreetimeCfg, '配置')"
    >
      复制配置
    </UButton>
    <UButton
      color="gray"
      variant="solid"
      icon="i-mingcute-file-import-line"
      @click="showImportModal = true"
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
  </ExportDefault>
  <UModal v-model="showImportModal">
    <UCard>
      <template #header>
        <h3 class="text-xl font-semibold">导入到爱阅记</h3>
      </template>
      <div class="flex flex-col items-center gap-1">
        <img :src="directUrlQR" alt="二维码" />
        <span class="text-sm">用 iOS 系统相机扫码即可自动导入</span>
      </div>
      <p class="mt-4 text-sm opacity-70 text-center">感谢 CJ'sPig 提供的的语音库导入模板</p>
      <template #footer>
        <div class="flex justify-end gap-4">
          <UButton
            :to="configUrl"
            icon="i-mingcute-arrow-right-up-line"
            color="gray"
            target="_blank"
          >
            配置链接
          </UButton>
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
import type { Config4Server } from "~/utils/types";
const voiceChoice = useVoiceChoiceStore();
const settings = useSettingsStore();
const configUrl = computed(
  () =>
    window &&
    voiceChoice.voice &&
    `${window.location.protocol}//${window.location.host}/api/ireadnote` +
      `?config=${encodeURIComponent(
        JSON.stringify({
          api: settings.$state,
          voiceChoice: voiceChoice.$state,
        } satisfies Config4Server),
      )}`,
);
const directUrl = computed(() => {
  return `iReadNote://import/itts=${configUrl.value}`;
});
const directUrlQR = useQRCode(directUrl);
const showImportModal = ref(false);
</script>
