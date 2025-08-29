import genName from "@/lib/azure/config-name";
import {
  azureStateSchema,
  dedupeSpeakerStyle,
  type AzureState,
  type voiceConfigSchema,
} from "./schema";
import z from "zod";

function buildSSML(
  { shortName, style }: { shortName: string; style: string | null },
  shared: z.infer<typeof voiceConfigSchema>["shared"]
) {
  const usePitch = shared.pitch && shared.pitch !== "default";

  const ssml =
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="zh-CN">` +
    `<voice name="${shortName}">` +
    `<prosody rate="{{speakSpeed*4}}%" ${
      usePitch ? `pitch="${shared.pitch}"` : ""
    }>` +
    `${style ? `<mstts:express-as style="${style}">` : ""}` +
    `{{speakText}}` +
    `${style ? `</mstts:express-as>` : ""}` +
    `</prosody></voice></speak>`;
  return ssml;
}

function buildConfig(
  {
    shortName,
    localName,
    style,
  }: { shortName: string; style: string | null; localName: string },
  shared: z.infer<typeof voiceConfigSchema>["shared"],
  api: AzureState["api"],
  getId: () => number
) {
  const ssml = buildSSML({ shortName, style }, shared);
  const header = {
    "Ocp-Apim-Subscription-Key": api.key,
    "Content-Type": "application/ssml+xml",
    "X-Microsoft-OutputFormat": shared.format,
    "User-Agent": shared.customUA ?? "legado",
  };

  const urlConfig = {
    method: "POST",
    body: ssml,
    headers: header,
  };

  const config = {
    concurrentRate: "0",
    contentType: "audio/mpeg",
    header: JSON.stringify(header),
    id: getId(),
    loginCheckJs: "",
    loginUi: "",
    loginUrl: "",
    name: genName(localName, style),
    url: `https://${
      api.region
    }.tts.speech.microsoft.com/cognitiveservices/v1,${JSON.stringify(
      urlConfig
    )}`,
  };

  return config;
}

/**
 * @param state - AzureState
 * @returns legado config
 * @throws {ZodError} if the state is invalid
 */
export default function legadoConfig(state: AzureState) {
  const { api, voice: voiceConfig } = azureStateSchema.parse(state);

  function idFactory() {
    let start = Math.floor(Date.now() / 1000) * 1000;
    function getId() {
      return start++;
    }
    return getId;
  }
  const getId = idFactory();

  if (voiceConfig.speakerConfig.type !== "single") {
    const configs = voiceConfig.speakerConfig.speakers
      .map((speaker) =>
        dedupeSpeakerStyle(speaker.style).map((style) => {
          return buildConfig(
            {
              shortName: speaker.name,
              localName: speaker.localName,
              style,
            },
            voiceConfig.shared,
            api,
            getId
          );
        })
      )
      .flat();
    return JSON.stringify(configs);
  } else {
    const speaker = voiceConfig.speakerConfig.speaker;
    return JSON.stringify(
      dedupeSpeakerStyle(speaker.style).map((style) =>
        buildConfig(
          {
            shortName: speaker.name,
            localName: speaker.localName,
            style,
          },
          voiceConfig.shared,
          api,
          getId
        )
      )
    );
  }
}
