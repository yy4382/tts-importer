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

        url.searchParams.set("voiceName", config.voiceName.name);

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
        let responseText: string | undefined;
        try {
          responseText = await resp.text();
          if (responseText.length > 50) {
            responseText = responseText.slice(0, 50) + "...";
          }
        } catch {}
        toast("获取音频失败：请求错误", {
          description: `服务器返回 ${resp.status} ${resp.statusText} ${
            responseText ? `${responseText}` : ""
          }`,
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
      console.error("get test audio error", error);
      toast("获取音频失败：连接错误", {
        description: <FailToFetchExplain />,
        duration: 1000000,
        closeButton: true,
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

export function FailToFetchExplain() {
  return (
    <div className="prose prose-sm dark:prose-invert prose-p:my-0">
      <p>出现 fetch 错误。常见原因：</p>
      <ul>
        <li>
          API URL 不正确。需要是 <code>http://</code> 或 <code>https://</code>{" "}
          开头，并请检查拼写。
        </li>
        <li>
          CORS
          配置问题。这只会在浏览器中出现，可以尝试直接将语音导入听书软件中后在听书软件中测试。
          <br />
        </li>
      </ul>
      <p className="text-xs text-muted-foreground leading-4">
        注：如果部署的是新版本 Read Aloud，不应该出现 CORS 错误。如果是在 2025
        年 9 月之前部署的，请更新部署。如果依旧出现错误，请
        <a
          href="https://github.com/yy4382/read-aloud/issues/new?template=bug_report.md"
          className="text-blue-500"
        >
          打开一个 Bug 报告
        </a>
        。
      </p>
    </div>
  );
}
