import { describe, it, expect } from "vitest";
import { config2url, config2urlNoThrow, url2config } from "./config-to-url";
import { AzureState, azureStateSchema } from "./schema";
import { produce } from "immer";

function config2urlSimple(state: AzureState) {
  return config2url(state, "https://example.com", "/api/ifreetime");
}

const baseAzureState = azureStateSchema.decode({
  api: {
    region: "eastasia",
    key: "test",
  },
  voice: {
    speakerConfig: {
      type: "single",
      speaker: {
        name: "zh-CN-XiaoxiaoNeural",
        localName: "晓晓",
        style: [],
      },
    },
    shared: {
      pitch: "default",
      format: "audio-16khz-128kbitrate-mono-mp3",
      customUA: null,
    },
  },
});

function convertBackAndForward(state: AzureState) {
  const newObj = url2config(config2urlSimple(state));
  expect(newObj.success, "should success convert").toBe(true);
  if (newObj.success) {
    return newObj.data;
  } else {
    // should not get here because of expect
    throw newObj.error;
  }
}

describe("config2url and url2config conversion", () => {
  describe("round-trip conversion", () => {
    it("basic single speaker config", () => {
      expect(convertBackAndForward(baseAzureState)).toEqual(baseAzureState);
    });

    it("single speaker with style", () => {
      const baseSpeaker = {
        type: "single" as const,
        speaker: {
          name: "zh-CN-XiaoxiaoNeural",
          localName: "晓晓",
          style: [] as (string | null)[],
        },
      };
      const stateWithStyle = produce(baseAzureState, (draft) => {
        draft.voice.speakerConfig = produce(baseSpeaker, (speakerDraft) => {
          speakerDraft.speaker.style = ["cheerful", "sad"];
        });
      });
      expect(convertBackAndForward(stateWithStyle)).toEqual(stateWithStyle);
    });

    it("single speaker with null style (no style)", () => {
      const baseSpeaker = {
        type: "single" as const,
        speaker: {
          name: "zh-CN-XiaoxiaoNeural",
          localName: "晓晓",
          style: [] as (string | null)[],
        },
      };
      const stateWithNullStyle = produce(baseAzureState, (draft) => {
        draft.voice.speakerConfig = produce(baseSpeaker, (speakerDraft) => {
          speakerDraft.speaker.style = [null];
        });
      });
      expect(convertBackAndForward(stateWithNullStyle)).toEqual(
        stateWithNullStyle
      );
    });

    it("custom UA header", () => {
      const stateWithCustomUA = produce(baseAzureState, (draft) => {
        draft.voice.shared.customUA = "MyCustomApp/1.0";
      });
      expect(convertBackAndForward(stateWithCustomUA)).toEqual(
        stateWithCustomUA
      );
    });

    it("empty custom UA header", () => {
      const stateWithEmptyUA = produce(baseAzureState, (draft) => {
        draft.voice.shared.customUA = "";
      });
      expect(convertBackAndForward(stateWithEmptyUA)).toEqual(stateWithEmptyUA);
    });

    it("different region and key", () => {
      const stateWithDifferentAPI = produce(baseAzureState, (draft) => {
        draft.api.region = "westus";
        draft.api.key = "different-key-123";
      });
      expect(convertBackAndForward(stateWithDifferentAPI)).toEqual(
        stateWithDifferentAPI
      );
    });

    it("different pitch and format", () => {
      const stateWithDifferentVoice = produce(baseAzureState, (draft) => {
        draft.voice.shared.pitch = "+50%";
        draft.voice.shared.format = "audio-24khz-160kbitrate-mono-mp3";
      });
      expect(convertBackAndForward(stateWithDifferentVoice)).toEqual(
        stateWithDifferentVoice
      );
    });

    it("multiple speakers configuration", () => {
      const multiSpeakerState = produce(baseAzureState, (draft) => {
        draft.voice.speakerConfig = {
          type: "all",
          speakers: [
            {
              name: "zh-CN-XiaoxiaoNeural",
              localName: "晓晓",
              style: ["cheerful"],
            },
            {
              name: "zh-CN-YunxiNeural",
              localName: "云希",
              style: ["angry", null],
            },
            {
              name: "en-US-JennyNeural",
              localName: "Jenny",
              style: [],
            },
          ],
        };
      });
      expect(convertBackAndForward(multiSpeakerState)).toEqual(
        multiSpeakerState
      );
    });

    it("complex configuration with all variations", () => {
      const complexState = produce(baseAzureState, (draft) => {
        draft.api.region = "southeastasia";
        draft.api.key = "complex-key-456";
        draft.voice.shared.pitch = "-20%";
        draft.voice.shared.format = "audio-48khz-192kbitrate-mono-mp3";
        draft.voice.shared.customUA = "ComplexApp/2.1 (Windows NT 10.0)";
        draft.voice.speakerConfig = {
          type: "all-zh",
          speakers: [
            {
              name: "zh-HK-HiuMaanNeural",
              localName: "曉曼",
              style: ["gentle", "cheerful", null],
            },
            {
              name: "ja-JP-NanamiNeural",
              localName: "七海",
              style: [],
            },
          ],
        };
      });
      expect(convertBackAndForward(complexState)).toEqual(complexState);
    });
    it("super long speaker config", () => {
      const superLongState = produce(baseAzureState, (draft) => {
        draft.voice.speakerConfig = {
          type: "all",
          speakers: Array.from({ length: 1000 }, (_, i) => ({
            name: `en-US-JennyNeural-${i}`,
            localName: `Jenny-${i}`,
            style: [],
          })),
        };
      });
      expect(config2urlSimple(superLongState).toString()).toContain(
        "speaker-compressed=true"
      );
      expect(convertBackAndForward(superLongState)).toEqual(superLongState);
    });
  });

  describe("config2urlNoThrow", () => {
    it("returns URL string for valid config", () => {
      const result = config2urlNoThrow(
        baseAzureState,
        "https://example.com",
        "/test"
      );
      expect(typeof result).toBe("string");
      expect(result).toContain("https://example.com/test");
      expect(result).toContain("api-region=eastasia");
    });

    it("returns Error for invalid config", () => {
      const invalidState = { invalid: "data" } as unknown as AzureState;
      const result = config2urlNoThrow(
        invalidState,
        "https://example.com",
        "/test"
      );
      expect(result).toBeInstanceOf(Error);
    });
  });
});
