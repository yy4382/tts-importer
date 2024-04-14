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

export default function (api: Api, vConfig: VoiceConfig) {
  if (!vConfig.voice) {
    alert("请选择声音");
    return "";
  }
  const pitch = vConfig.pitch === "default" ? null : vConfig.pitch;
  const ssml = genSSML(vConfig, "%@");
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
            "X-Microsoft-OutputFormat": vConfig.format,
            "ocp-apim-subscription-key": `${api.key}`,
          },
        },
      },
    ],
    _TTSName: `Azure ${vConfig.voice.LocalName}${vConfig.style || ""}${pitch || ""}`,
  };
  return JSON.stringify(config);
}
