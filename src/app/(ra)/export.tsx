"use client";

import { Button } from "@/components/ui/button";
import { useAtomValue } from "jotai";
import { toast } from "sonner";
import { raApiConfigAtom, validRaVoiceConfigAtom } from "./ra-data";
import { generateProfile } from "@/app/(ra)/generate-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    const result = generateProfile(type, api, voiceConfig);

    navigator.clipboard
      .writeText(typeof result === "string" ? result : JSON.stringify(result))
      .then(() => {
        toast("已复制到剪贴板");
      })
      .catch(() => {
        toast("复制失败");
      });
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
