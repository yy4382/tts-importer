"use client";
import { VoiceSelect } from "@/components/shared/voice-select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ClientOnly } from "@/components/utils/client-only";
import { atom, useAtom, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import Link from "next/link";
import { Voice, voiceListAtom, voiceListCountAtom } from "./api-input";
import { VoiceConfig, voiceConfigSchema } from "@/lib/azure/schema";

type VoiceConfigInput = {
  voice: Voice | null;
  useStyle: boolean;
  style: string;
  format: string;
  pitch: string;
  useCustomAgent: boolean;
  customAgent: string;
};
const voiceConfigInputAtom = atomWithStorage<VoiceConfigInput>(
  "tts-i:voice-config-input",
  {
    voice: null,
    useStyle: false,
    style: "",
    format: "audio-24khz-48kbitrate-mono-mp3",
    pitch: "default",
    useCustomAgent: false,
    customAgent: "",
  }
);

export type VoiceConfigWithState =
  | {
      state: "success";
      data: VoiceConfig;
    }
  | {
      state: "no voice available" | "parse error" | "no voice selected";
    };

export const voiceConfigAtom = atom<VoiceConfigWithState>((get) => {
  if (get(voiceListCountAtom) === 0) {
    return {
      state: "no voice available",
    };
  }
  const input = get(voiceConfigInputAtom);
  if (!input.voice) {
    return {
      state: "no voice selected",
    };
  }
  const { data, success } = voiceConfigSchema.safeDecode({
    shared: {
      pitch: input.pitch,
      format: input.format,
      customUA:
        input.useCustomAgent && input.customAgent ? input.customAgent : null,
    },
    speakerConfig: {
      type: "single",
      speaker: {
        name: input.voice.shortName,
        localName: input.voice.localName,
        style:
          input.voice.styles &&
          input.voice.styles.length > 0 &&
          input.useStyle &&
          input.style
            ? [input.style]
            : [],
      },
    },
  });
  if (!success) {
    return {
      state: "parse error",
    };
  }
  return {
    state: "success",
    data,
  };
});

export function VoiceConfigurer() {
  const voiceCount = useAtomValue(voiceListCountAtom);
  return (
    <Card className="w-card">
      <CardHeader>
        <CardTitle>Configure Voice</CardTitle>
      </CardHeader>
      <CardContent>
        <ClientOnly
          className="space-y-4"
          serverFallback={<Skeleton className="h-96 w-full" />}
        >
          {voiceCount === 0 && (
            <p>
              还没有获取到语音。请填写并检查
              <Link href="#api-info" className="text-blue-500">
                {" "}
                API 设置
              </Link>
            </p>
          )}
          <VoiceSelector />
          <Separator />
          <StyleSelector />
          <Separator />
          <PitchSelector />
          <Separator />
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>高级设置</AccordionTrigger>
              <AccordionContent className="space-y-4 px-1">
                <FormatSelector />
                <Separator />
                <UASelector />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ClientOnly>
      </CardContent>
    </Card>
  );
}

// MARK: voice-selector
const voiceAtom = atom(
  (get) => get(voiceConfigInputAtom).voice,
  (_, set, voice: Voice | null) => {
    set(voiceConfigInputAtom, (prev) => ({
      ...prev,
      voice,
      style: "",
      useStyle: false,
    }));
  }
);
export function VoiceSelector() {
  const [voice, setVoice] = useAtom(voiceAtom);
  const voiceList = useAtomValue(voiceListAtom);

  return (
    <div className="space-y-1">
      <Label>语音</Label>
      <VoiceSelect voiceList={voiceList} voice={voice} setVoice={setVoice} />
    </div>
  );
}

// MARK: style-selector
const styleInputAtom = atom(
  (get) => {
    const opts = get(voiceConfigInputAtom).voice?.styles;
    return {
      options: opts?.length ? opts : null,
      useStyle: get(voiceConfigInputAtom).useStyle,
      style: get(voiceConfigInputAtom).style,
    };
  },
  (get, set, update: Pick<VoiceConfigInput, "useStyle" | "style">) => {
    set(voiceConfigInputAtom, {
      ...get(voiceConfigInputAtom),
      ...update,
    });
  }
);
function StyleSelector() {
  const [styleInput, setStyleInput] = useAtom(styleInputAtom);
  return styleInput.options ? (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>使用语音风格</Label>
        <Switch
          checked={styleInput.useStyle}
          onCheckedChange={(v) => setStyleInput({ useStyle: v, style: "" })}
        />
      </div>
      <div className="space-y-1">
        <Label>风格</Label>
        <Select
          value={styleInput.style}
          onValueChange={(v) =>
            setStyleInput({ useStyle: styleInput.useStyle, style: v })
          }
          disabled={!styleInput.useStyle}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="select style"></SelectValue>
          </SelectTrigger>
          <SelectContent>
            {styleInput.options.map((style) => (
              <SelectItem key={style} value={style}>
                {style}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  ) : (
    <p>该语音没有可用的风格</p>
  );
}

// MARK: pitch-selector
const pitchAtom = atom(
  (get) => get(voiceConfigInputAtom).pitch,
  (_, set, pitch: string) =>
    set(voiceConfigInputAtom, (prev) => ({ ...prev, pitch }))
);
function PitchSelector() {
  const [pitch, setPitch] = useAtom(pitchAtom);
  return (
    <div className="space-y-1">
      <Label>音调</Label>
      <Select value={pitch} onValueChange={(v) => setPitch(v)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="select pitch"></SelectValue>
        </SelectTrigger>
        <SelectContent>
          {pitchOptions.map((pitch) => (
            <SelectItem key={pitch.id} value={pitch.id}>
              {pitch.desc}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// MARK: format-selector
const formatAtom = atom(
  (get) => get(voiceConfigInputAtom).format,
  (_, set, format: string) =>
    set(voiceConfigInputAtom, (prev) => ({ ...prev, format }))
);
function FormatSelector() {
  const [format, setFormat] = useAtom(formatAtom);
  return (
    <div className="space-y-1">
      <Label>格式(有些不可用)</Label>{" "}
      <div className="flex gap-1 w-full">
        <Select value={format} onValueChange={(v) => setFormat(v)}>
          <SelectTrigger className="flex-shrink overflow-hidden">
            <SelectValue placeholder="select format"></SelectValue>
          </SelectTrigger>
          <SelectContent>
            {audioFormat.map((format) => (
              <SelectItem key={format} value={format}>
                {format}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>{" "}
        <Button onClick={() => setFormat("audio-24khz-48kbitrate-mono-mp3")}>
          重置
        </Button>
      </div>
    </div>
  );
}

// MARK: ua-selector
const UAInputAtom = atom(
  (get) => ({
    useCustomAgent: get(voiceConfigInputAtom).useCustomAgent,
    customAgent: get(voiceConfigInputAtom).customAgent,
  }),
  (
    get,
    set,
    update: Pick<VoiceConfigInput, "useCustomAgent" | "customAgent">
  ) => {
    set(voiceConfigInputAtom, {
      ...get(voiceConfigInputAtom),
      ...update,
    });
  }
);
function UASelector() {
  const [ua, setUA] = useAtom(UAInputAtom);
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>使用自定义 UA</Label>
        <Switch
          checked={ua.useCustomAgent}
          onCheckedChange={(v) => setUA({ ...ua, useCustomAgent: v })}
        />
      </div>
      <div className="space-y-1">
        <Label>UA</Label>
        <Input
          value={ua.customAgent}
          onInput={(e) =>
            setUA({
              ...ua,
              customAgent: e.currentTarget.value,
            })
          }
          disabled={!ua.useCustomAgent}
        />
      </div>
    </div>
  );
}

export const pitchOptions = [
  { id: "default", desc: "默认 (default)" },
  { id: "x-low", desc: "极低 (x-low)" },
  { id: "low", desc: "低 (low)" },
  { id: "medium", desc: "中 (medium)" },
  { id: "high", desc: "高 (high)" },
  { id: "x-high", desc: "极高 (x-high)" },
];
export const audioFormat = [
  "amr-wb-16000hz",
  "audio-16khz-16bit-32kbps-mono-opus",
  "audio-16khz-32kbitrate-mono-mp3",
  "audio-16khz-64kbitrate-mono-mp3",
  "audio-16khz-128kbitrate-mono-mp3",
  "audio-24khz-16bit-24kbps-mono-opus",
  "audio-24khz-16bit-48kbps-mono-opus",
  "audio-24khz-48kbitrate-mono-mp3",
  "audio-24khz-96kbitrate-mono-mp3",
  "audio-24khz-160kbitrate-mono-mp3",
  "audio-48khz-96kbitrate-mono-mp3",
  "audio-48khz-192kbitrate-mono-mp3",
  "ogg-16khz-16bit-mono-opus",
  "ogg-24khz-16bit-mono-opus",
  "ogg-48khz-16bit-mono-opus",
  "raw-8khz-8bit-mono-alaw",
  "raw-8khz-8bit-mono-mulaw",
  "raw-8khz-16bit-mono-pcm",
  "raw-16khz-16bit-mono-pcm",
  "raw-16khz-16bit-mono-truesilk",
  "raw-22050hz-16bit-mono-pcm",
  "raw-24khz-16bit-mono-pcm",
  "raw-24khz-16bit-mono-truesilk",
  "raw-44100hz-16bit-mono-pcm",
  "raw-48khz-16bit-mono-pcm",
  "webm-16khz-16bit-mono-opus",
  "webm-24khz-16bit-24kbps-mono-opus",
  "webm-24khz-16bit-mono-opus",
];
