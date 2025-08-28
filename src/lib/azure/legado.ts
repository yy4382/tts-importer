import genName from "@/lib/azure/config-name";
import {
  azureStateSchema,
  type AzureState,
  type speakerSchema,
  type voiceConfigSchema,
} from "./schema";
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
    `<prosody rate="{{speakSpeed*4}}%" ${
      usePitch ? `pitch="${shared.pitch}"` : ""
    }>` +
    `${style ? `<mstts:express-as style="${style}">` : ""}` +
    `{{speakText}}` +
    `${style ? `</mstts:express-as>` : ""}` +
    `</prosody></voice></speak>`;

  return ssml;
}

/**
 * @param state - AzureState
 * @returns legado config
 * @throws {ZodError} if the state is invalid
 */
export default function legadoConfig(state: AzureState) {
  const { api, voice: voiceConfig } = azureStateSchema.parse(state);
  if (voiceConfig.speakerConfig.type !== "single") {
    // TODO: support multiple speakers
    throw new Error("multiple speakers not supported yet");
  }

  const header = {
    "Ocp-Apim-Subscription-Key": api.key,
    "Content-Type": "application/ssml+xml",
    "X-Microsoft-OutputFormat": voiceConfig.shared.format,
    "User-Agent": voiceConfig.shared.customUA ?? "legado",
  };

  const ssml = buildSSML(voiceConfig.speakerConfig.speaker, voiceConfig.shared);

  const urlConfig = {
    method: "POST",
    body: ssml,
    headers: header,
  };
  const config = {
    concurrentRate: "0",
    contentType: "audio/mpeg",
    header: JSON.stringify(header),
    id: Date.now(),
    loginCheckJs: "",
    loginUi: "",
    loginUrl: "",
    name: genName(voiceConfig),
    url: `https://${
      api.region
    }.tts.speech.microsoft.com/cognitiveservices/v1,${JSON.stringify(
      urlConfig
    )}`,
  };

  return JSON.stringify([config]);
}
