import genName from "@/lib/azure/config-name";
import { ulid } from "ulid";
import {
  AzureState,
  azureStateSchema,
  speakerSchema,
  voiceConfigSchema,
} from "./schema";
import z from "zod";

/**
 * Build SSML for ifreetime
 * Doesn't support exporting multiple styles
 * Will only export the first style
 *
 * @param speaker if undefined, means is building for multiple speakers, will not use style
 * @returns SSML
 */
function buildSSML(
  speaker: z.infer<typeof speakerSchema> | undefined,
  shared: z.infer<typeof voiceConfigSchema>["shared"]
) {
  if (
    !(speaker?.style.length === 0 || speaker?.style.every((s) => s === null))
  ) {
    console.warn("multiple styles are not supported", speaker?.style);
  }

  const style = speaker?.style.at(0);

  const usePitch = shared.pitch && shared.pitch !== "default";

  const ssml =
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="zh-CN">` +
    `<voice name="${speaker?.name ?? "%@voiceName&"}">` +
    `${usePitch ? `<prosody pitch="${shared.pitch}">` : ""}` +
    `${style ? `<mstts:express-as style="${style}">` : ""}` +
    `%@content&` +
    `${style ? `</mstts:express-as>` : ""}` +
    `${usePitch ? `</prosody>` : ""}` +
    `</voice></speak>`;
  return ssml;
}

/**
 * Doesn't support exporting multiple styles
 * Will only export the first style
 *
 * @returns ifreetime config
 */
export default function ifreetimeConfig(state: AzureState) {
  const { api, voice: voiceConfig } = azureStateSchema.parse(state);
  const speakerConfig = voiceConfig.speakerConfig;

  function getConfigName() {
    switch (speakerConfig.type) {
      case "single":
        return genName(
          speakerConfig.speaker.localName,
          speakerConfig.speaker.style.at(0) ?? null
        );
      case "all":
        return `☁️ Azure 全语言 ${speakerConfig.speakers.length} 个`;
      case "all-zh":
        return `☁️ Azure 全中文 ${speakerConfig.speakers.length} 个`;
      default:
        console.error("unknown speaker config type", speakerConfig);
        return `☁️ Azure 语音源`;
    }
  }

  const ssml = buildSSML(
    speakerConfig.type === "single" ? speakerConfig.speaker : undefined,
    voiceConfig.shared
  );
  const config = {
    loginUrl: "",
    maxWordCount: "",
    ttsConfigGroup: "☁️ Azure",
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
          text: [
            "@dyn:\np=def:&|\\< @=>;\ntxt=keyword.jxd_executeRegexRules:p;",
            ssml,
          ],
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
    _TTSName: getConfigName(),
    voiceList:
      speakerConfig.type === "single"
        ? undefined
        : speakerConfig.speakers.map((v) => ({
            name: v.name,
            display: v.localName,
          })),
  };
  return JSON.stringify(config);
}
