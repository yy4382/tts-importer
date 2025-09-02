import { AppTopbar } from "@/components/modules/app-topbar";
import { AzurePanel } from "./panel";
import { ClientOnly } from "@/components/utils/client-only";
import { Loader2 } from "lucide-react";

export default function Home() {
  return (
    <div className="w-full">
      <AppTopbar location={[{ title: "面板" }, { title: "Azure TTS 导入" }]} />
      <ClientOnly
        serverFallback={
          <div className="text-center h-full flex items-center justify-center text-xl">
            <Loader2 className="animate-spin mr-2" />
            初始化中...
          </div>
        }
      >
        <AzurePanel />
      </ClientOnly>
    </div>
  );
}
