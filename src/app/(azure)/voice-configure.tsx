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
import Link from "next/link";
import { Voice, voiceListAtom, voiceListCountAtom } from "./api-input";
import {
  dedupeSpeakerStyle,
  VoiceConfig,
  voiceConfigSchema,
} from "@/lib/azure/schema";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type SpeakerSingleInput = {
  voice: Voice | null;
  useStyle: boolean;
  // TODO: multiple style support
  style: string;
};
type SpeakerListInput =
  | {
      type: "single";
      speaker: SpeakerSingleInput;
    }
  | {
      type: "all" | "all-zh";
      useAllStyle: boolean;
    };

function speakerListInputToVoiceConfig(
  input: SpeakerListInput,
  voiceList: Voice[]
): VoiceConfig["speakerConfig"] {
  if (input.type === "single") {
    if (input.speaker.voice === null) {
      throw new Error("voice is required");
    }
    return {
      type: "single",
      speaker: {
        name: input.speaker.voice.shortName,
        localName: input.speaker.voice.localName,
        style:
          input.speaker.useStyle && input.speaker.style // style may be empty even if useStyle is true, when toggle is on but haven't selected style
            ? [input.speaker.style]
            : [],
      },
    };
  } else {
    if (voiceList.length === 0) {
      throw new Error("speakers is required");
    }
    return {
      type: input.type,
      speakers: voiceList
        .filter((v) =>
          input.type === "all" ? true : v.shortName.startsWith("zh-")
        )
        .map((v) => ({
          name: v.shortName,
          localName: v.localName,
          style: input.useAllStyle ? [...(v.styles ?? []), null] : [],
        })),
    };
  }
}

