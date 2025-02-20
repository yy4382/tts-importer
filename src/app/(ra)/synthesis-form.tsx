"use client";
import { VoiceSelect } from "@/components/shared/voice-select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateProfile } from "@/lib/generate-profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { raApiConfigAtom } from "./api-url";

const formSchema = z.object({
  voiceName: z.string(),
  pitch: z.string(),
  rate: z.string(),
  text: z.string(),
  format: z.string(),
  volume: z.string(),
});

function FromWrapper() {
  const api = useAtomValue(raApiConfigAtom);
  return api.url ? <SynthesisFormInner /> : <></>;
}

export { FromWrapper as SynthesisForm };

function SynthesisFormInner() {
  const api = useAtomValue(raApiConfigAtom);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      voiceName: "zh-CN-XiaoxiaoNeural",
      pitch: "",
      rate: "",
      text: "",
      format: "audio-24khz-48kbitrate-mono-mp3",
      volume: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(
    values: z.infer<typeof formSchema>,
    type: "legado" | "ireadnote" | "sourcereader",
    e?: React.MouseEvent<HTMLButtonElement>
  ) {
    if (e) {
      e.preventDefault();
    }
    if (!api.url) {
      toast("API URL 未设置");
      return;
    }
    console.log(values);
    const result = generateProfile(type, api.url, values);
    navigator.clipboard
      .writeText(typeof result === "string" ? result : JSON.stringify(result))
      .then(() => {
        toast("已复制到剪贴板");
      })
      .catch(() => {
        toast("复制失败");
      });
  }

  function tryListen(values: z.infer<typeof formSchema>) {
    if (!api.url) {
      toast("API URL 未设置");
      return;
    }
    const url = new URL(api.url);
    url.pathname = "/api/synthesis";

    // Use for...in to set URL parameters
    for (const key in values) {
      const value = values[key as keyof typeof values];
      // Set default text to "你好" if empty
      if (key === "text" && value === "") {
        url.searchParams.set(key, "你好");
      } else {
        // Only set parameter if value is not empty
        if (value !== "") {
          url.searchParams.set(key, value);
        }
      }
    }
    url.searchParams.set("token", api.token);

    console.log(url.toString());
    setAudioUrl(url.toString());
  }

  return (
    <Card className="w-card">
      <CardHeader>合成</CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-2">
            <FormField
              control={form.control}
              name="voiceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voice Name</FormLabel>
                  <FormControl>
                    <VoiceNameSelect
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>声音名称。</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Text</FormLabel>
                  <FormControl>
                    <Textarea placeholder="text" {...field} />
                  </FormControl>
                  <FormDescription>试听时使用。</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>高级配置</AccordionTrigger>
                <AccordionContent className="px-2">
                  <p className="text-sm mb-2">
                    高级配置，请参考{" "}
                    <a
                      href="https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-voice#adjust-prosody"
                      className="text-blue-500 hover:underline"
                    >
                      Microsoft 官方文档
                    </a>
                  </p>
                  {(["pitch", "rate", "volume", "format"] as const).map(
                    (key) => (
                      <FormField
                        key={key}
                        control={form.control}
                        name={key}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                            </FormLabel>
                            <FormControl>
                              <Input placeholder={key} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <section className="flex gap-2 flex-wrap">
              <Button onClick={(e) => onSubmit(form.getValues(), "legado", e)}>
                复制阅读配置
              </Button>
              <Button
                onClick={(e) => onSubmit(form.getValues(), "ireadnote", e)}
              >
                复制爱阅记配置
              </Button>
              <Button
                onClick={(e) => onSubmit(form.getValues(), "sourcereader", e)}
              >
                复制源阅读配置
              </Button>
              <Button onClick={form.handleSubmit(tryListen)}>试听</Button>
              <Button type="reset" onClick={() => form.reset()}>
                重置
              </Button>
            </section>
          </form>
        </Form>
        <AudioPlayer url={audioUrl} />
      </CardContent>
    </Card>
  );
}

function AudioPlayer({ url }: { url: string | null }) {
  return (
    <>
      {url && (
        <audio src={url} controls>
          <track kind="captions" />
        </audio>
      )}
    </>
  );
}

async function fetchVoices() {
  const res = await fetch(
    "https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list?trustedclienttoken=6A5AA1D4EAFF4E9FB37E23D68491D6F4"
  );
  return ((await res.json()) as { ShortName: string }[])
    .map((v) => v["ShortName"])
    .filter((v: string) => v.startsWith("zh-"));
}

const raVoiceListAtom = atomWithStorage("tts-i:ra-voice-list", [] as string[]);

const raVoiceListStandardForm = atom((get) =>
  get(raVoiceListAtom).map((v) => makeStandardVoice(v))
);

function makeStandardVoice(voices: string) {
  return {
    shortName: voices,
    localName: undefined,
  };
}

function VoiceNameSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const voices = useAtomValue(raVoiceListStandardForm);
  const setVoices = useSetAtom(raVoiceListAtom);

  useEffect(() => {
    fetchVoices().then((vs) => {
      setVoices(vs);
    });
  }, [setVoices]);

  return (
    <VoiceSelect
      voiceList={voices}
      voice={makeStandardVoice(value)}
      setVoice={(v) => {
        if (v) onChange(v?.shortName ?? "");
      }}
    />
  );
}
