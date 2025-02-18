"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ClientOnly } from "@/components/utils/client-only";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { atom, useAtom, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import {
  Voice,
  voiceListAtom,
  voiceListCountAtom,
} from "../api-input/api-input";
import { Skeleton } from "@/components/ui/skeleton";
import { validVoiceConfigSchema } from "@/lib/config-to-url";

export type VoiceConfig = z.infer<typeof validVoiceConfigSchema>;

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
  },
  undefined,
  { getOnInit: true }
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
  const { data, success } = validVoiceConfigSchema.safeParse({
    voice: input.voice.shortName,
    localName: input.voice.localName,
    format: input.format,
    pitch: input.pitch === "default" ? null : input.pitch,
    style:
      input.voice.styles &&
      input.voice.styles.length > 0 &&
      input.useStyle &&
      input.style
        ? input.style
        : null,
    customAgent:
      input.useCustomAgent && input.customAgent ? input.customAgent : null,
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
  const [open, setOpen] = useState(false);

  const [voice, setVoice] = useAtom(voiceAtom);
  const voiceList = useAtomValue(voiceListAtom);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 200);

  const filteredVoices = voiceList.filter((v) => {
    return (
      v.localName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      v.shortName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-1">
      <Label>语音</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("justify-between w-full")}
          >
            {voice?.localName || "Select a voice"}
            <ChevronsUpDown className="opacity-50" size={10} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn("p-0")}>
          <Command>
            <div className="relative border-b w-full">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search voices...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus-visible:ring-0 rounded-b-none border-none pl-8 flex-1"
              />
            </div>
            <CommandList>
              <CommandEmpty>No voice loaded.</CommandEmpty>
              <CommandGroup>
                {filteredVoices.map((option) => (
                  <CommandItem
                    key={option.shortName}
                    value={option.shortName}
                    onSelect={(currentValue) => {
                      setVoice(
                        voiceList.find((v) => v.shortName === currentValue) ||
                          null
                      );
                      setOpen(false);
                    }}
                    className="flex"
                  >
                    <p className="truncate">
                      {option.localName}
                      <span className="text-xs text-muted-foreground">
                        {"  " + option.shortName}
                      </span>
                    </p>{" "}
                    <Check
                      className={cn(
                        "ml-auto h-3 w-3",
                        voice?.shortName === option.shortName
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
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
