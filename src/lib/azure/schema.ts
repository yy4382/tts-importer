import { z } from "zod";

export const speakerSchema = z.object({
  name: z.string(),
  localName: z.string(),
  // empty array or [null] interpreted as not using style
  // non empty array with null means using style, but also include unstyled
  style: z.array(z.union([z.string(), z.null()])),
});

export const voiceConfigSchema = z.object({
  shared: z.object({
    // empty string or "default" (preferred than empty string) interpreted not exist (not sending)
    pitch: z.string(),
    format: z.string(),
    // no UA header if null, and empty string is valid (send as empty string)
    customUA: z.string().nullable(),
  }),
  speakerConfig: z.discriminatedUnion("type", [
    z.object({ type: z.literal("single"), speaker: speakerSchema }),
    z.object({ type: z.literal("multiple"), speakers: z.array(speakerSchema) }),
  ]),
});

export type VoiceConfig = z.infer<typeof voiceConfigSchema>;

const apiConfigSchema = z.object({
  region: z.string().nonempty("API 区域不能为空"),
  key: z.string().nonempty("API 密钥不能为空"),
});
export type ApiConfig = z.infer<typeof apiConfigSchema>;

const azureStateSchema = z.object({
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
      if (state.voice.speakerConfig.type === "single") {
        params.set(
          "speaker",
          JSON.stringify(state.voice.speakerConfig.speaker)
        );
      } else {
        for (const speaker of state.voice.speakerConfig.speakers) {
          params.append("speaker", JSON.stringify(speaker));
        }
      }

      return params;
    },
    encode: (params, ctx) => {
      const speakers = params.getAll("speaker");
      if (speakers.length === 0) {
        ctx.issues.push({
          code: "custom",
          input: params,
          message: "speaker is required",
        });
      }
      const speakerConfig: z.infer<typeof voiceConfigSchema>["speakerConfig"] =
        speakers.length === 1
          ? { type: "single", speaker: JSON.parse(speakers[0]) }
          : { type: "multiple", speakers: speakers.map((s) => JSON.parse(s)) };

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
