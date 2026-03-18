import { useState } from "react";
import { useCopyToClipboard } from "@/hooks/use-clipboard";
import { config2urlNoThrow } from "@/lib/azure/config-to-url";
import { ApiConfig, VoiceConfig } from "@/lib/azure/schema";
import { DEFAULT_AZURE_RATE_TEMPLATE } from "@/lib/azure/legado";
import { posthog } from "posthog-js";
import { ActionLine } from "@/app/azure/export/action-line";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CircleHelp, QrCodeIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function appendRateTemplate(baseUrl: string, rateTemplate: string) {
  if (!rateTemplate) return baseUrl;
  const url = new URL(baseUrl);
  url.searchParams.set("rate-template", rateTemplate);
  return url.toString();
}

export function SourceReaderExport({
  api,
  voiceConfig,
}: {
  api: ApiConfig;
  voiceConfig: VoiceConfig;
}) {
  const copy = useCopyToClipboard();
  const [rateTemplate, setRateTemplate] = useState("");

  const baseConfigUrl = config2urlNoThrow(
    { api, voice: voiceConfig },
    window.location.origin,
    "/api/legado"
  );
  if (baseConfigUrl instanceof Error) {
    return <p>{baseConfigUrl.message}</p>;
  }

  const configUrl = appendRateTemplate(baseConfigUrl, rateTemplate);

  return (
    <div className="flex flex-col gap-2">
      <ActionLine action="网络导入">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <CircleHelp />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <p>在「语音管理-右上角三点-网络导入」中粘贴</p>
          </PopoverContent>
        </Popover>
        <Button
          onClick={() => {
            copy(configUrl);
            posthog.capture("profile exported", {
              type: "azure",
              app: "source-reader",
              method: "copy-profile-url",
            });
          }}
        >
          复制链接
        </Button>
      </ActionLine>
      <Separator />
      <ActionLine action="二维码导入">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <CircleHelp />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <p>在「语音管理-右上角三点-二维码导入」中扫描二维码</p>
          </PopoverContent>
        </Popover>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                posthog.capture("one-click export QR code open", {
                  type: "azure",
                  app: "source-reader",
                });
              }}
            >
              <QrCodeIcon />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>二维码导入</DialogTitle>
              <DialogDescription>
                在「语音管理-右上角三点-二维码导入」中扫描二维码
              </DialogDescription>
            </DialogHeader>
            <div className="grid p-4 place-items-center">
              <ErrorBoundary
                errorComponent={() => <p>导入链接过长，无法生成二维码</p>}
              >
                <QRCodeSVG value={configUrl.toString()} size={256} />
              </ErrorBoundary>
            </div>
          </DialogContent>
        </Dialog>
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
    </div>
  );
}
