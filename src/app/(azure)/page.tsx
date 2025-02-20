import { ApiInput } from "@/app/(azure)/api-input";
import { AppTopbar } from "@/components/modules/app-topbar";
import { AuditionPanel } from "@/app/(azure)/audition";
import { Export } from "./export";
import { VoiceConfigurer } from "./voice-configure";
export default function Home() {
  return (
    <div className="w-full">
      <AppTopbar location={[{ title: "面板" }, { title: "Azure TTS 导入" }]} />
      <div className="flex flex-col lg:flex-row px-4 lg:px-0 w-fit flex-grow gap-4 mx-auto my-4">
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
