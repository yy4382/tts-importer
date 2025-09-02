"use client";

import { Button } from "@/components/ui/button";
import { useAtomValue } from "jotai";
import { toast } from "sonner";
import {
  raApiConfigAtom,
  raStateSchema,
  validRaVoiceConfigAtom,
} from "./ra-data";
import {
  generateProfileLegado,
  generateProfileIreadnote,
} from "@/app/(ra)/generate-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { posthog } from "posthog-js";

function copyToClipboard(text: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      toast("已复制到剪贴板");
    })
    .catch(() => {
      toast("复制失败");
    });
}

function downloadFile(text: string, filename: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast("已开始下载配置文件，请使用软件的“本地导入”功能导入配置");
}

export function ExportRa() {
  const voiceConfig = useAtomValue(validRaVoiceConfigAtom);
  const api = useAtomValue(raApiConfigAtom);

  function onSubmit(type: "legado" | "ireadnote" | "sourcereader") {
    if (!api.url) {
      toast("API URL 未设置");
      return;
    }
    if (!voiceConfig) {
      toast("语音配置未设置");
      return;
    }

    const raState = raStateSchema.safeParse({ api, voice: voiceConfig });
    if (!raState.success) {
      toast("生成配置失败", {
        description: raState.error.issues
          .map((issue) => issue.message)
          .join(", "),
      });
      return;
    }

    const result = (() => {
      switch (type) {
        case "legado":
          return generateProfileLegado(raState.data);
        case "ireadnote":
          return generateProfileIreadnote(raState.data);
        case "sourcereader":
          return generateProfileLegado(raState.data);
      }
    })();

    posthog?.capture("profile exported", {
      type: "ra",
      app: type,
      method: "copy-profile",
    });

    switch (type) {
      case "ireadnote":
        copyToClipboard(result);
        break;
      case "legado":
        if (voiceConfig.voiceName.type === "single") {
          copyToClipboard(result);
        } else {
          downloadFile(
            result,
            `ra-profile-${type}-${voiceConfig.voiceName.type}.json`
          );
        }
        break;
      case "sourcereader":
        downloadFile(
          result,
          `ra-profile-${type}-${
            voiceConfig.voiceName.type === "single"
              ? voiceConfig.voiceName.name
              : voiceConfig.voiceName.type
          }.json`
        );
        break;
    }
  }

  return (
    <Card className="w-card">
      <CardHeader>
        <CardTitle>导出配置</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-row gap-2 flex-wrap">
        <Button onClick={() => onSubmit("legado")}>阅读配置</Button>
        <Button onClick={() => onSubmit("ireadnote")}>爱阅记配置</Button>
        <Button onClick={() => onSubmit("sourcereader")}>源阅读配置</Button>
      </CardContent>
    </Card>
  );
}
