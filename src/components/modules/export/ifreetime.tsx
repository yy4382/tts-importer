"use client";
import type { VoiceConfig, ApiConfig } from "@/lib/types";
import { useCopyToClipboard } from "@/hooks/use-clipboard";
import genIfreetimeConfig from "@/lib/ifreetime";
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
import { config2url } from "@/lib/config-to-url";
import { Separator } from "@/components/ui/separator";
import { QRCodeSVG } from "qrcode.react";
import { ActionLine } from "@/components/ui/action-line";
import LinkExportButton from "./link-export-button";
import Link from "next/link";

export function IFreeTimeExport({
  api,
  voiceConfig,
}: {
  api: ApiConfig;
  voiceConfig: VoiceConfig;
}) {
  const copy = useCopyToClipboard();

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
      <ActionLine action="一键导入" description="仅适用于爱阅记">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
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
              <LinkExportButton link={configUrl} copy={copy}>
                配置链接
              </LinkExportButton>
              <LinkExportButton link={directUrl} copy={copy}>
                一键导入
              </LinkExportButton>
            </div>
          </DialogContent>
        </Dialog>
        <Button asChild>
          <a href={directUrl} target="_blank" rel="noreferrer">
            导入
          </a>
        </Button>
      </ActionLine>
      <Separator />
      <ActionLine action="配置文本">
        <Button
          onClick={() => {
            copy(ifreetimeConfig);
          }}
        >
          复制
        </Button>
      </ActionLine>
      <p className="text-sm text-gray-500">
        帮助请查看
        <Link href="/help/ifreetime" className="text-blue-500">
          爱阅系列使用说明
        </Link>
      </p>
    </div>
  );
}
