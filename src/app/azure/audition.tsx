"use client";

import { useAtomValue } from "jotai";
import { useCallback, useState } from "react";
import { apiConfig } from "./api-input";
import type { ApiConfig } from "@/lib/azure/schema";
import { voiceConfigAtom } from "./voice-configure";
import { VoiceConfig } from "@/lib/azure/schema";
import { AudioPreview } from "@/components/shared/audio-preview";
import { toast } from "sonner";

function genSSML(config: VoiceConfig, text: string) {
  if (
    config.speakerConfig.type !== "single" ||
    config.speakerConfig.speaker.style.filter((style) => style !== null)
      .length >= 2
  ) {
    throw new Error("试听只支持单个语音");
  }

  const styles = config.speakerConfig.speaker.style.filter(
    (style) => style !== null
  );
  if (styles.length >= 2) {
    toast(`当前选择了多个风格，试听只会使用第一个风格 ${styles[0]}`);
  }
  const style = styles.at(0);

  const ssml =
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="zh-CN">` +
    `<voice name="${config.speakerConfig.speaker.name}">` +
    `${config.shared.pitch ? `<prosody pitch="${config.shared.pitch}">` : ""}` +
    `${style ? `<mstts:express-as style="${style}">` : ""}` +
    `${text ? text : "帮忙点个 Star 吧"}` +
    `${style ? `</mstts:express-as>` : ""}` +
    `${config.shared.pitch ? `</prosody>` : ""}` +
    `</voice></speak>`;
  return ssml;
}

async function getTestAudio(
  api: ApiConfig,
  voiceChoice: VoiceConfig,
  text: string
): Promise<Blob | null> {
  let resp;
  try {
    resp = await fetch(
      `https://${api.region}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": api.key,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": voiceChoice.shared.format,
          ...(voiceChoice.shared.customUA
            ? { "User-Agent": voiceChoice.shared.customUA }
            : {}),
        },
        body: genSSML(voiceChoice, text),
      }
    );
  } catch (e) {
    toast("获取音频失败", {
      description: e instanceof Error ? e.message : "未知错误",
    });
    return null;
  }
  if (!resp.ok) {
    return null;
  }
  const blob = await resp.blob();
  return blob;
}

export function AudioPreviewAzure() {
  const api = useAtomValue(apiConfig);
  const voiceState = useAtomValue(voiceConfigAtom);

  const [url, setUrl] = useState<string | null>(null);

  const getTestAudioCb = useCallback(
    async (text: string) => {
      if (voiceState.state !== "success") return;
      if (voiceState.data.speakerConfig.type !== "single") {
        toast("只能在选择单个语音时预览音色");
        return;
      }
      const blob = await getTestAudio(api, voiceState.data, text);
      if (url !== null) {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          console.error(e);
        }
      }
      if (blob) {
        const url = URL.createObjectURL(blob);
        setUrl(url);
        toast("获取音频成功");
      } else {
        toast("获取音频失败");
      }
    },
    [api, voiceState, url]
  );

  return (
    <AudioPreview
      getTestAudio={getTestAudioCb}
      url={url}
      enabled={voiceState.state === "success"}
    />
  );
}
