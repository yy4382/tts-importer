import { z } from "zod";
export interface Settings {
  key: string;
  region: string;
}

export interface VoiceAttr {
  LocalName: string;
  ShortName: string;
  StyleNames: string[] | null;
}
export interface VoiceConfig {
  voice: string | null;
  voiceLocalName: string | null;
  useStyle: boolean;
  style: string | null;
  pitch: string;
  format: string;
  useCustomAgent: boolean;
  customAgent: string;
}

export interface Config4Server {
  api: Settings;
  voiceChoice: VoiceConfig;
}
export const serverSchema = z.object({
  api: z.object({
    key: z.string(),
    region: z.string(),
  }),
  voiceChoice: z.object({
    voice: z.string(),
    voiceLocalName: z.string(),
    format: z.string(),
    pitch: z.string(),
    style: z.string().nullable(),
    useStyle: z.boolean(),
    useCustomAgent: z.boolean(),
    customAgent: z.string(),
  }),
});
