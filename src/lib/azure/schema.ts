import { z } from "zod";
import pako from "pako";

export const speakerSchema = z.object({
  /**
   * @example "zh-CN-XiaoxiaoNeural"
   */
  name: z.string(),
  /**
   * @example "晓晓"
   */
  localName: z.string(),
  /**
   * The voice style of the speaker.
   *
   * - empty array or [null] interpreted as not using style
   * - non empty array with null means using style, but also include unstyled
   */
  style: z.array(z.union([z.string(), z.null()])),
});

export function dedupeSpeakerStyle(
  style: z.infer<typeof speakerSchema>["style"]
) {
  if (style.length === 0) {
    return [null];
  }
  const set = new Set(style);
  return Array.from(set);
}

export const voiceConfigSchema = z.object({
  shared: z.object({
    /**
     * empty string or "default" (preferred than empty string) interpreted not exist (not sending)
     */
    pitch: z.string(),
    format: z.string(),
    /**
     * use Default UA header if null, and empty string is valid (send as empty string)
     */
    customUA: z.string().nullable(),
  }),
  speakerConfig: z.discriminatedUnion("type", [
    z.object({ type: z.literal("single"), speaker: speakerSchema }),
    z.object({ type: z.literal("all-zh"), speakers: z.array(speakerSchema) }),
    z.object({ type: z.literal("all"), speakers: z.array(speakerSchema) }),
  ]),
});

export type VoiceConfig = z.infer<typeof voiceConfigSchema>;

const apiConfigSchema = z.object({
  region: z.string().nonempty("API 区域不能为空"),
  key: z.string().nonempty("API 密钥不能为空"),
});
export type ApiConfig = z.infer<typeof apiConfigSchema>;

export const azureStateSchema = z.object({
  api: apiConfigSchema,
  voice: voiceConfigSchema,
});
export type AzureState = z.infer<typeof azureStateSchema>;

export const azureStateToSearchParams = z.codec(
  azureStateSchema,
  z.instanceof(URLSearchParams),
  {
    decode: (state) => {
      const params = new URLSearchParams();

      params.set("api-region", state.api.region);
      params.set("api-key", state.api.key);

      params.set("pitch", state.voice.shared.pitch);

      params.set("format", state.voice.shared.format);

      if (state.voice.shared.customUA !== null) {
        params.set("custom-ua", state.voice.shared.customUA);
      }
      const speakerConfigStr = JSON.stringify(state.voice.speakerConfig);
      if (speakerConfigStr.length > 500) {
        const compressed = pako.deflate(speakerConfigStr);
        const base64 = uint8ArrayToBase64(compressed);
        params.set("speaker", base64);
        params.set("speaker-compressed", "true");
      } else {
        params.set("speaker", speakerConfigStr);
      }

      return params;
    },
    encode: (params, ctx) => {
      const speaker = params.get("speaker");
      if (!speaker) {
        ctx.issues.push({
          code: "custom",
          input: params,
        });
        return z.NEVER;
      }
      let speakerConfig: VoiceConfig["speakerConfig"];
      if (params.get("speaker-compressed") === "true") {
        const compressed = base64ToUint8Array(speaker!);
        const decompressed = pako.inflate(compressed, { to: "string" });
        speakerConfig = JSON.parse(decompressed);
      } else {
        speakerConfig = JSON.parse(speaker);
      }

      return {
        api: {
          region: params.get("api-region")!,
          key: params.get("api-key")!,
        },
        voice: {
          shared: {
            pitch: params.get("pitch")!,
            format: params.get("format")!,
            customUA: params.get("custom-ua") ?? null,
          },
          speakerConfig,
        },
      };
    },
  }
);

function uint8ArrayToBase64(uint8Array: Uint8Array) {
  const chunkSize = 0x8000; // 32KB chunks
  let binaryString = "";

  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, i + chunkSize);
    binaryString += String.fromCharCode(...chunk);
  }

  return btoa(binaryString);
}

function base64ToUint8Array(base64String: string) {
  const binaryString = atob(base64String);
  const uint8Array = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }

  return uint8Array;
}
