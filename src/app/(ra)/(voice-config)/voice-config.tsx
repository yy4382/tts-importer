"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { VoiceNameSelect } from "./voice-name-select";
import { raVoiceConfigAdvancedSchema, raVoiceConfigAtom } from "../ra-data";
import { atom, useAtom } from "jotai";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import z from "zod";

const raVoiceConfigAdvancedAtom = atom(
  (get) => get(raVoiceConfigAtom).advanced,
  (_, set, advanced: z.infer<typeof raVoiceConfigAdvancedSchema>) => {
    set(raVoiceConfigAtom, (prev) => ({ ...prev, advanced }));
  }
);

export function RaVoiceConfig() {
  const [advanced, setAdvanced] = useAtom(raVoiceConfigAdvancedAtom);

  return (
    <Card className="w-card">
      <CardHeader>合成</CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Voice Name</Label>
            <VoiceNameSelect />
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
                      value={advanced[key]}
                      onChange={(e) =>
                        setAdvanced({
                          ...advanced,
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