type VoiceConfigInput = {
  speakerConfig: SpeakerListInput;
  format: string;
  pitch: string;
  useCustomAgent: boolean;
  customAgent: string;
};
const voiceConfigInputAtom = atom<VoiceConfigInput>({
  speakerConfig: {
    type: "single",
    speaker: {
      voice: null,
      useStyle: false,
      style: "",
    },
  },
  format: "audio-24khz-48kbitrate-mono-mp3",
  pitch: "default",
  useCustomAgent: false,
  customAgent: "",
});

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

  let speakerConfig: VoiceConfig["speakerConfig"];
  try {
    speakerConfig = speakerListInputToVoiceConfig(
      input.speakerConfig,
      get(voiceListAtom)
    );
  } catch {
    return { state: "no voice selected" };
  }
  const { data, success } = voiceConfigSchema.safeDecode({
    shared: {
      pitch: input.pitch,
      format: input.format,
      customUA:
        input.useCustomAgent && input.customAgent ? input.customAgent : null,
    },
    speakerConfig,
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
        <CardTitle>配置语音</CardTitle>
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
          <SpeakerSelector />
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

const speakerConfigAtom = atom(
  (get) => get(voiceConfigInputAtom).speakerConfig,
  (_, set, config: SpeakerListInput) => {
    set(voiceConfigInputAtom, (prev) => ({
      ...prev,
      speakerConfig: config,
    }));
  }
);
const exportCountAtom = atom((get) => {
  const voiceConfig = get(voiceConfigAtom);
  if (voiceConfig.state !== "success") {
    return 0;
  }
  const speakerConfig = voiceConfig.data.speakerConfig;
  if (speakerConfig.type === "single") {
    return dedupeSpeakerStyle(speakerConfig.speaker.style).length;
  } else {
    return speakerConfig.speakers.reduce((acc, speaker) => {
      return acc + dedupeSpeakerStyle(speaker.style).length;
    }, 0);
  }
});
function SpeakerSelector() {
  const [speakerConfig, setSpeakerConfig] = useAtom(speakerConfigAtom);
  const exportCount = useAtomValue(exportCountAtom);

  function onVoiceSelectChange(type: SpeakerListInput["type"]) {
    switch (type) {
      case "single":
        setSpeakerConfig({
          type: "single",
          speaker: {
            voice: null,
            useStyle: false,
            style: "",
          },
        });
        break;
      case "all":
      case "all-zh":
        setSpeakerConfig({
          type,
          useAllStyle: false,
        });
        break;
    }
  }
  return (
    <RadioGroup
      defaultValue="single"
      value={speakerConfig.type}
      onValueChange={onVoiceSelectChange}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <RadioGroupItem value="single" id="radio-single">
            单选
          </RadioGroupItem>
          <Label htmlFor="radio-single">单选</Label>
        </div>
        {speakerConfig.type === "single" && (
          <div className="ml-6">
            <SingleVoiceSelect
              speaker={speakerConfig.speaker}
              setSpeaker={(v) =>
                setSpeakerConfig({
                  type: "single",
                  speaker: v,
                })
              }
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <RadioGroupItem value="all-zh" id="radio-all-zh">
            全部中文
          </RadioGroupItem>
          <Label htmlFor="radio-all-zh">全部中文</Label>
        </div>

        {speakerConfig.type === "all-zh" && (
          <div className="ml-7 flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <Label>包含所有语音风格</Label>
              <Switch
                checked={speakerConfig.useAllStyle}
                onCheckedChange={(v) =>
                  setSpeakerConfig({
                    type: "all-zh",
                    useAllStyle: v,
                  })
                }
              />
            </div>
            <p className="text-sm text-muted-foreground">
              将导入 {exportCount} 个语音
              {exportCount > 250 && (
                <>
                  <br />
                  <span className="text-destructive">
                    数量过多，二维码或网络导入方式可能失败。
                  </span>
                </>
              )}
            </p>
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
        {speakerConfig.type === "all" && (
          <div className="ml-7 flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <Label>包含所有语音风格</Label>
              <Switch
                checked={speakerConfig.useAllStyle}
                onCheckedChange={(v) =>
                  setSpeakerConfig({
                    type: "all",
                    useAllStyle: v,
                  })
                }
              />
            </div>
            <p className="text-sm text-muted-foreground">
              将导入 {exportCount} 个语音
              {exportCount > 250 && (
                <>
                  <br />
                  <span className="text-destructive">
                    数量过多，二维码或网络导入方式可能失败。
                  </span>
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </RadioGroup>
  );
}

function SingleVoiceSelect({
  speaker,
  setSpeaker,
}: {
  speaker: SpeakerSingleInput;
  setSpeaker: (speaker: SpeakerSingleInput) => void;
}) {
  return (
    <div className="space-y-2">
      <VoiceSelector
        voice={speaker.voice}
        setVoice={(v) => setSpeaker({ voice: v, useStyle: false, style: "" })}
      />
      <StyleSelector
        style={speaker.style}
        useStyle={speaker.useStyle}
        setStyle={(v) => setSpeaker({ ...speaker, style: v })}
        setUseStyle={(v) =>
          setSpeaker({ ...speaker, useStyle: v, style: v ? speaker.style : "" })
        }
        options={speaker.voice?.styles ?? null}
      />
    </div>
  );
}

// MARK: voice-selector
export function VoiceSelector({
  voice,
  setVoice,
}: {
  voice: Voice | null;
  setVoice: (voice: Voice | null) => void;
}) {
  const voiceList = useAtomValue(voiceListAtom);

  return (
    <div className="space-y-1">
      <Label>语音</Label>
      <VoiceSelect voiceList={voiceList} voice={voice} setVoice={setVoice} />
    </div>
  );
}

function StyleSelector({
  style,
  setStyle,
  useStyle,
  setUseStyle,
  options,
}: {
  style: string;
  useStyle: boolean;
  setStyle: (style: string) => void;
  setUseStyle: (useStyle: boolean) => void;
  options: string[] | null;
}) {
  return options ? (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>使用语音风格</Label>
        <Switch checked={useStyle} onCheckedChange={(v) => setUseStyle(v)} />
      </div>
      <div className="space-y-1">
        <Label>风格</Label>
        <Select
          value={style}
          onValueChange={(v) => setStyle(v)}
          disabled={!useStyle}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="select style"></SelectValue>
          </SelectTrigger>
          <SelectContent>
            {options.map((style) => (
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
