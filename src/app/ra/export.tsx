"use client";

import { Button } from "@/components/ui/button";
import { useAtomValue } from "jotai";
import { toast } from "sonner";
import {
  LegadoSpecificConfig,
  RaApiConfig,
  raApiConfigAtom,
  RaState,
  raStateSchema,
  RaVoiceConfig,
  validRaVoiceConfigAtom,
} from "./ra-data";
import {
  generateProfileLegado,
  generateProfileIreadnote,
} from "@/app/ra/generate-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { posthog } from "posthog-js";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

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

function parseRaState(
  api: RaApiConfig,
  voiceConfig: RaVoiceConfig | null
): RaState | undefined {
  if (!api.url) {
    toast("API URL 未设置");
    return;
  }
  if (!voiceConfig) {
    toast("语音配置未设置");
    return;
  }
  const appState = raStateSchema.safeParse({ api, voice: voiceConfig });
  if (!appState.success) {
    toast("生成配置失败", {
      description: appState.error.issues
        .map((issue) => issue.message)
        .join(", "),
    });
    return;
  }
  return appState.data;
}

function capture(type: "legado" | "ireadnote" | "sourcereader") {
  posthog?.capture("profile exported", {
    type: "ra",
    app: type,
    method: "copy-profile",
  });
}

export function ExportRa() {
  return (
    <Card className="w-card">
      <CardHeader>
        <CardTitle>导出配置</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-row gap-2 flex-wrap">
        <Tabs defaultValue="legado">
          <TabsList className="-ml-1">
            <TabsTrigger value="legado">阅读</TabsTrigger>
            <TabsTrigger value="ireadnote">爱阅记</TabsTrigger>
            <TabsTrigger value="sourcereader">源阅读</TabsTrigger>
          </TabsList>
          <TabsContent value="legado">
            <LegadoPanel />
          </TabsContent>
          <TabsContent value="ireadnote">
            <IreadnotePanel />
          </TabsContent>
          <TabsContent value="sourcereader">
            <SourcereaderPanel />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function LegadoSpecificConfigComp({
  config,
  setConfig,
}: {
  config: LegadoSpecificConfig;
  setConfig: (config: LegadoSpecificConfig) => void;
}) {
  return (
    <div>
      <Label className="mt-4 flex flex-col gap-2 items-start">
        语速映射模板（可选）
        <Input
          value={config.rateTemplate}
          onChange={(e) =>
            setConfig({ ...config, rateTemplate: e.target.value })
          }
          placeholder="{{speakSpeed/10}}"
        />
      </Label>
      <div className="prose dark:prose-invert prose-sm mt-2 prose-p:my-1">
        <p>
          默认为 <code>{"{{speakSpeed/10}}"}</code>。
          除非必要，请勿修改（保持留空即为默认值）。
          <a
            href="https://github.com/yy4382/read-aloud/issues/12#issuecomment-3334516431"
            className="text-blue-500 underline"
          >
            查看详情
          </a>
        </p>
      </div>
    </div>
  );
}

function LegadoPanel() {
  const voiceConfig = useAtomValue(validRaVoiceConfigAtom);
  const api = useAtomValue(raApiConfigAtom);
  const [legadoConfig, setLegadoConfig] = useState<LegadoSpecificConfig>({
    rateTemplate: "",
  });

  function onExport() {
    const raState = parseRaState(api, voiceConfig);
    if (!raState) return;

    const result = generateProfileLegado(raState, legadoConfig);

    capture("legado");

    if (raState.voice.voiceName.type === "single") {
      copyToClipboard(result);
    } else {
      downloadFile(
        result,
        `ra-profile-legado-${raState.voice.voiceName.type}.json`
      );
    }
  }

  return (
    <div>
      <Button disabled={voiceConfig === null} onClick={onExport}>
        {voiceConfig?.voiceName.type === "single" ? "复制" : "下载"}阅读配置
      </Button>
      <div className="prose dark:prose-invert prose-sm mt-2 prose-p:my-1">
        <p>
          对于单个语音，复制配置后在「朗读引擎」界面先点击加号，再点击弹出窗口中三个点下拉菜单中的「粘贴源」
        </p>
        <p>
          对于多个语音，下载配置后在「朗读引擎」界面直接点三个点，选择本地导入即可。
        </p>
      </div>
      <LegadoSpecificConfigComp
        config={legadoConfig}
        setConfig={setLegadoConfig}
      />
    </div>
  );
}

function IreadnotePanel() {
  const voiceConfig = useAtomValue(validRaVoiceConfigAtom);
  const api = useAtomValue(raApiConfigAtom);

  function onExport() {
    const raState = parseRaState(api, voiceConfig);
    if (!raState) return;

    const result = generateProfileIreadnote(raState);

    capture("ireadnote");

    copyToClipboard(result);
  }

  return (
    <div>
      <Button disabled={voiceConfig === null} onClick={onExport}>
        复制爱阅记配置
      </Button>
      <div className="prose dark:prose-invert prose-sm mt-2 prose-p:my-1">
        <p>在线语音库管理 - 右上角三点 - JSON 输入 中粘贴即可。</p>
      </div>
    </div>
  );
}

function SourcereaderPanel() {
  const voiceConfig = useAtomValue(validRaVoiceConfigAtom);
  const api = useAtomValue(raApiConfigAtom);
  const [sourcereaderConfig, setSourcereaderConfig] =
    useState<LegadoSpecificConfig>({
      rateTemplate: "",
    });

  function onExport() {
    const raState = parseRaState(api, voiceConfig);
    if (!raState) return;

    const result = generateProfileLegado(raState, sourcereaderConfig);

    capture("sourcereader");

    const filename = `ra-profile-sourcereader-${
      raState.voice.voiceName.type === "single"
        ? raState.voice.voiceName.name
        : raState.voice.voiceName.type
    }.json`;

    downloadFile(result, filename);
  }

  return (
    <div>
      <Button disabled={voiceConfig === null} onClick={onExport}>
        下载源阅读配置
      </Button>
      <div className="prose dark:prose-invert prose-sm mt-2 prose-p:my-1">
        <p>使用「本地导入」功能导入即可。</p>
      </div>
      <LegadoSpecificConfigComp
        config={sourcereaderConfig}
        setConfig={setSourcereaderConfig}
      />
    </div>
  );
}
