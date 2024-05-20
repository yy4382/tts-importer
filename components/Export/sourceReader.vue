<template>
  <ExportDefault id="sourceReaderButton" title="源阅">
    <UButton
      color="gray"
      variant="solid"
      icon="i-mingcute-file-import-line"
      @click="showImportModal = true"
    >
      导入
    </UButton>
  </ExportDefault>
  <UModal v-model="showImportModal">
    <UCard>
      <template #header>
        <h3 class="text-xl font-semibold">导入到源阅（读）</h3>
      </template>
      <div class="flex flex-col items-center gap-1">
        <img :src="configQR" alt="二维码" />
        <span class="text-sm">
          需要用源阅读语音管理界面右上角菜单中的二维码扫描功能 (Beta)
        </span>
      </div>
      <template #footer>
        <div class="flex justify-end gap-4">
          <UButton
            color="gray"
            variant="solid"
            icon="i-mingcute-copy-2-line"
            @click="useCopy(configUrl, '配置链接')"
          >
            复制配置链接
          </UButton>
          <UButton
            color="gray"
            variant="solid"
            icon="i-mingcute-download-2-line"
            @click="downloadSourceReaderFile"
          >
            下载导入文件
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
import { useQRCode } from "@vueuse/integrations/useQRCode";
const voiceChoice = useVoiceChoiceStore();
const configUrl = computed(
  () =>
    window &&
    `${window.location.protocol}//${window.location.host}/api/legado?config=${encodeURIComponent(voiceChoice.sourceReaderCfg)}`,
);
const configQR = useQRCode(configUrl);
const showImportModal = ref(false);
function downloadSourceReaderFile() {
  const config = voiceChoice.sourceReaderCfg;
  if (!config) return;
  const title = voiceChoice.configName;
  const blob = new Blob([config], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement("a");
  downloadAnchor.href = url;
  downloadAnchor.download = title + ".json"; // 指定下载文件的名称
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
  URL.revokeObjectURL(url);
}
</script>
