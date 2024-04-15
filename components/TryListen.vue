<script setup lang="ts">
import type { Api, VoiceConfig } from "~/utils/types";
const toast = useToast();

const props = defineProps<{
  api: Api;
  voiceConfig: VoiceConfig;
}>();
const api = computed(() => props.api);
const voiceConfig = computed(() => props.voiceConfig);

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
  if (audioPlayer === null || !voiceConfig.value.voice) return;
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
    });
}
</script>
<template>
  <UCard class="mb-4 lg:w-96">
    <template #header>
      <h2 class="text-4xl font-extrabold dark:text-white">📢 试听</h2>
    </template>
    <div>
      <textarea
        id="message"
        v-model="testText"
        rows="4"
        class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 my-4"
        placeholder="试听文字"
      ></textarea>
      <UButton @click="getTestAudio()">
        试听
      </UButton>
      <audio
        v-if="audioBlobUrl !== ''"
        controls
        :src="audioBlobUrl"
        class="mt-8"
      ></audio>
    </div>
  </UCard>
</template>
