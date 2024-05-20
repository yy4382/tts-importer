import type { VoiceConfig } from "./types";

export default (voiceChoice: VoiceConfig) => {
  return `Azure ${voiceChoice.voiceLocalName}${(voiceChoice.useStyle && voiceChoice.style) || ""}${voiceChoice.pitch === "default" ? "" : " - " + voiceChoice.pitch}`;
};
