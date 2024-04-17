<script setup lang="ts">
import type { Api, VoiceConfig } from "~/utils/types";
const toast = useToast();

const props = defineProps<{
  api: Api;
  voiceConfig: VoiceConfig;
}>();
const api = computed(() => props.api);
const voiceConfig = computed(() => props.voiceConfig);

function copyText(text: string) {
  try {
    navigator.clipboard.writeText(text);
  } catch (err) {
    console.error(err);
    toast.add({
      title: "复制失败",
      description: "请使用更现代的浏览器",
    });
    return;
  }
  toast.add({
    title: "复制成功",
    description: "已复制配置到剪贴板",
  });
}
enum ConfigType {
  AiYue,
  Legado,
  SourceReader,
}
function getConfig(configType: ConfigType): string | undefined {
  try {
    switch (configType) {
      case ConfigType.AiYue:
        return genAiyue(api.value, voiceConfig.value);
      case ConfigType.Legado:
        return genLegado(api.value, voiceConfig.value);
      case ConfigType.SourceReader: {
        let config = JSON.parse(genLegado(api.value, voiceConfig.value));
        config = [config];
        return JSON.stringify(config);
      }
    }
  } catch (err) {
    toast.add({ title: (err as Error).message });
  }
}

function copyLegadoConfig() {
  const config = getConfig(ConfigType.Legado);
  if (config) copyText(config);
}

function copyLegadoLink() {
  const config = getConfig(ConfigType.Legado);
  if (!config) return;
  const link = `${window.location.protocol}//${window.location.host}/api/legado?config=${encodeURIComponent(config)}`;
  copyText(link);
}

function import2Legado() {
  const config = getConfig(ConfigType.Legado);
  if (!config) return;
  const link = `${window.location.protocol}//${window.location.host}/api/legado?config=${encodeURIComponent(config)}`;
  const legadoLink = `legado://import/httpTTS?src=${encodeURIComponent(link)}`;
  window.open(legadoLink, "_blank");
}

function copyAiyueConfig() {
  const config = getConfig(ConfigType.AiYue);
  if (config) copyText(config);
}

function import2Aiyue() {
  if (!voiceConfig.value.voice) {
    toast.add({
      title: "请先选择声音",
    });
    return {};
  }
  const config = JSON.stringify({ api: api.value, vconfig: voiceConfig.value });
  const link = `${window.location.protocol}//${window.location.host}/api/ireadnote?config=${encodeURIComponent(config)}`;
  const aiyueLink = `iReadNote://import/itts=${link}`;
  window.open(aiyueLink, "_blank");
}

function copySourceReaderLink() {
  const config = getConfig(ConfigType.SourceReader);
  if (!config) return;
  const link = `${window.location.protocol}//${window.location.host}/api/legado?config=${encodeURIComponent(config)}`;
  copyText(link);
}
function downloadSourceReaderFile() {
  const config = getConfig(ConfigType.SourceReader);
  if (!config) return;
  const title = `Azure ${voiceConfig.value.voice!.LocalName}${voiceConfig.value.style || ""}${voiceConfig.value.pitch === "default" ? "" : " - " + voiceConfig.value.pitch}`;
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
// function copyIFreeTimeSSML() {
//   const config = getConfig(ConfigType.AiYue);
//   if (!config) return;
//   const configObj = JSON.parse(config) as any;
//   const ssml = configObj.ttsHandles[0].params.text;
//   if (ssml) copyText(ssml);
// }
</script>

<template>
  <UCard class="mb-4 lg:w-96">
    <template #header>
      <h2>📤 导出</h2>
    </template>
    <div class="mb-4">
      <label for="legadoButton" class="label-general">阅读(legado)</label>
      <div
        id="legadoButton"
        class="inline-flex rounded-md shadow-sm"
        role="group"
      >
        <UButton
          color="gray"
          variant="solid"
          class="mr-1"
          @click="copyLegadoConfig"
        >
          复制配置
        </UButton>
        <UButton
          color="gray"
          variant="solid"
          class="mr-1"
          @click="copyLegadoLink"
        >
          复制网络导入链接
        </UButton>
        <UButton
          color="gray"
          variant="solid"
          class="mr-1"
          @click="import2Legado"
        >
          一键导入
        </UButton>
      </div>
    </div>
    <div class="mb-4">
      <label for="AiyueButton" class="label-general">爱阅记</label>
      <div id="AiyueButton">
        <UButton
          color="gray"
          variant="solid"
          class="mr-1"
          @click="copyAiyueConfig"
          >复制配置</UButton
        >
        <UButton color="gray" variant="solid" @click="import2Aiyue"
          >一键导入</UButton
        >
      </div>
    </div>
    <div class="mb-4">
      <label for="sourceReaderButton" class="label-general">源阅读</label>
      <div id="sourceReaderButton">
        <UButton
          color="gray"
          variant="solid"
          class="mr-1"
          @click="copySourceReaderLink"
        >
          复制网络导入链接
        </UButton>
        <UButton color="gray" variant="solid" @click="downloadSourceReaderFile">
          下载导入文件
        </UButton>
      </div>
    </div>
    <div>
      <label for="ifreetimeButton" class="label-general">爱阅书香</label>
      <div id="ifreetimeButton">
        <!-- <UButton
          color="gray"
          variant="solid"
          class="mr-1"
          @click="copyIFreeTimeSSML"
        >
          复制 SSML
        </UButton> -->
        <UButton
          color="white"
          variant="solid"
          to="/help#%E7%88%B1%E9%98%85%E4%B9%A6%E9%A6%99%E5%AF%BC%E5%85%A5"
          size="xs"
        >
          查看导入教程
          <template #trailing>
            <UIcon name="i-heroicons-arrow-right-20-solid" class="w-5 h-5" />
          </template>
        </UButton>
      </div>
    </div>
  </UCard>
</template>
