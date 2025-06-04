"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { VoiceNameSelect } from "./voice-name-select";
import { raVoiceConfigAtom } from "../ra-data";
import { useAtom } from "jotai";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";

export function RaVoiceConfig() {
  const [raVoiceConfig, setRaVoiceConfig] = useAtom(raVoiceConfigAtom);
  return (
    <Card className="w-card">
      <CardHeader>合成</CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Voice Name</Label>
            <VoiceNameSelect
              value={raVoiceConfig.voiceName}
              onChange={(v) =>
                setRaVoiceConfig({ ...raVoiceConfig, voiceName: v })
              }
            />
          </div>
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
                {(["pitch", "rate", "volume", "format"] as const).map((key) => (
                  <div key={key} className="grid gap-2">
                    <Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                    <Input
                      value={raVoiceConfig[key]}
                      onChange={(e) =>
                        setRaVoiceConfig({
                          ...raVoiceConfig,
                          [key]: e.target.value,
                        })
                      }
                    />
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
