import {
  raApiConfigSchema,
  raVoiceConfigAdvancedSchema,
  raVoiceConfigSchema,
} from "./ra-data";
import { z } from "zod";
import { ulid } from "ulid";
import { toast } from "sonner";

function getSynthesisUrl(apiBase: string) {
  const url = new URL(apiBase);
  url.pathname = "/api/synthesis";
  return url;
}

function buildLegadoUrl(
  api: z.infer<typeof raApiConfigSchema>,
  voice: z.infer<typeof raVoiceConfigAdvancedSchema> & { voiceName: string }
) {
  const { voiceName, pitch, volume, format } = voice;
  const url = getSynthesisUrl(api.url);
  const { token } = api;
  url.searchParams.set("voiceName", voiceName);
  if (pitch) url.searchParams.set("pitch", pitch);
  // if (rate) url.searchParams.set("rate", rate);
  if (volume) url.searchParams.set("volume", volume);
  if (token) url.searchParams.set("token", token);
  if (format) url.searchParams.set("format", format);
  return `${url.toString()}&rate={{speakSpeed - 9}}&text={{String(speakText).replace(/&/g, '&amp;').replace(/\\\"/g, '&quot;').replace(/'/g, '&apos;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}}`;
}

function getName(options: z.infer<typeof raVoiceConfigSchema>) {
  return `Read Aloud ${options.voiceName}`;
}

export function generateProfile(
  type: "legado" | "ireadnote" | "sourcereader",
  apiRaw: z.infer<typeof raApiConfigSchema>,
  voiceRaw: z.infer<typeof raVoiceConfigSchema>
) {
  const apiParsed = raApiConfigSchema.safeParse(apiRaw);
  const voiceParsed = raVoiceConfigSchema.safeParse(voiceRaw);

  if (!apiParsed.success || !voiceParsed.success) {
    return null;
  }

  const api = apiParsed.data;
  const voice = voiceParsed.data;

  switch (type) {
    case "legado": {
      if (Array.isArray(voice.voiceName)) {
        return voice.voiceName.map((v) => ({
          name: getName({ ...voice, voiceName: v }),
          url: buildLegadoUrl(api, { ...voice, voiceName: v }),
          id: Date.now(),
        }));
      }
      return {
        name: getName(voice),
        url: buildLegadoUrl(api, { ...voice, voiceName: voice.voiceName }),
        id: Date.now(),
      };
    }
    case "sourcereader":
      if (Array.isArray(voice.voiceName)) {
        try {
          toast("源阅读只支持单个语音");
        } catch {}
        return null;
      }
      return buildLegadoUrl(api, { ...voice, voiceName: voice.voiceName });
    case "ireadnote": {
      const isSingle = !Array.isArray(voice.voiceName);
      const config = {
        _ClassName: "JxdAdvCustomTTS",
        _TTSConfigID: ulid(),
        ttsConfigGroup: `☁️ Edge@CF ${new URL(api.url).hostname}`,
        ttsHandles: [
          {
            forGetMethod: 1,
            processType: 1,
            params: {
              ...voice,
              voiceName: isSingle ? voice.voiceName : "@json:voiceName",
              token: api.token,
              text: "%@",
            },
            url: getSynthesisUrl(api.url).toString(),
            parser: {
              playData: "ResponseData",
            },
          },
        ],
        _TTSName: getName(
          isSingle ? voice : { ...voice, voiceName: ulid().slice(0, 8) }
        ),
      };
      if (!isSingle) {
        // @ts-expect-error voiceList is not in the type
        config.voiceList = [];
        for (const v of voice.voiceName) {
          // @ts-expect-error voiceList is not in the type
          config.voiceList.push({
            name: v,
            display: v,
          });
        }
      }
      return config;
    }
  }
}
