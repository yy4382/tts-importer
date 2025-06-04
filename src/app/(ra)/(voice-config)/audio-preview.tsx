"use client";

import { useAtomValue } from "jotai";
import { raApiConfigAtom, validRaVoiceConfigAtom } from "../ra-data";
import { AudioPreview } from "@/components/shared/audio-preview";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function AudioPreviewRa() {
  const api = useAtomValue(raApiConfigAtom);
  const config = useAtomValue(validRaVoiceConfigAtom);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const getTestAudio = useCallback(
    async (text: string) => {
      if (!api.url) {
        toast("API URL 未设置");
        return;
      }
      if (!config) {
        toast("语音配置未设置");
        return;
      }
      const url = new URL(api.url);
      url.pathname = "/api/synthesis";
      url.searchParams.set("token", api.token);
      if (text) {
        url.searchParams.set("text", text);
      } else {
        url.searchParams.set(
          "text",
          "你好，这是 Read Aloud 的默认测试语句。喜欢本项目的话，帮忙点个 Star 吧。"
        );
      }
      if (config.voiceName) url.searchParams.set("voice", config.voiceName);
      if (config.pitch) url.searchParams.set("pitch", config.pitch.toString());
      if (config.rate) url.searchParams.set("rate", config.rate.toString());
      if (config.volume)
        url.searchParams.set("volume", config.volume.toString());
      if (config.format) url.searchParams.set("format", config.format);

      setAudioUrl(url.toString());
    },
    [api, config]
  );
  return (
    <AudioPreview
      enabled={!!api.url && !!config}
      getTestAudio={getTestAudio}
      url={audioUrl}
      onError={() => {
        toast("获取音频失败");
      }}
    />
  );
}
