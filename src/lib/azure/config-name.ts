import type { VoiceConfig } from "@/lib/azure/types";

export default function generateConfigName(voiceChoice: VoiceConfig) {
  return `Azure ${voiceChoice.localName}${
    voiceChoice.style ? " " + voiceChoice.style : ""
  }${voiceChoice.pitch ? " - " + voiceChoice.pitch : ""}`;
}
