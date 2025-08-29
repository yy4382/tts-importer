import { useCopyToClipboard } from "@/hooks/use-clipboard";
import { config2urlNoThrow } from "@/lib/azure/config-to-url";
import { ApiConfig, VoiceConfig } from "@/lib/azure/schema";
import { usePostHog } from "posthog-js/react";
import { ActionLine } from "@/components/ui/action-line";
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

export function SourceReaderExport({
  api,
  voiceConfig,
}: {
  api: ApiConfig;
  voiceConfig: VoiceConfig;
}) {
  const copy = useCopyToClipboard();
  const posthog = usePostHog();

  const configUrl = config2urlNoThrow(
    { api, voice: voiceConfig },
    window.location.origin,
    "/api/legado"
  );
  if (configUrl instanceof Error) {
    return <p>{configUrl.message}</p>;
  }

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
        <Button onClick={() => copy(configUrl)}>复制链接</Button>
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
    </div>
  );
}
