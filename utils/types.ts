export interface Api {
  key: string;
  region: string;
}

export interface VoiceAttr {
  LocalName: string;
  ShortName: string;
  StyleNames: string[] | null;
}
export interface VoiceConfig {
  voice: VoiceAttr | undefined;
  useStyle: boolean;
  style: string | undefined;
  rate: string;
  pitch: string;
  format: string;
}
