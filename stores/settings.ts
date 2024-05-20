import { defineStore } from "pinia";
import type { FetchError } from "ofetch";
export const useSettingsStore = defineStore("tts-i:settings", {
  state: () =>
    ({
      region: "",
      key: "",
    }) satisfies Settings as Settings,
  getters: {
    notEmpty(state) {
      return state.key !== "" && state.region !== "";
    },
  },
  actions: {
    async valid(successCb?: () => void, errCb?: (error: FetchError) => void) {
      if (!this.notEmpty) return false;
      try {
        await $fetch(
          `https://${this.region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
          {
            method: "POST",
            headers: {
              "Ocp-Apim-Subscription-Key": this.key,
              Host: `${this.region}.api.cognitive.microsoft.com`,
              "Content-type": "application/x-www-form-urlencoded",
              "Content-Length": "0",
            },
          },
        );
        if (successCb) successCb();
        return true;
      } catch (e) {
        console.error("validate settings error", e);
        if (errCb) errCb(e as FetchError);
        return false;
      }
    },
  },
  persist: true,
});
