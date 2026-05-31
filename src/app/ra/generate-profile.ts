import {
  LegadoSpecificConfig,
  LegadoTextEncoding,
  raApiConfigSchema,
  RaState,
  raVoiceConfigAdvancedSchema,
} from "./ra-data";
import type { z } from "zod";
import { monotonicFactory } from "ulid";

function getSynthesisUrl(apiBase: string) {
  const url = new URL(apiBase);
  url.pathname = "/api/synthesis";
  return url;
}
export const DEFAULT_LEGADO_RATE_TEMPLATE = "{{speakSpeed/10}}";

export const DEFAULT_LEGADO_TEXT_ENCODING: LegadoTextEncoding =
  "encodeURIComponent";

/**
 * Legado-style apps embed a JS-like expression for the `text` param. Different
 * readers support different runtimes, so we offer multiple "compat modes":
 * - `encodeURIComponent` (default): correctly handles `%` and other reserved
 *   characters, but requires the reader to expose `encodeURIComponent`.
 * - `xmlEscape`: the legacy fallback that only does `String.replace`, which
 *   more limited template parsers support.
 */
const LEGADO_TEXT_TEMPLATES: Record<LegadoTextEncoding, string> = {
  encodeURIComponent: "{{encodeURIComponent(speakText)}}",
  xmlEscape: `{{String(speakText).replace(/&/g, '&amp;').replace(/\\"/g, '&quot;').replace(/'/g, '&apos;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}}`,
};

function buildLegadoUrl(
  api: z.infer<typeof raApiConfigSchema>,
  voiceName: string,
  advanced: z.infer<typeof raVoiceConfigAdvancedSchema>,
  legadoSpecific: LegadoSpecificConfig
) {
  const { pitch, volume, format } = advanced;
  const rate = legadoSpecific.rateTemplate || DEFAULT_LEGADO_RATE_TEMPLATE;
  const textTemplate =
    LEGADO_TEXT_TEMPLATES[
      legadoSpecific.textEncoding ?? DEFAULT_LEGADO_TEXT_ENCODING
    ];
  const url = getSynthesisUrl(api.url);
  const { token } = api;
  url.searchParams.set("voiceName", voiceName);
  if (pitch) url.searchParams.set("pitch", pitch);
  if (volume) url.searchParams.set("volume", volume);
  if (token) url.searchParams.set("token", token);
  if (format) url.searchParams.set("format", format);
  return `${url.toString()}&rate=${rate}&text=${textTemplate}`;
}

export function generateProfileLegado(state: RaState, legadoSpecific: LegadoSpecificConfig) {
  function idFactory() {
    let start = Math.floor(Date.now() / 1000) * 1000;
    function getId() {
      return start++;
    }
    return getId;
  }
  function buildConfig(state: RaState) {
    const { api, voice } = state;
    const id = idFactory();
    if (voice.voiceName.type !== "single") {
      return voice.voiceName.nameList.map((v) => ({
        name: `☁️ Read Aloud ${v}`,
        url: buildLegadoUrl(api, v, voice.advanced, legadoSpecific),
        id: id(),
      }));
    }
    return {
      name: `☁️ Read Aloud ${voice.voiceName.name}`,
      url: buildLegadoUrl(api, voice.voiceName.name, voice.advanced, legadoSpecific),
      id: id(),
    };
  }

  return JSON.stringify(buildConfig(state));
}

export function generateProfileIreadnote(state: RaState) {
  const { api, voice } = state;
  const voiceName = voice.voiceName;
  const ulid = monotonicFactory();

  function getConfigName() {
    switch (voiceName.type) {
      case "single":
        return `Read Aloud ${voiceName.name}`;
      case "all":
        return `Read Aloud 全语言 ${voiceName.nameList.length} 个`;
      case "all-zh":
        return `Read Aloud 全中文 ${voiceName.nameList.length} 个`;
    }
  }

  const config = {
    _ClassName: "JxdAdvCustomTTS",
    _TTSConfigID: ulid(),
    ttsConfigGroup: `☁️ EdgeRA ${new URL(api.url).hostname}`,
    ttsHandles: [
      {
        forGetMethod: 1,
        processType: 1,
        params: {
          ...voice.advanced,
          voiceName:
            voiceName.type === "single" ? voiceName.name : "@json:voiceName",
          token: api.token,
          text: "%@",
        },
        url: getSynthesisUrl(api.url).toString(),
        parser: {
          playData: "ResponseData",
        },
      },
    ],
    _TTSName: getConfigName(),
    voiceList:
      voiceName.type === "single"
        ? undefined
        : voiceName.nameList.map((v) => ({
            name: v,
            display: v,
          })),
  };

  return JSON.stringify(config);
}
