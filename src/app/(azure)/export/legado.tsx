"use client";
import type { VoiceConfig, ApiConfig } from "@/lib/azure/schema";
import { useCopyToClipboard } from "@/hooks/use-clipboard";
import genLegadoConfig from "@/lib/azure/legado";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { QrCodeIcon } from "lucide-react";
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
import { ActionLine } from "@/components/ui/action-line";
import LinkExportButton from "./link-export-button";
import { usePostHog } from "posthog-js/react";

export function LegadoExport({
  api,
  voiceConfig,
}: {
  api: ApiConfig;
  voiceConfig: VoiceConfig;
}) {
  const copy = useCopyToClipboard();
  const posthog = usePostHog();

  const legadoConfig = useMemo(() => {
    return genLegadoConfig({ api, voice: voiceConfig });
  }, [api, voiceConfig]);

  const configUrl = config2urlNoThrow(
    { api, voice: voiceConfig },
    window.location.origin,
    "/api/legado"
  );
  if (configUrl instanceof Error) {
    return <p>{configUrl.message}</p>;
  }

  const directUrl = `legado://import/httpTTS?src=${encodeURIComponent(
    configUrl
  )}`;

  return (
    <div className="flex flex-col gap-2">
      <ActionLine action="一键导入">
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
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>一键导入</DialogTitle>
              <DialogDescription>使用系统相机扫描二维码即可</DialogDescription>
            </DialogHeader>
            <div className="grid p-4 place-items-center">
              <QRCodeSVG value={directUrl} size={256} />
            </div>
            <div className="flex gap-4 justify-end">
              <LinkExportButton link={configUrl}>配置链接</LinkExportButton>
              <LinkExportButton link={directUrl}>一键导入</LinkExportButton>
            </div>
          </DialogContent>
        </Dialog>
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
      <p className="text-sm text-gray-500">
        同样适用于服务器端阅读等其他支持阅读格式语音源的软件。
      </p>
    </div>
  );
}
