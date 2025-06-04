import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

export function AudioPreview({
  enabled,
  getTestAudio,
  url,
  onError,
}: {
  enabled: boolean;
  getTestAudio: (text: string) => Promise<void>;
  url: string | null;
  onError?: React.ReactEventHandler<HTMLAudioElement>;
}) {
  const [text, setText] = useState("");

  async function onAudition() {
    await getTestAudio(text);
  }

  return (
    <Card className="w-card">
      <CardHeader>
        <CardTitle>试听</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={text}
          onInput={(e) => {
            setText((e.target as HTMLTextAreaElement).value);
          }}
        ></Textarea>
        <div className="flex justify-between items-center gap-4">
          <audio
            controls
            src={url ?? undefined}
            className="h-10"
            onError={onError}
          />
          <Button onClick={onAudition} disabled={!enabled}>
            试听
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
