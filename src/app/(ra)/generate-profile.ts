import { raApiConfigSchema, raVoiceConfigSchema } from "./ra-data";
import { z } from "zod";

function getSynthesisUrl(apiBase: string) {
  const url = new URL(apiBase);
  url.pathname = "/api/synthesis";
  return url;
}

function buildLegadoUrl(
  api: z.infer<typeof raApiConfigSchema>,
  voice: z.infer<typeof raVoiceConfigSchema>
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

  const url = buildLegadoUrl(api, voice);
  switch (type) {
    case "legado":
      return {
        name: getName(voice),
        url,
        id: Date.now(),
      };
    case "sourcereader":
      return url;
    case "ireadnote": {
      const config = {
        _ClassName: "JxdAdvCustomTTS",
        _TTSConfigID: generateRandomString(16),
        ttsConfigGroup: `☁️ Edge@CF ${new URL(api.url).hostname}`,
        ttsHandles: [
          {
            forGetMethod: 1,
            processType: 1,
            params: {
              ...voice,
              token: api.token,
              text: "%@",
            },
            url: getSynthesisUrl(api.url).toString(),
            parser: {
              playData: "ResponseData",
            },
          },
        ],
        _TTSName: getName(voice),
      };
      return config;
    }
  }
}

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
