import { ApiInput } from "@/components/modules/api-input/api-input";
import { AuditionPanel } from "@/components/modules/audition/panel";
import { Export } from "@/components/modules/export";
import { VoiceConfigurer } from "@/components/modules/voice-configure";
export default function Home() {
  return (
    <div>
      <VoiceConfigurer />
      <Export />
      <AuditionPanel />
      <ApiInput />
    </div>
  );
}
