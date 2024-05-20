import { defineStore } from "pinia";
import type { VoiceAttr } from "~/utils/types";
import { useSettingsStore } from "./settings";

export const useVoiceListStore = defineStore("tts-i:voiceList", {
  state: () => ({
    voiceList: [] as VoiceAttr[],
  }),
  actions: {
    async updateVoiceList(errCb?: (error: Error) => void) {
      const settings = useSettingsStore();
      if (!settings.notEmpty) {
        if (errCb) errCb(new Error("settings not valid"));
        return;
      }
      const res = await $fetch(
        `https://${settings.region}.tts.speech.microsoft.com/cognitiveservices/voices/list`,
        {
          headers: {
            "Ocp-Apim-Subscription-Key": settings.key,
          },
        },
      );
      if (!Array.isArray(res)) {
        if (errCb) errCb(new Error("Invalid response, should be an array"));
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
          } satisfies VoiceAttr as VoiceAttr;
        });
      this.voiceList = zhVoices;
    },
  },
  persist: true,
});
