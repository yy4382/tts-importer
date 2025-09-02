import { AppTopbar } from "@/components/modules/app-topbar";
import ApiUrl, { ApiUrlHelp } from "./api-url";
import { Suspense } from "react";
import { RaVoiceConfig } from "./(voice-config)/voice-config";
import { AudioPreviewRa } from "./(voice-config)/audio-preview";
import { ExportRa } from "./export";

export default function Home() {
  return (
    <div className="w-full">
      <AppTopbar location={[{ title: "面板" }, { title: "Edge TTS 导入" }]} />
      <div className="flex flex-col xl:flex-row px-4 w-fit flex-grow gap-4 xl:gap-16 mx-auto my-16">
        <ApiUrlHelp />
        <div className="flex flex-col w-fit flex-grow gap-4 mx-auto">
          <Suspense>
            <ApiUrl />
          </Suspense>
          <RaVoiceConfig />
          <AudioPreviewRa />
          <ExportRa />
        </div>
      </div>
    </div>
  );
}
