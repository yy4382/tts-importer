"use client";

import { useAtomValue } from "jotai";
import { useCallback, useState } from "react";
import { ApiConfig, apiConfig } from "./api-input";
import { VoiceConfig, voiceConfigAtom } from "./voice-configure";
import { AudioPreview } from "@/components/shared/audio-preview";
import { toast } from "sonner";

function genSSML(config: VoiceConfig, text: string) {
  if (!config.voice) return;
  const ssml =
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="zh-CN">` +
    `<voice name="${config.voice}">` +
    `${config.pitch ? `<prosody pitch="${config.pitch}">` : ""}` +
    `${config.style ? `<mstts:express-as style="${config.style}">` : ""}` +
    `${text ? text : "帮忙点个 Star 吧"}` +
    `${config.style ? `</mstts:express-as>` : ""}` +
    `${config.pitch ? `</prosody>` : ""}` +
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
          "X-Microsoft-OutputFormat": voiceChoice.format,
          ...(voiceChoice.customAgent
            ? { "User-Agent": voiceChoice.customAgent }
            : {}),
        },
        body: genSSML(voiceChoice, text),
      }
    );
  } catch {
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
