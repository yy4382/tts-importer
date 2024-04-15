<script setup lang="ts">
import type { Api, VoiceConfig } from "~/utils/types";
const toast = useToast();

const props = defineProps<{
  api: Api;
  voiceConfig: VoiceConfig;
}>();
const api = computed(() => props.api);
const voiceConfig = computed(() => props.voiceConfig);

function copyLegadoConfig() {
  const config = genLegado(api.value, voiceConfig.value);
  try {
    navigator.clipboard.writeText(config);
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

function copyLegadoLink() {
  const config = genLegado(api.value, voiceConfig.value);
  const link = `${window.location.protocol}//${window.location.host}/api/legado?config=${encodeURIComponent(config)}`;
  try {
    navigator.clipboard.writeText(link);
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

function import2Legado() {
  const config = genLegado(api.value, voiceConfig.value);
  const link = `${window.location.protocol}//${window.location.host}/api/legado?config=${encodeURIComponent(config)}`;
  const legadoLink = `legado://import/httpTTS?src=${encodeURIComponent(link)}`;
  window.open(legadoLink, "_blank");
}

function copyAiyueConfig() {
  const config = genAiyue(api.value, voiceConfig.value);
  try {
    navigator.clipboard.writeText(config);
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

function import2Aiyue() {
  if (!voiceConfig.value.voice) {
    alert("请选择声音");
    return {};
  }
  const config = JSON.stringify({ api: api.value, vconfig: voiceConfig.value });
  const link = `${window.location.protocol}//${window.location.host}/api/ireadnote?config=${encodeURIComponent(config)}`;
  const aiyueLink = `iReadNote://import/itts=${link}`;
  window.open(aiyueLink, "_blank");
}

function copySourceReaderLink() {
  let config = JSON.parse(genLegado(api.value, voiceConfig.value));
  config = [config];
  config = JSON.stringify(config);
  const link = `${window.location.protocol}//${window.location.host}/api/legado?config=${encodeURIComponent(config)}`;
  try {
    navigator.clipboard.writeText(link);
  } catch (err) {
    console.error(err);
    alert("复制失败，请手动复制");
  }
}
function downloadSourceReaderFile() {
  if (!voiceConfig.value.voice) {
    alert("请选择声音");
    return;
  }
  let config = JSON.parse(genLegado(api.value, voiceConfig.value));
  const title = `Azure ${voiceConfig.value.voice.LocalName}${voiceConfig.value.style || ""}${voiceConfig.value.pitch === "default" ? "" : " - " + voiceConfig.value.pitch}`;
  config = [config];
  config = JSON.stringify(config);
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

<template>
  <UCard class="mb-4 lg:w-96">
    <template #header>
      <h2 >📤 导出</h2>
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
    <div>
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
  </UCard>
</template>
