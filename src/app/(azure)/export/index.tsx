"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAtomValue } from "jotai";
import { apiConfig } from "../api-input";
import { IFreeTimeExport } from "./ifreetime";
import { ClientOnly } from "@/components/utils/client-only";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { LegadoExport } from "./legado";
import { voiceConfigAtom, type VoiceConfigWithState } from "../voice-configure";
import { SourceReaderExport } from "./source-reader";
import { VoiceConfig } from "@/lib/azure/schema";

export function Export() {
  const voiceConfigWithState = useAtomValue(voiceConfigAtom);
  const api = useAtomValue(apiConfig);
  return (
    <Card className="w-card">
      <CardHeader>
        <CardTitle>导入</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ifreetime">
          <TabsList>
            <TabsTrigger value="legado">阅读</TabsTrigger>
            <TabsTrigger value="ifreetime">爱阅记</TabsTrigger>
            <TabsTrigger value="source-reader">源阅读</TabsTrigger>
          </TabsList>
          <TabsContent value="ifreetime">
            <TabContentExport
              voice={voiceConfigWithState}
              render={(voiceConfig) => (
                <IFreeTimeExport voice={voiceConfig} api={api} />
              )}
            />
          </TabsContent>
          <TabsContent value="legado">
            <TabContentExport
              voice={voiceConfigWithState}
              render={(voiceConfig) => (
                <LegadoExport voiceConfig={voiceConfig} api={api} />
              )}
            />
          </TabsContent>
          <TabsContent value="source-reader">
            <TabContentExport
              voice={voiceConfigWithState}
              render={(voiceConfig) => (
                <SourceReaderExport voiceConfig={voiceConfig} api={api} />
              )}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function TabContentExport({
  voice,
  render,
}: {
  voice: VoiceConfigWithState;
  render: (voice: VoiceConfig) => React.ReactNode;
}) {
  const failureMessage = (
    state: Omit<VoiceConfigWithState["state"], "success">
  ) => {
    switch (state) {
      case "no voice available":
        return (
          <p>
            还没有获取到语音。请检查 API 设置是否正确，并重新获取语音列表。
            <br />
            如果问题依旧，请尝试使用其他语音源。
          </p>
        );
      case "parse error":
        return (
          <p>
            内部错误（语音解析失败）。请尝试刷新页面。
            <br />
            如果问题依旧，请尝试使用其他语音源。
          </p>
        );
      case "no voice selected":
        return (
          <p>
            还没有选择语音。
            <br />
            请在配置语音卡片中选择语音。
          </p>
        );
    }
  };
  return (
    <ClientOnly serverFallback={<Skeleton className="h-16 w-full" />}>
      {voice.state === "success"
        ? render(voice.data)
        : failureMessage(voice.state)}
    </ClientOnly>
  );
}
