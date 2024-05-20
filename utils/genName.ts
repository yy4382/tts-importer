import type { VoiceConfig } from "./types";

export default (voiceChoice: VoiceConfig) => {
  return `Azure ${voiceChoice.voice?.LocalName}${voiceChoice.style || ""}${voiceChoice.pitch === "default" ? "" : " - " + voiceChoice.pitch}`;
};
