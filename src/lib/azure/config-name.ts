import { z } from "zod";
import type { speakerSchema } from "./schema";

export default function generateConfigName(
  voice: z.infer<typeof speakerSchema>
) {
  return `☁️ Azure ${voice.localName}`;
}
