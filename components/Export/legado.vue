<template>
  <ExportDefault id="legadoButton" title="阅读(legado)">
    <UButton
      color="gray"
      variant="solid"
      icon="i-mingcute-copy-2-line"
      @click="useCopy(config)"
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
    <template #help>
      同样对服务器版阅读 (<a href="https://github.com/hectorqin/reader"
        >hectorqin/reader</a
      >) 有效，只需复制配置之后粘贴到服务器版阅读的配置框即可。
    </template>
  </ExportDefault>
  <UModal v-model="showImportModal">
    <UCard>
      <template #header>
        <h3 class="text-xl font-semibold">导入到阅读</h3>
      </template>
      <div class="flex flex-col items-center gap-1">
        <img :src="directUrlQR" alt="二维码" />
        <span class="text-sm">用系统相机扫码即可自动导入</span>
      </div>
      <template #footer>
        <div class="flex justify-end gap-4">
          <UButtonGroup>
            <UButton
              :to="configUrl"
              icon="i-mingcute-arrow-right-up-line"
              color="gray"
              target="_blank"
            >
              配置链接
            </UButton>
            <UButton
              icon="i-mingcute-copy-2-line"
              color="gray"
              square
              @click="useCopy(configUrl || '', '配置链接')"
            >
            </UButton>
          </UButtonGroup>
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
              @click="useCopy(directUrl || '', '一键导入链接')"
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
const config = computed(() => voiceChoice.legadoCfg);
const configUrl = computed(
  () =>
    window &&
    `${window.location.protocol}//${window.location.host}/api/legado` +
      `?config=${encodeURIComponent(
        JSON.stringify({
          api: settings.$state,
          voiceChoice: voiceChoice.$state,
        } satisfies Config4Server),
      )}`,
);
const directUrl = computed(
  () =>
    configUrl.value &&
    `legado://import/httpTTS?src=${encodeURIComponent(configUrl.value)}`,
);
const directUrlQR = useQRCode(directUrl.value || "");
const showImportModal = ref(false);
</script>
