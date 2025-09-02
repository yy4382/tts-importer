"use client";

import { useAtomValue } from "jotai";
import { ApiConfigHelp, apiConfigReady, ApiInput } from "./api-input";
import { AudioPreviewAzure } from "./audition";
import { Export } from "./export";
import { VoiceConfigurer } from "./voice-configure";

export function AzurePanel() {
  const apiReady = useAtomValue(apiConfigReady);
  return (
    <div className="flex flex-col lg:flex-row px-4 lg:px-0 w-fit flex-grow gap-4 mx-auto my-4">
      {apiReady && (
        <div className="flex flex-col gap-4">
          <VoiceConfigurer />
          <AudioPreviewAzure />
        </div>
      )}
      <div className="flex flex-col gap-4">
        {apiReady && <Export />}
        {!apiReady && <ApiConfigHelp />}
        <ApiInput />
      </div>
    </div>
  );
}
