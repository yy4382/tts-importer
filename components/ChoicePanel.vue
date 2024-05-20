<template>
  <UCard
    v-if="voiceList"
    class="mb-4 max-w-xl"
    :ui="{
      body: {
        base: 'space-y-5',
      },
    }"
  >
    <template #header>
      <h2>👇 语音选择</h2>
    </template>
    <UFormGroup label="声音 (voice)" required>
      <USelectMenu
        v-model="voiceChoice.voice"
        :options="voiceList"
        option-attribute="LocalName"
        searchable
        :search-attributes="['LocalName', 'ShortName']"
        placeholder="选择声音"
      />
    </UFormGroup>
    <div class="space-y-2">
      <UCheckbox
        v-model="voiceChoice.useStyle"
        :disabled="styleList.length === 0"
        :label="
          styleList.length !== 0
            ? '使用声音风格'
            : '该声音没有风格，无法启用声音风格'
        "
      />
      <UFormGroup
        v-if="voiceChoice.useStyle && styleList.length !== 0"
        label="声音风格 (voiceStyle)"
      >
        <USelectMenu
          v-model="voiceChoice.style"
          :options="styleList"
          placeholder="选择声音风格"
          searchable
        />
      </UFormGroup>
    </div>
    <UFormGroup
      label="音调(pitch)"
      help="注：不再提供语速参数选择, 会使用各家 app 内的设置"
    >
      <USelectMenu
        v-model="voiceChoice.pitch"
        :options="pitchOptions"
        option-attribute="desc"
        value-attribute="id"
        placeholder="选择音调"
      />
    </UFormGroup>
    <UAccordion
      :items="[
        {
          label: '高级设置',
          slot: 'content',
        },
      ]"
      color="gray"
      variant="solid"
      size="md"
    >
      <template #content>
        <div class="space-y-4">
          <UFormGroup label="音频格式">
            <USelectMenu
              v-model="voiceChoice.format"
              :options="formatList"
              placeholder="选择音频格式"
            />
          </UFormGroup>

          <UFormGroup label="User-Agent">
            <UCheckbox
              v-model="voiceChoice.useCustomAgent"
              label="使用自定义 User-Agent"
              class="mb-1"
            />
            <UInput
              v-model="voiceChoice.customAgent"
              type="text"
              :disabled="!voiceChoice.useCustomAgent"
              placeholder="User-Agent"
            />
          </UFormGroup>
        </div>
      </template>
    </UAccordion>
  </UCard>
</template>

<script lang="ts" setup>
const voiceListStore = useVoiceListStore();
const { voiceList } = toRefs(voiceListStore);
const voiceChoice = useVoiceChoiceStore();

/**
 *  根据选择的声音获取风格列表
 */
const styleList: ComputedRef<string[]> = computed(() => {
  if (voiceChoice.voice === null) return Array<string>();
  return (
    voiceList.value!.find(
      (item: VoiceAttr) => item.ShortName === voiceChoice.voice?.ShortName,
    )?.StyleNames || []
  );
});

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

const pitchOptions = [
  { id: "default", desc: "默认 (default)" },
  { id: "x-low", desc: "极低 (x-low)" },
  { id: "low", desc: "低 (low)" },
  { id: "medium", desc: "中 (medium)" },
  { id: "high", desc: "高 (high)" },
  { id: "x-high", desc: "极高 (x-high)" },
];
</script>
