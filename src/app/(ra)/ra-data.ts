import { atom } from "jotai";
import z from "zod";
import { queryOptions } from "@tanstack/react-query";

export const raApiConfigSchema = z.object({
  url: z.string().url(),
  token: z.string(),
});

const raApiConfigAtom = atom<z.infer<typeof raApiConfigSchema>>({
  url: "",
  token: "",
});

export const raVoiceConfigAdvancedSchema = z.object({
  pitch: z.string(),
  rate: z.string(),
  format: z.string(),
  volume: z.string(),
});
export const raVoiceConfigSchema = z.object({
  ...raVoiceConfigAdvancedSchema.shape,
  voiceName: z.string().or(z.array(z.string())),
});

const raVoiceConfigAtom = atom<z.infer<typeof raVoiceConfigSchema>>({
  voiceName: "zh-CN-XiaoxiaoNeural",
  pitch: "",
  rate: "",
  format: "audio-24khz-48kbitrate-mono-mp3",
  volume: "",
});

const validRaVoiceConfigAtom = atom((get) => {
  const config = get(raVoiceConfigAtom);
  const result = raVoiceConfigSchema.safeParse(config);
  if (!result.success) {
    return null;
  }
  return result.data;
});

export { raVoiceConfigAtom, validRaVoiceConfigAtom, raApiConfigAtom };

async function fetchVoices() {
  const res = await fetch(
    "https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list?trustedclienttoken=6A5AA1D4EAFF4E9FB37E23D68491D6F4"
  );
  return ((await res.json()) as { ShortName: string }[]).map(
    (v) => v["ShortName"]
  );
}

const voiceListQueryOptions = queryOptions({
  queryKey: ["ra-voice-list"],
  queryFn: fetchVoices,
});

export { voiceListQueryOptions };