import { ApiInput } from "@/components/modules/api-input/api-input";
import { AppTopbar } from "@/components/modules/app-topbar";
import { AuditionPanel } from "@/components/modules/audition/panel";
import { Export } from "@/components/modules/export";
import { VoiceConfigurer } from "@/components/modules/voice-configure";
export default function Home() {
  return (
    <div className="w-full">
      <AppTopbar location={[{ title: "面板" }, { title: "Azure TTS 导入" }]} />
      <div className="flex flex-col sm:flex-row px-4 sm:px-0 w-fit flex-grow gap-4 mx-auto">
        <div className="flex flex-col gap-4">
          <VoiceConfigurer />
          <AuditionPanel />
        </div>
        <div className="flex flex-col gap-4">
          <Export />
          <ApiInput />
        </div>
      </div>
    </div>
  );
}
