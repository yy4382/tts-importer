import { atom } from "jotai";
import z from "zod";

export const raApiConfigSchema = z.object({
  url: z.string().url(),
  token: z.string(),
});

const raApiConfigAtom = atom<z.infer<typeof raApiConfigSchema>>({
  url: "",
  token: "",
});

export const raVoiceConfigSchema = z.object({
  voiceName: z.string(),
  pitch: z.string(),
  rate: z.string(),
  format: z.string(),
  volume: z.string(),
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
