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
import { usePostHog } from "posthog-js/react";

export function ExportRa() {
  const voiceConfig = useAtomValue(validRaVoiceConfigAtom);
  const api = useAtomValue(raApiConfigAtom);
  const posthog = usePostHog();

  function onSubmit(type: "legado" | "ireadnote" | "sourcereader") {
    if (!api.url) {
      toast("API URL 未设置");
      return;
    }
    if (!voiceConfig) {
      toast("语音配置未设置");
      return;
    }

    if (type === "sourcereader" && voiceConfig.voiceName.type !== "single") {
      toast("源阅读只支持单个语音");
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

    if (type === "ireadnote" || voiceConfig.voiceName.type === "single") {
      navigator.clipboard
        .writeText(result)
        .then(() => {
          toast("已复制到剪贴板");
        })
        .catch(() => {
          toast("复制失败");
        });
    } else {
      const blob = new Blob([result], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ra-profile-${type}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <Card className="w-card">
      <CardHeader>
        <CardTitle>导出配置</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-row gap-2 flex-wrap">
        <Button onClick={() => onSubmit("legado")}>复制阅读配置</Button>
        <Button onClick={() => onSubmit("ireadnote")}>复制爱阅记配置</Button>
        <Button onClick={() => onSubmit("sourcereader")}>复制源阅读配置</Button>
      </CardContent>
    </Card>
  );
}
