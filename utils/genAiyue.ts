import { type Api, type VoiceConfig } from "../pages/index.vue";
function generateRandomString(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export default function (api: Api, vconfig: VoiceConfig) {
  if (!vconfig.voice) {
    alert("请选择声音");
    return "";
  }
  const pitch = vconfig.pitch === "default" ? null : vconfig.pitch;
  const ssml =
    `<speak version="1.0" xml:lang="zh-CN">` +
    `<voice name="${vconfig.voice.ShortName}">` +
    `${pitch ? `<prosody pitch="${vconfig.pitch}">` : ""}` +
    `${vconfig.useStyle ? `<mstts:express-as style="${vconfig.style}">` : ""}` +
    `%@` +
    `${vconfig.useStyle ? `</mstts:express-as>` : ""}` +
    `${pitch ? `</prosody>` : ""}` +
    `</voice></speak>`;
  const config = {
    loginUrl: "",
    maxWordCount: "",
    ttsConfigGroup: "Azure",
    _ClassName: "JxdAdvCustomTTS",
    _TTSConfigID: generateRandomString(32),
    httpConfigs: {
      useCookies: 1,
      headers: {},
    },
    ttsHandles: [
      {
        processType: 1,
        maxPageCount: 1,
        nextPageForGetMedthod: 1,
        forGetMethod: 0,
        requestByWebView: 0,
        nextPageParams: {},
        parser: {
          playData: "ResponseData",
        },
        url: `https://${api.region}.tts.speech.microsoft.com/cognitiveservices/v1`,
        params: {
          text: ssml,
        },
        httpConfigs: {
          useCookies: 1,
          customFormatParams: "params[text]",
          headers: {
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
            "ocp-apim-subscription-key": `${api.key}`,
          },
        },
      },
    ],
    _TTSName: `Azure ${vconfig.voice.LocalName}${vconfig.style || ""}${pitch || ""}`,
  };
  return JSON.stringify(config);
}
