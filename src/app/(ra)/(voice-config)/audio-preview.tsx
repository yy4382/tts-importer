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

  const getTestAudioUrl = useCallback(
    async (text: string) => {
      if (!api.url) {
        toast("API URL 未设置");
        return;
      }
      if (!config) {
        toast("语音配置未设置");
        return;
      }
      if (config.voiceName.type !== "single") {
        toast("只能在选择单个语音时预览音色");
        return;
      }
      if (!config.voiceName.name) {
        toast("语音名称未设置");
        return;
      }
      try {
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

        url.searchParams.set("voice", config.voiceName.name);

        const { pitch, rate, volume, format } = config.advanced;
        if (pitch) url.searchParams.set("pitch", pitch.toString());
        if (rate) url.searchParams.set("rate", rate.toString());
        if (volume) url.searchParams.set("volume", volume.toString());
        if (format) url.searchParams.set("format", format);

        return url.toString();
      } catch (error) {
        toast("获取音频失败", {
          description: error instanceof Error ? error.message : "未知错误",
        });
        return null;
      }
    },
    [api, config]
  );

  async function getTestAudio(text: string) {
    const url = await getTestAudioUrl(text);
    if (!url) return;
    try {
      const resp = await fetch(url);
      if (!resp.ok) {
        toast("获取音频失败：请求错误", {
          description: `服务器返回 ${resp.status} ${resp.statusText}`,
        });
        return;
      }
      const blob = await resp.blob();
      const newAudioUrl = URL.createObjectURL(blob);
      if (audioUrl) {
        try {
          URL.revokeObjectURL(audioUrl);
        } catch (e) {
          console.warn("revoke object url error", e);
        }
      }
      setAudioUrl(newAudioUrl);
      toast("获取音频成功");
    } catch (error) {
      toast("获取音频失败：连接错误", {
        description: error instanceof Error ? error.message : "未知错误",
      });
    }
  }

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
