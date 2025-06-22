"use client";
import type { VoiceConfig, ApiConfig } from "@/lib/azure/types";
import { useCopyToClipboard } from "@/hooks/use-clipboard";
import genIfreetimeConfig from "@/lib/azure/ifreetime";
import { useMemo } from "react";
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
import { config2url } from "@/lib/azure/config-to-url";
import { Separator } from "@/components/ui/separator";
import { QRCodeSVG } from "qrcode.react";
import { ActionLine } from "@/components/ui/action-line";
import LinkExportButton from "./link-export-button";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function IFreeTimeExport({
  api,
  voiceConfig,
}: {
  api: ApiConfig;
  voiceConfig: VoiceConfig;
}) {
  const copy = useCopyToClipboard();
  const posthog = usePostHog();

  const ifreetimeConfig = useMemo(() => {
    return genIfreetimeConfig(api, voiceConfig);
  }, [api, voiceConfig]);

  const configUrl = useMemo(() => {
    return config2url(
      api,
      voiceConfig,
      window.location.origin,
      "/api/ifreetime"
    ).toString();
  }, [api, voiceConfig]);

  const directUrl = useMemo(
    () => `iReadNote://import/itts=${configUrl}`,
    [configUrl]
  );

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
                  app: "ifreetime",
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
                app: "ifreetime",
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
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <CircleHelp />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="space-y-2">
            <p>
              <span className="font-semibold">爱阅记导入：</span>
              <br />
              <span className="text-muted-foreground">
                复制后粘贴在「设置-听书-在线语音库管理-右上角三点-JSON 输入」中
              </span>
            </p>
            <p>
              <span className="font-semibold">爱阅书香使用：</span>
              <br />
              <span className="text-muted-foreground">
                参考
                <Link href="/help/ifreetime" className="text-blue-500">
                  爱阅系列使用说明
                </Link>
              </span>
            </p>
          </PopoverContent>
        </Popover>
        <Button
          onClick={() => {
            copy(ifreetimeConfig);
            posthog.capture("profile exported", {
              type: "azure",
              app: "ifreetime",
              method: "copy-profile",
            });
          }}
        >
          复制
        </Button>
      </ActionLine>
      <p className="text-sm text-gray-500">
        爱阅书香用户请查看
        <Link href="/help/ifreetime" className="text-blue-500">
          爱阅系列使用说明
        </Link>
        手动导入
      </p>
    </div>
  );
}
