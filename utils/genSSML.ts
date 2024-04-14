import { type VoiceConfig } from "@/pages/index.vue";
export default function (config: VoiceConfig, text: string) {
  if (!config.voice) return;
  const pitch = config.pitch === "default" ? null : config.pitch;
  const ssml =
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="zh-CN">` +
    `<voice name="${config.voice.ShortName}">` +
    `${pitch ? `<prosody pitch="${config.pitch}">` : ""}` +
    `${config.useStyle ? `<mstts:express-as style="${config.style}">` : ""}` +
    `${text}` +
    `${config.useStyle ? `</mstts:express-as>` : ""}` +
    `${pitch ? `</prosody>` : ""}` +
    `</voice></speak>`;
  return ssml;
}
