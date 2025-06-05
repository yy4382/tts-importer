"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAtomValue } from "jotai";
import { apiConfig } from "../api-input";
import { IFreeTimeExport } from "./ifreetime";
import { ClientOnly } from "@/components/utils/client-only";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { LegadoExport } from "./legado";
import {
  type VoiceConfig,
  voiceConfigAtom,
  type VoiceConfigWithState,
} from "../voice-configure";

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
            <TabsTrigger value="ifreetime">爱阅</TabsTrigger>
            <TabsTrigger value="legado">阅读</TabsTrigger>
          </TabsList>
          <TabsContent value="ifreetime">
            <TabContentExport
              voice={voiceConfigWithState}
              render={(voiceConfig) => (
                <IFreeTimeExport voiceConfig={voiceConfig} api={api} />
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
  return (
    <ClientOnly serverFallback={<Skeleton className="h-16 w-full" />}>
      {voice.state === "success" ? render(voice.data) : <p>{voice.state}</p>}
    </ClientOnly>
  );
}
