"use client";
import type { VoiceConfig, ApiConfig } from "@/lib/azure/schema";
import { useCopyToClipboard } from "@/hooks/use-clipboard";
import genLegadoConfig, { DEFAULT_AZURE_RATE_TEMPLATE } from "@/lib/azure/legado";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { QrCodeIcon, CircleHelp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { config2urlNoThrow } from "@/lib/azure/config-to-url";
import { Separator } from "@/components/ui/separator";
import { QRCodeSVG } from "qrcode.react";
import { ActionLine } from "@/app/azure/export/action-line";
import { posthog } from "posthog-js";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function appendRateTemplate(baseUrl: string, rateTemplate: string) {
  if (!rateTemplate) return baseUrl;
  const url = new URL(baseUrl);
  url.searchParams.set("rate-template", rateTemplate);
  return url.toString();
}

export function LegadoExport({
  api,
  voiceConfig,
}: {
  api: ApiConfig;
  voiceConfig: VoiceConfig;
}) {
  const copy = useCopyToClipboard();
  const [rateTemplate, setRateTemplate] = useState("");

  const legadoConfig = useMemo(() => {
    return genLegadoConfig({ api, voice: voiceConfig }, rateTemplate || undefined);
  }, [api, voiceConfig, rateTemplate]);

  const baseConfigUrl = config2urlNoThrow(
    { api, voice: voiceConfig },
    window.location.origin,
    "/api/legado"
  );
  if (baseConfigUrl instanceof Error) {
    return <p>{baseConfigUrl.message}</p>;
  }

  const configUrl = appendRateTemplate(baseConfigUrl, rateTemplate);
  const directUrl = `legado://import/httpTTS?src=${encodeURIComponent(
    configUrl
  )}`;

  return (
    <div className="flex flex-col gap-2">
      <ActionLine
        action="二维码导入"
        description="使用装有阅读的设备扫描二维码"
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                posthog.capture("one-click export QR code open", {
                  type: "azure",
                  app: "legado",
                });
              }}
            >
              <QrCodeIcon />
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[min(500px,90%)]">
            <DialogHeader>
              <DialogTitle>二维码导入</DialogTitle>
              <DialogDescription>使用系统相机扫描二维码即可</DialogDescription>
            </DialogHeader>
            <div className="grid p-4 place-items-center">
              <ErrorBoundary
                errorComponent={() => <p>导入链接过长，无法生成二维码</p>}
              >
                <QRCodeSVG value={directUrl} size={256} />
              </ErrorBoundary>
            </div>
          </DialogContent>
        </Dialog>
      </ActionLine>
      <Separator />

      <ActionLine action="一键导入" description="在装有阅读的设备上点击">
        <Button asChild>
          <a
            href={directUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              posthog.capture("profile exported", {
                type: "azure",
                app: "legado",
                method: "one-click-export-button-click",
              });
            }}
          >
            导入
          </a>
        </Button>
      </ActionLine>
      <Separator />

      <ActionLine action="网络导入">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <CircleHelp />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <p>在朗读界面中「设置-朗读引擎-右上角三点-网络导入」中粘贴</p>
          </PopoverContent>
        </Popover>
        <Button
          onClick={() => {
            copy(configUrl);
            posthog.capture("profile exported", {
              type: "azure",
              app: "legado",
              method: "copy-profile-url",
            });
          }}
        >
          复制链接
        </Button>
      </ActionLine>
      <Separator />

      <ActionLine action="配置文本">
        <Button
          onClick={() => {
            copy(legadoConfig);
            posthog.capture("profile exported", {
              type: "azure",
              app: "legado",
              method: "copy-profile",
            });
          }}
        >
          复制
        </Button>
      </ActionLine>
      <Separator />

      <Label className="mt-2 flex flex-col gap-2 items-start">
        语速映射模板（可选）
        <Input
          value={rateTemplate}
          onChange={(e) => setRateTemplate(e.target.value)}
          placeholder={DEFAULT_AZURE_RATE_TEMPLATE}
        />
      </Label>
      <div className="prose dark:prose-invert prose-sm prose-p:my-1">
        <p>
          默认为 <code>{DEFAULT_AZURE_RATE_TEMPLATE}</code>。
          除非必要，请勿修改（保持留空即为默认值）。
        </p>
      </div>

      <p className="text-sm text-gray-500">
        同样适用于服务器端阅读等其他支持阅读格式语音源的软件。
      </p>
    </div>
  );
}
