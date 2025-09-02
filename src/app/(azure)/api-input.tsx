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
import Link from "next/link";
import { posthog } from "posthog-js";
import { ApiConfig, apiConfigSchema } from "@/lib/azure/schema";

const apiAtom = atomWithStorage<ApiConfig>("tts-i:settings", {
  region: "",
  key: "",
});

export const apiConfig = atom((get) => get(apiAtom));
export const apiConfigReady = atom(
  (get) =>
    apiConfigSchema.safeParse(get(apiAtom)).success &&
    get(voiceListAtom).length > 0
);

export type Voice = {
  shortName: string;
  localName: string;
  styles?: string[];
};

const writableVoiceListAtom = atomWithStorage<Voice[]>("tts-i:voice-list", []);

export const voiceListAtom = atom((get) => get(writableVoiceListAtom));
export const voiceListCountAtom = atom((get) => get(voiceListAtom).length);

export function ApiInput() {
  const [api, setApi] = useAtom(apiAtom);
  const setVoices = useSetAtom(writableVoiceListAtom);
  const hasMounted = useHasMounted();

  const voiceListCount = useAtomValue(voiceListCountAtom);

  const onGetVoices = async () => {
    // TODO error handling
    let resRaw;
    try {
      resRaw = await fetch(
        `https://${api.region}.tts.speech.microsoft.com/cognitiveservices/voices/list`,
        {
          headers: {
            "Ocp-Apim-Subscription-Key": api.key,
          },
        }
      );
    } catch (e) {
      toast.error("获取声音列表失败：无法连接到微软服务器。");
      console.error(e);
      return;
    }
    if (!resRaw.ok) {
      toast.error(
        `获取声音列表失败：微软服务器响应 ${resRaw.status}。请检查 Key 和 Region 是否正确。`
      );
      return;
    }
    const res = await resRaw.json();
    if (!Array.isArray(res)) {
      toast.error("获取声音列表失败");
      return;
    }
    const voices = res.map((voice) => {
      const styles: string[] | undefined = voice.StyleList || undefined;
      return {
        localName: voice.LocalName,
        shortName: voice.ShortName,
        styles: styles,
      } satisfies Voice as Voice;
    });
    setVoices(voices);
    toast.success(`获取到${voices.length}个语音`);
    posthog.capture("azure voices fetched");
  };

  return (
    <Card className="w-card">
      <CardHeader>
        <CardTitle id="api-info">API 设置</CardTitle>
        <CardDescription>
          需要填写 Azure API 密钥和区域来使用 Azure TTS。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form autoComplete="off">
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="region">区域</Label>
              <Input
                id="region"
                placeholder="Azure 语音服务的区域，如 eastasia"
                value={api.region}
                onInput={(e) => {
                  const value = e.currentTarget.value;
                  setApi((prev) => ({ ...prev, region: value }));
                }}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="key">密钥</Label>
              <Input
                id="key"
                placeholder="Azure 语音服务的密钥"
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
      <CardFooter className="flex flex-col gap-4 items-start">
        <div className="flex justify-between w-full items-center">
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
        </div>
        <p className="text-sm text-gray-500">
          不知道从那里获得区域和密钥？请看
          <Link href="/help/reg" className="text-blue-500">
            帮助：创建资源
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export function ApiConfigHelp() {
  return (
    <div className="w-card mb-4 mt-10">
      <h1 className="text-2xl text-foreground font-semibold mb-2">
        开始之前……
      </h1>
      <p className="mb-2">
        如果想要使用 Azure TTS 官方 API 用于听书，需要拥有一个 Azure
        账号并创建一个「Azure 语音服务」资源。
      </p>
      <p className="mb-2">
        将语音服务的区域和密钥填写在下方，点击「获取声音列表」按钮。获取到声音列表后即可开始配置语音和导入听书软件。
      </p>
      <p className="mb-2">
        不知道从那里获得区域和密钥？请看
        <Link href="/help/reg" className="text-blue-500">
          帮助：创建资源
        </Link>
        。
      </p>
      <p className="text-sm text-muted-foreground">
        不想注册 Azure 账号？也可以尝试自托管 Edge TTS（大声朗读）的 API
        转发器，详见{" "}
        <a href="https://ra.yfi.moe" className="text-blue-500">
          Read Aloud
        </a>{" "}
        项目。
      </p>
    </div>
  );
}
