import { type Settings, type VoiceConfig } from "~/utils/types";
import genName from "~/utils/genName";
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

export default function (api: Settings, voiceConfig: VoiceConfig) {
  if (!voiceConfig.voice) {
    throw new Error("未选择语音");
  }
  const pitch = voiceConfig.pitch === "default" ? null : voiceConfig.pitch;
  const ssml =
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="zh-CN">` +
    `<voice name="${voiceConfig.voice}">` +
    `${pitch ? `<prosody pitch="${voiceConfig.pitch}">` : ""}` +
    `${voiceConfig.useStyle ? `<mstts:express-as style="${voiceConfig.style}">` : ""}` +
    `%@` +
    `${voiceConfig.useStyle ? `</mstts:express-as>` : ""}` +
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
          text: `@dyn:\np=def:& @=>和;\ntxt=keyword.jxd_executeRegexRules:p;\nformat('${ssml}',txt)`,
        },
        httpConfigs: {
          useCookies: 1,
          customFormatParams: "params[text]",
          headers: {
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": voiceConfig.format,
            "ocp-apim-subscription-key": `${api.key}`,
            "User-Agent": voiceConfig.useCustomAgent
              ? voiceConfig.customAgent
              : "AiyueTTS",
          },
        },
      },
    ],
    _TTSName: genName(voiceConfig),
  };
  return JSON.stringify(config);
}
