<script setup lang="ts">
import type { Api, VoiceConfig } from "~/utils/types";
const toast = useToast();

const props = defineProps<{
  api: Api;
  voiceConfig: VoiceConfig;
}>();
const api = computed(() => props.api);
const voiceConfig = computed(() => props.voiceConfig);

const isLoading = ref(false);

const testText = ref("");
const audioPlayer = ref(null);
const audioBlobUrl = ref("");
function genSSML(config: VoiceConfig, text: string) {
  if (!config.voice) return;
  const pitch = config.pitch === "default" ? null : config.pitch;
  const ssml =
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="zh-CN">` +
    `<voice name="${config.voice.ShortName}">` +
    `${pitch ? `<prosody pitch="${config.pitch}">` : ""}` +
    `${config.useStyle ? `<mstts:express-as style="${config.style}">` : ""}` +
    `${testText.value ? text : "帮忙点个 Star 吧"}` +
    `${config.useStyle ? `</mstts:express-as>` : ""}` +
    `${pitch ? `</prosody>` : ""}` +
    `</voice></speak>`;
  return ssml;
}

function getTestAudio() {
  if (audioPlayer.value === null || !voiceConfig.value.voice) return;
  isLoading.value = true;
  $fetch(
    `https://${api.value.region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": api.value.key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": voiceConfig.value.format,
        "User-Agent": "TTSForLegado",
      },
      body: genSSML(voiceConfig.value, testText.value),
      responseType: "blob",
    },
  )
    .then((response) => {
      // 创建一个 Blob URL
      const audioBlob = response;
      if (audioBlobUrl.value !== "") {
        URL.revokeObjectURL(audioBlobUrl.value);
      }
      audioBlobUrl.value = URL.createObjectURL(audioBlob as Blob);

      // 绑定 Blob URL 到 <audio> 元素并播放
      if (audioPlayer.value) {
        (audioPlayer.value as HTMLAudioElement).src = audioBlobUrl.value;
      }
    })
    .catch((err) => {
      console.error("fetch audio", err);
      toast.add({
        title: "获取音频失败",
        description: "请检查 API Key 和 API Region，打开F12控制台查看详细信息",
      });
      audioBlobUrl.value = "";
      if (audioPlayer.value) {
        (audioPlayer.value as HTMLAudioElement).src = audioBlobUrl.value;
      }
    })
    .finally(() => {
      isLoading.value = false;
    });
}
</script>
<template>
  <UCard class="mb-4 lg:w-96">
    <template #header>
      <h2>📢 试听</h2>
    </template>
    <div>
      <UTextarea
        id="message"
        v-model="testText"
        :rows="4"
        placeholder="试听文字"
        class="mb-4 w-full"
      />
      <UButton :loading="isLoading" @click="getTestAudio()"> 试听 </UButton>
      <audio
        v-if="audioBlobUrl !== ''"
        controls
        :src="audioBlobUrl"
        class="mt-8"
      />
    </div>
  </UCard>
</template>
