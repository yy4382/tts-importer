"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { ApiConfig, apiConfig } from "../api-input/api-input";
import { VoiceConfig, voiceConfigAtom } from "../voice-configure";

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
): Promise<{ ok: true; blob: Blob } | { ok: false; error: string }> {
  const resp = await fetch(
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
  if (!resp.ok) {
    return { ok: false, error: resp.statusText };
  }
  const blob = await resp.blob();
  return { ok: true, blob };
}

export function AuditionPanel() {
  const [text, setText] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const api = useAtomValue(apiConfig);
  const voiceState = useAtomValue(voiceConfigAtom);

  async function onAudition() {
    if (voiceState.state !== "success") return;
    const result = await getTestAudio(api, voiceState.data, text);
    if (result.ok) {
      console.log(result.blob);
      setAudioBlob(result.blob);
    } else {
      setAudioBlob(null);
      console.error(result.error);
    }
  }

  useEffect(() => {
    if (!audioBlob || !audioRef.current) return;
    const url = URL.createObjectURL(audioBlob);
    console.log(url);
    audioRef.current.src = url;
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [audioBlob, audioRef]);

  return (
    <Card className="w-card">
      <CardHeader>
        <CardTitle>试听</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={text}
          onInput={(e) => {
            setText((e.target as HTMLTextAreaElement).value);
          }}
        ></Textarea>
        <div className="flex justify-between items-center gap-4">
          <audio controls ref={audioRef} className="h-10" />
          <Button onClick={onAudition}>试听</Button>
        </div>
      </CardContent>
    </Card>
  );
}
