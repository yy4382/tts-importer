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
  voice?: VoiceAttr;
  useStyle: boolean;
  style?: string;
  rate: string;
  pitch: string;
  format: string;
  useCustomAgent: boolean;
  customAgent: string;
}
