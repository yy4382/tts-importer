<template>
  <div>
    <NavBar />
    <div class="mb-auto mx-4 py-4 flex flex-col lg:flex-row justify-center">
      <div v-if="voiceList" class="lg:mr-4">
        <UCard v-if="voiceList" class="mb-4 lg:w-96">
          <template #header>
            <h2 class="text-4xl font-extrabold dark:text-white">👇 语音选择</h2>
          </template>
          <div class="mb-8">
            <label for="voiceSelect" class="label-general">
              声音 (voice)：
            </label>
            <select
              id="voiceSelect"
              v-model="voiceConfig.voice"
              class="select-general"
            >
              <option
                v-for="item in voiceList"
                :key="item.ShortName"
                :value="item"
              >
                {{ item.LocalName + " " + item.ShortName }}
              </option>
            </select>
          </div>
          <div class="mb-8">
            <div class="flex items-center mb-4">
              <UCheckbox
                v-model="voiceConfig.useStyle"
                :disabled="styleList.length === 0"
                :label="
                  styleList.length !== 0
                    ? '使用声音风格'
                    : '该声音没有风格，无法启用声音风格'
                "
              />
            </div>
            <div v-if="voiceConfig.useStyle && styleList.length !== 0">
              <label
                style="align-items: self-start"
                for="voiceStyleSelect"
                class="label-general"
              >
                声音风格 (voiceStyle)：
              </label>
              <select
                id="voiceStyleSelect"
                v-model="voiceConfig.style"
                class="select-general"
              >
                <option v-for="style in styleList" :key="style" :value="style">
                  {{ style }}
                </option>
              </select>
            </div>
          </div>
          <div class="mb-4">
            <label for="pitchRange" class="label-general">音调(pitch)：</label>
            <select
              id="pitchRange"
              v-model="voiceConfig.pitch"
              name="sudo"
              class="select-general"
            >
              <option value="default">默认 (default)</option>
              <option value="x-low">极低 (x-low)</option>
              <option value="low">低 (low)</option>
              <option value="medium">中 (medium)</option>
              <option value="high">高 (high)</option>
              <option value="x-high">极高 (x-high)</option>
            </select>
          </div>
          <div class="mb-4">
            <label for="voiceFormat" class="label-general">音频格式</label>
            <select
              id="voiceFormat"
              v-model="voiceConfig.format"
              class="select-general"
            >
              <option
                v-for="format in formatList"
                :key="format"
                :value="format"
              >
                {{ format }}
              </option>
            </select>
          </div>
          <div class="dark:text-white text-sm">
            <p>*注：不再提供语速参数选择。</p>
            <p>各个阅读软件都有自带的语速选择，这里所选的语速会被覆盖。</p>
          </div>
        </UCard>
        <ExportPanel
          v-if="voiceList && voiceConfig.voice"
          :api="api"
          :voice-config="voiceConfig"
        />
      </div>
      <div>
        <TryListen
          v-if="voiceList && voiceConfig.voice"
          :api="api"
          :voice-config="voiceConfig"
        />
        <UCard class="lg:w-96">
          <template #header>
            <h2 class="text-4xl font-extrabold dark:text-white">🔑 输入 key</h2>
          </template>
          <div class="mb-5">
            <label for="email" class="label-general">API Region</label>
            <input
              id="email"
              v-model="api.region"
              type="text"
              class="select-general"
              required
            />
          </div>
          <div class="mb-5">
            <label for="password" class="label-general">Your API Key</label>
            <input
              id="password"
              v-model="api.key"
              type="password"
              class="select-general"
              required
            />
          </div>
          <UButton :disabled="!api.key || !api.region" @click="getVoiceList"
            >获取声音列表</UButton
          >
        </UCard>
      </div>
    </div>
    <IPlacement class="max-w-sm mx-auto dark:text-white">
      <p>本站不会储存你的 Key。数据缓存于本地浏览器中。</p>
      <p>
        具体请见此<a
          href="https://github.com/yy4382/tts-importer?tab=readme-ov-file#%E9%9A%90%E7%A7%81%E8%AF%B4%E6%98%8E"
          class="text-blue-700 dark:text-blue-400"
          >说明</a
        >。
      </p>
    </IPlacement>
    <IFooter />
  </div>
</template>

<script setup lang="ts">
import type { Api, VoiceAttr, VoiceConfig } from "~/utils/types";
const toast = useToast();

