"use client";

import { VoiceSelect } from "@/components/shared/voice-select";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import {
  RaVoiceName,
  raVoiceNameAtom,
  voiceListQueryOptions,
} from "../ra-data";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAtom } from "jotai";

function makeStandardVoice(voices: string) {
  return {
    shortName: voices,
    localName: undefined,
  };
}

export function VoiceNameSelect() {
  const {
    data: voices,
    isError,
    isLoading,
    error,
  } = useQuery(voiceListQueryOptions);

  const [voiceName, setVoiceName] = useAtom(raVoiceNameAtom);

  function onVoiceSelectChange(type: RaVoiceName["type"]) {
    if (!voices) return;
    switch (type) {
      case "single": {
        const voice = voices.find((v) => v.startsWith("zh-"));
        if (voice) {
          setVoiceName({ type: "single", name: voice });
        } else {
          setVoiceName({ type: "single", name: voices[0] });
        }
        break;
      }
      case "all": {
        setVoiceName({ type: "all", nameList: voices });
        break;
      }
      case "all-zh": {
        setVoiceName({
          type: "all-zh",
          nameList: voices.filter((v) => v.startsWith("zh-")),
        });
        break;
      }
    }
  }

  return (
    <div className="w-full grid gap-2">
      {isError && <div className="text-destructive">{error?.message}</div>}
      {isLoading && <div>加载中...</div>}
      {voices && (
        <>
          <RadioGroup
            defaultValue="single"
            value={voiceName.type}
            onValueChange={onVoiceSelectChange}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="single" id="radio-single">
                  单选
                </RadioGroupItem>
                <Label htmlFor="radio-single">单选</Label>
              </div>
              {voiceName.type === "single" && (
                <div className="ml-6">
                  <SingleVoiceSelect
                    voices={voices}
                    value={voiceName.name}
                    onChange={(v) => setVoiceName({ type: "single", name: v })}
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="all" id="radio-all">
                  全部
                </RadioGroupItem>
                <Label htmlFor="radio-all">全部</Label>
              </div>
              {voiceName.type === "all" && (
                <p className="ml-6 text-sm text-muted-foreground">
                  将导入 {voiceName.nameList.length} 个语音
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="all-zh" id="radio-all-zh">
                  全部中文
                </RadioGroupItem>
                <Label htmlFor="radio-all-zh">全部中文</Label>
              </div>
              {voiceName.type === "all-zh" && (
                <p className="ml-6 text-sm text-muted-foreground">
                  将导入 {voiceName.nameList.length} 个语音
                </p>
              )}
            </div>
          </RadioGroup>
        </>
      )}
    </div>
  );
}

function SingleVoiceSelect({
  voices,
  value,
  onChange,
}: {
  voices: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <>
      {voices && (
        <VoiceSelect
          voiceList={voices.map(makeStandardVoice)}
          voice={makeStandardVoice(value)}
          setVoice={(v) => {
            if (v) onChange(v?.shortName ?? "");
          }}
        />
      )}
    </>
  );
}
