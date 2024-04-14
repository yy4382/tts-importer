import { type Api, type VoiceConfig } from "../pages/index.vue";
export default function (api: Api, vconfig: VoiceConfig) {
  if (!vconfig.voice) {
    alert("请选择声音");
    return "";
  }
  const header = {
    "Ocp-Apim-Subscription-Key": api.key,
    "Content-Type": "application/ssml+xml",
    "X-Microsoft-OutputFormat": vconfig.format,
    "User-Agent": "legado",
  };
  const ssml =
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="zh-CN">` +
    `<voice name="${vconfig.voice.ShortName}">` +
    `<prosody rate="{{speakSpeed*4}}%" pitch="${vconfig.pitch}">` +
    `${vconfig.useStyle ? `<mstts:express-as style="${vconfig.style}">` : ""}` +
    `{{speakText}}` +
    `${vconfig.useStyle ? `</mstts:express-as>` : ""}` +
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
    name: `Azure ${vconfig.voice.LocalName}${vconfig.style || ""}${vconfig.pitch === "default" ? "" : " - " + vconfig.pitch}`,
    url: `https://${api.region}.tts.speech.microsoft.com/cognitiveservices/v1,${JSON.stringify(urlConfig)}`,
  };

  return JSON.stringify(config);
}
