import genName from "@/lib/azure/config-name";
import { ulid } from "ulid";
import { AzureState, speakerSchema, voiceConfigSchema } from "./schema";
import z from "zod";

function buildSSML(
  speaker: z.infer<typeof speakerSchema>,
  shared: z.infer<typeof voiceConfigSchema>["shared"]
) {
  // TODO: support multiple styles
  const style = speaker.style.find((s) => s !== null);

  const usePitch = shared.pitch && shared.pitch !== "default";

  const ssml =
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="zh-CN">` +
    `<voice name="${speaker.name}">` +
    `${usePitch ? `<prosody pitch="${shared.pitch}">` : ""}` +
    `${style ? `<mstts:express-as style="${style}">` : ""}` +
    `%@` +
    `${style ? `</mstts:express-as>` : ""}` +
    `${usePitch ? `</prosody>` : ""}` +
    `</voice></speak>`;
  return ssml;
}

export default function ifreetimeConfig(state: AzureState) {
  const { api, voice: voiceConfig } = state;
  if (voiceConfig.speakerConfig.type !== "single") {
    // TODO: support multiple speakers
    throw new Error("multiple speakers not supported yet");
  }
  const ssml = buildSSML(voiceConfig.speakerConfig.speaker, voiceConfig.shared);
  const config = {
    loginUrl: "",
    maxWordCount: "",
    ttsConfigGroup: "Azure",
    _ClassName: "JxdAdvCustomTTS",
    _TTSConfigID: ulid(),
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
            "X-Microsoft-OutputFormat": voiceConfig.shared.format,
            "ocp-apim-subscription-key": `${api.key}`,
            "User-Agent": voiceConfig.shared.customUA ?? "AiyueTTS",
          },
        },
      },
    ],
    _TTSName: genName(voiceConfig),
  };
  return JSON.stringify(config);
}
