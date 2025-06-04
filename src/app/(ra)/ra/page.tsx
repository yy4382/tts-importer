import { AppTopbar } from "@/components/modules/app-topbar";
import ApiUrl from "../api-url";
import { Suspense } from "react";
import { RaVoiceConfig } from "../(voice-config)/voice-config";
import { AudioPreviewRa } from "../(voice-config)/audio-preview";
import { ExportRa } from "../export";

export default function Home() {
  return (
    <div className="w-full">
      <AppTopbar location={[{ title: "面板" }, { title: "Edge TTS 导入" }]} />
      <div className="flex flex-col px-4 lg:px-0 w-fit flex-grow gap-4 mx-auto my-4">
        <Suspense>
          <ApiUrl />
        </Suspense>
        <RaVoiceConfig />
        <AudioPreviewRa />
        <ExportRa />
      </div>
    </div>
  );
}
