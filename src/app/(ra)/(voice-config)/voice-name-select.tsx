"use client";

import { VoiceSelect } from "@/components/shared/voice-select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
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
            <div className="flex items-center gap-3">
              <RadioGroupItem value="single" id="radio-single">
                单选
              </RadioGroupItem>
              <Label htmlFor="radio-single">单选</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="all" id="radio-all">
                全部
              </RadioGroupItem>
              <Label htmlFor="radio-all">全部</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="all-zh" id="radio-all-zh">
                全部中文
              </RadioGroupItem>
              <Label htmlFor="radio-all-zh">全部中文</Label>
            </div>
          </RadioGroup>
          {voiceName.type === "single" && (
            <SingleVoiceSelect
              voices={voices}
              value={voiceName.name}
              onChange={(v) => setVoiceName({ type: "single", name: v })}
            />
          )}
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
  const [onlyZh, setOnlyZh] = useState(true);
  const voicesFiltered = useMemo<string[]>(() => {
    if (onlyZh) {
      return voices?.filter((v) => v.startsWith("zh-"));
    }
    return voices;
  }, [voices, onlyZh]);

  return (
    <>
      {voicesFiltered && (
        <VoiceSelect
          voiceList={voicesFiltered.map(makeStandardVoice)}
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
    </>
  );
}