const formatList = ref([
  "amr-wb-16000hz",
  "audio-16khz-16bit-32kbps-mono-opus",
  "audio-16khz-32kbitrate-mono-mp3",
  "audio-16khz-64kbitrate-mono-mp3",
  "audio-16khz-128kbitrate-mono-mp3",
  "audio-24khz-16bit-24kbps-mono-opus",
  "audio-24khz-16bit-48kbps-mono-opus",
  "audio-24khz-48kbitrate-mono-mp3",
  "audio-24khz-96kbitrate-mono-mp3",
  "audio-24khz-160kbitrate-mono-mp3",
  "audio-48khz-96kbitrate-mono-mp3",
  "audio-48khz-192kbitrate-mono-mp3",
  "ogg-16khz-16bit-mono-opus",
  "ogg-24khz-16bit-mono-opus",
  "ogg-48khz-16bit-mono-opus",
  "raw-8khz-8bit-mono-alaw",
  "raw-8khz-8bit-mono-mulaw",
  "raw-8khz-16bit-mono-pcm",
  "raw-16khz-16bit-mono-pcm",
  "raw-16khz-16bit-mono-truesilk",
  "raw-22050hz-16bit-mono-pcm",
  "raw-24khz-16bit-mono-pcm",
  "raw-24khz-16bit-mono-truesilk",
  "raw-44100hz-16bit-mono-pcm",
  "raw-48khz-16bit-mono-pcm",
  "webm-16khz-16bit-mono-opus",
  "webm-24khz-16bit-24kbps-mono-opus",
  "webm-24khz-16bit-mono-opus",
]);

const api: Ref<Api> = ref({
  key: "",
  region: "eastasia",
});
const voiceList: Ref<VoiceAttr[] | undefined> = ref();
const voiceConfig: Ref<VoiceConfig> = ref({
  voice: undefined,
  useStyle: false,
  style: undefined,
  rate: "default",
  pitch: "default",
  format: "audio-24khz-48kbitrate-mono-mp3",
});

/**
 *  根据选择的声音获取风格列表
 */
const styleList: ComputedRef<string[]> = computed(() => {
  if (voiceConfig.value.voice === null) return Array<string>();
  return (
    voiceList.value!.find(
      (item: VoiceAttr) =>
        item.ShortName === voiceConfig.value.voice?.ShortName,
    )?.StyleNames || []
  );
});

onMounted(() => {
  api.value = {
    key: localStorage.getItem("apiKey") || "",
    region: localStorage.getItem("apiRegion") || "eastasia",
  };
  if (api.value.key && api.value.region) {
    try {
      voiceList.value = JSON.parse(localStorage.getItem("voiceList") || "");
    } catch (err) {
      console.error(err);
    }
  }
  if (voiceList.value) {
    const voice = voiceList.value[0];
    if (voice) {
      voiceConfig.value.voice = voice;
    }
  }
});
watch(
  api,
  (newVal) => {
    localStorage.setItem("apiKey", newVal.key);
    localStorage.setItem("apiRegion", newVal.region);
  },
  { deep: true },
);
watch(
  voiceList,
  (newVal) => {
    localStorage.setItem("voiceList", JSON.stringify(newVal));
  },
  { deep: true },
);

/**
 * Retrieves the list of available voices.
 */
function getVoiceList() {
  if (!api.value.key || !api.value.region) {
    alert("请输入 API Key 和 API Region");
    return;
  }
  $fetch(
    `https://${api.value.region}.tts.speech.microsoft.com/cognitiveservices/voices/list`,
    {
      headers: {
        "Ocp-Apim-Subscription-Key": api.value.key,
      },
    },
  )
    .then((res) => {
      if (!Array.isArray(res)) {
        console.error("fetch list", res);
        alert("获取声音列表失败，请检查 API Key 和 API Region 是否正确");
        return;
      }
      const zhVoices = res
        .filter((voice) => voice.Locale.startsWith("zh"))
        .map((voice) => {
          const styles: Array<string> | null = voice.StyleList || null;
          return {
            LocalName: voice.LocalName,
            ShortName: voice.ShortName,
            StyleNames: styles,
          };
        });
      // console.log(zhVoices)
      voiceList.value = zhVoices;
    })
    .catch((err) => {
      console.error("fetch list", err);
      toast.add({
        title: "获取声音列表失败",
        description:
          "请检查 API Key 和 API Region 是否正确，打开F12控制台查看详细信息",
      });
    });
}
</script>
