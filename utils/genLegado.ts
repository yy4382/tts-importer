import { type Api, type VoiceConfig } from "~/utils/types";
export default function (api: Api, voiceConfig: VoiceConfig) {
  if (!voiceConfig.voice) {
    throw new Error("未选择语音")
  }
  const header = {
    "Ocp-Apim-Subscription-Key": api.key,
    "Content-Type": "application/ssml+xml",
    "X-Microsoft-OutputFormat": voiceConfig.format,
    "User-Agent": voiceConfig.useCustomAgent
      ? voiceConfig.customAgent
      : "legado",
  };
  const ssml =
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="zh-CN">` +
    `<voice name="${voiceConfig.voice.ShortName}">` +
    `<prosody rate="{{speakSpeed*4}}%" pitch="${voiceConfig.pitch}">` +
    `${voiceConfig.useStyle ? `<mstts:express-as style="${voiceConfig.style}">` : ""}` +
    `{{speakText}}` +
    `${voiceConfig.useStyle ? `</mstts:express-as>` : ""}` +
    `</prosody>` +
    `</voice>` +
    `</speak>`;
  const urlConfig = {
    method: "POST",
    body: ssml,
    headers: header,
  };
  const config = {
    concurrentRate: "0",
    contentType: "audio/mpeg",
    header: JSON.stringify(header),
    id: parseInt(Date.now() + "", 10),
    loginCheckJs: "",
    loginUi: "",
    loginUrl: "",
    name: `Azure ${voiceConfig.voice.LocalName}${voiceConfig.style || ""}${voiceConfig.pitch === "default" ? "" : " - " + voiceConfig.pitch}`,
    url: `https://${api.region}.tts.speech.microsoft.com/cognitiveservices/v1,${JSON.stringify(urlConfig)}`,
  };

  return JSON.stringify(config);
}
