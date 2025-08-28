import type { VoiceConfig } from "./schema";

export default function generateConfigName(voice: VoiceConfig) {
  // TODO multiple speakers enhance
  return `☁️ Azure ${
    voice.speakerConfig.type === "single"
      ? voice.speakerConfig.speaker.localName
      : "Multiple Speakers"
  }`;
}
