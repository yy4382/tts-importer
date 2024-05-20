import { defineStore } from "pinia";
import type { VoiceConfig as VoiceChoice } from "~/utils/types";
import { useSettingsStore } from "./settings";

export const useVoiceChoiceStore = defineStore("tts-i:voiceChoice", {
  state: () =>
    ({
      voice: undefined,
      useStyle: false,
      style: undefined,
      rate: "default",
      pitch: "default",
      format: "audio-24khz-48kbitrate-mono-mp3",
      useCustomAgent: false,
      customAgent: "",
    }) satisfies VoiceChoice as VoiceChoice,
  getters: {
    ifreetimeCfg(state) {
      const settings = useSettingsStore();
      return genAiyue(settings, state);
    },
    legadoCfg(state) {
      const settings = useSettingsStore();
      return genLegado(settings, state);
    },
    sourceReaderCfg(state) {
      const settings = useSettingsStore();
      let config = JSON.parse(genLegado(settings, state));
      config = [config];
      return JSON.stringify(config);
    }
  },

  actions: {},
  persist: true,
});
