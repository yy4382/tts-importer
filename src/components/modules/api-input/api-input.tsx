"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHasMounted } from "@/hooks/use-mounted";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { toast } from "sonner";

export type ApiConfig = {
  region: string;
  key: string;
};

const apiAtom = atomWithStorage<ApiConfig>(
  "tts-i:settings",
  {
    region: "eastasia",
    key: "",
  },
  undefined,
  { getOnInit: true }
);

export const apiConfig = atom((get) => get(apiAtom));

export type Voice = {
  shortName: string;
  localName: string;
  styles?: string[];
};

const writableVoiceListAtom = atomWithStorage<Voice[]>(
  "tts-i:voice-list",
  [],
  undefined,
  { getOnInit: true }
);

export const voiceListAtom = atom((get) => get(writableVoiceListAtom));
export const voiceListCountAtom = atom((get) => get(voiceListAtom).length);

export function ApiInput() {
  const [api, setApi] = useAtom(apiAtom);
  const setVoices = useSetAtom(writableVoiceListAtom);
  const hasMounted = useHasMounted();

  const voiceListCount = useAtomValue(voiceListCountAtom);

  const onGetVoices = async () => {
    // TODO error handling
    const resRaw = await fetch(
      `https://${api.region}.tts.speech.microsoft.com/cognitiveservices/voices/list`,
      {
        headers: {
          "Ocp-Apim-Subscription-Key": api.key,
        },
      }
    );
    const res = await resRaw.json();
    if (!Array.isArray(res)) {
      toast.error("获取声音列表失败");
      return;
    }
    const zhVoices = res
      .filter((voice) => voice.Locale.startsWith("zh"))
      .map((voice) => {
        const styles: string[] | undefined = voice.StyleList || undefined;
        return {
          localName: voice.LocalName,
          shortName: voice.ShortName,
          styles: styles,
        } satisfies Voice as Voice;
      });
    setVoices(zhVoices);
    toast.success(`获取到${zhVoices.length}个中文语音`);
  };

  return (
    <Card className="w-card">
      <CardHeader>
        <CardTitle>API Info</CardTitle>
        <CardDescription>Input your Azure API key and region.</CardDescription>
      </CardHeader>
      <CardContent>
        <form autoComplete="off">
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                placeholder="Azure region"
                value={api.region}
                onInput={(e) => {
                  const value = e.currentTarget.value;
                  setApi((prev) => ({ ...prev, region: value }));
                }}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="key">Key</Label>
              <Input
                id="key"
                placeholder="Azure API key"
                type="password"
                autoComplete="off"
                value={api.key}
                onInput={(e) => {
                  const value = e.currentTarget.value;
                  setApi((prev) => ({ ...prev, key: value }));
                }}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        {hasMounted ? (
          <span>
            {!voiceListCount
              ? "还未获取到语音"
              : `已获取 ${voiceListCount} 个语音`}
          </span>
        ) : (
          <span>Loading...</span>
        )}
        <Button onClick={onGetVoices}>获取声音列表</Button>
      </CardFooter>
    </Card>
  );
}
