"use client";

import { VoiceSelect } from "@/components/shared/voice-select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ChevronsUpDown } from "lucide-react";

async function fetchVoices() {
  const res = await fetch(
    "https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list?trustedclienttoken=6A5AA1D4EAFF4E9FB37E23D68491D6F4"
  );
  return ((await res.json()) as { ShortName: string }[]).map(
    (v) => v["ShortName"]
  );
}

function makeStandardVoice(voices: string) {
  return {
    shortName: voices,
    localName: undefined,
  };
}

export function VoiceNameSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [onlyZh, setOnlyZh] = useState(true);

  const {
    data: voicesAll,
    isError,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ra-voice-list"],
    queryFn: fetchVoices,
  });

  const voices = useMemo<string[] | undefined>(() => {
    if (onlyZh) {
      return voicesAll?.filter((v) => v.startsWith("zh-"));
    }
    return voicesAll;
  }, [voicesAll, onlyZh]);

  return (
    <div className="w-full grid gap-2">
      {isError && <div className="text-destructive">{error?.message}</div>}
      {isLoading && (
        <Button
          variant="outline"
          role="combobox"
          disabled
          className={cn("justify-between w-full")}
        >
          加载中...
          <ChevronsUpDown className="opacity-50" size={10} />
        </Button>
      )}
      {voices && (
        <VoiceSelect
          voiceList={voices.map(makeStandardVoice)}
          voice={makeStandardVoice(value)}
          setVoice={(v) => {
            if (v) onChange(v?.shortName ?? "");
          }}
        />
      )}
      <div className="flex items-center gap-2">
        <Switch
          id="only-zh"
          checked={onlyZh}
          onCheckedChange={() => setOnlyZh(!onlyZh)}
        />
        <Label htmlFor="only-zh">仅显示中文语音</Label>
      </div>
    </div>
  );
}
