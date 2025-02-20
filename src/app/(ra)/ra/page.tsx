import { AppTopbar } from "@/components/modules/app-topbar";
import ApiUrl from "../api-url";
import { SynthesisForm } from "../synthesis-form";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="w-full">
      <AppTopbar location={[{ title: "面板" }, { title: "Edge TTS 导入" }]} />
      <div className="flex flex-col lg:flex-row px-4 lg:px-0 w-fit flex-grow gap-4 mx-auto my-4">
        <Suspense>
          <ApiUrl />
        </Suspense>
        <SynthesisForm />
      </div>
    </div>
  );
}
