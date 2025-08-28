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
      expect(convertBackAndForward(stateWithNullStyle)).toEqual(stateWithNullStyle);
    });

    it("custom UA header", () => {
      const stateWithCustomUA = produce(baseAzureState, (draft) => {
        draft.voice.shared.customUA = "MyCustomApp/1.0";
      });
      expect(convertBackAndForward(stateWithCustomUA)).toEqual(stateWithCustomUA);
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
      expect(convertBackAndForward(stateWithDifferentAPI)).toEqual(stateWithDifferentAPI);
    });

    it("different pitch and format", () => {
      const stateWithDifferentVoice = produce(baseAzureState, (draft) => {
        draft.voice.shared.pitch = "+50%";
        draft.voice.shared.format = "audio-24khz-160kbitrate-mono-mp3";
      });
      expect(convertBackAndForward(stateWithDifferentVoice)).toEqual(stateWithDifferentVoice);
    });

    it("multiple speakers configuration", () => {
      const multiSpeakerState = produce(baseAzureState, (draft) => {
        draft.voice.speakerConfig = {
          type: "multiple",
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
      expect(convertBackAndForward(multiSpeakerState)).toEqual(multiSpeakerState);
    });

    it("complex configuration with all variations", () => {
      const complexState = produce(baseAzureState, (draft) => {
        draft.api.region = "southeastasia";
        draft.api.key = "complex-key-456";
        draft.voice.shared.pitch = "-20%";
        draft.voice.shared.format = "audio-48khz-192kbitrate-mono-mp3";
        draft.voice.shared.customUA = "ComplexApp/2.1 (Windows NT 10.0)";
        draft.voice.speakerConfig = {
          type: "multiple",
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
  });

  describe("config2url", () => {
    it("generates correct URL with default origin and pathname", () => {
      const url = config2url(baseAzureState, "https://tts.example.com", "/api/azure");
      expect(url.origin).toBe("https://tts.example.com");
      expect(url.pathname).toBe("/api/azure");
      expect(url.searchParams.get("api-region")).toBe("eastasia");
      expect(url.searchParams.get("api-key")).toBe("test");
      expect(url.searchParams.get("pitch")).toBe("default");
      expect(url.searchParams.get("format")).toBe("audio-16khz-128kbitrate-mono-mp3");
      expect(url.searchParams.get("custom-ua")).toBeNull();
      expect(url.searchParams.get("speaker")).toBe(JSON.stringify({
        name: "zh-CN-XiaoxiaoNeural",
        localName: "晓晓",
        style: [],
      }));
    });

    it("includes custom UA when present", () => {
      const stateWithUA = produce(baseAzureState, (draft) => {
        draft.voice.shared.customUA = "TestApp/1.0";
      });
      const url = config2url(stateWithUA, "https://example.com", "/test");
      expect(url.searchParams.get("custom-ua")).toBe("TestApp/1.0");
    });

    it("handles multiple speakers correctly", () => {
      const multiSpeakerState = produce(baseAzureState, (draft) => {
        draft.voice.speakerConfig = {
          type: "multiple",
          speakers: [
            { name: "speaker1", localName: "Speaker 1", style: ["happy"] },
            { name: "speaker2", localName: "Speaker 2", style: [] },
          ],
        };
      });
      const url = config2url(multiSpeakerState, "https://example.com", "/test");
      const speakers = url.searchParams.getAll("speaker");
      expect(speakers).toHaveLength(2);
      expect(JSON.parse(speakers[0])).toEqual({ name: "speaker1", localName: "Speaker 1", style: ["happy"] });
      expect(JSON.parse(speakers[1])).toEqual({ name: "speaker2", localName: "Speaker 2", style: [] });
    });
  });

  describe("config2urlNoThrow", () => {
    it("returns URL string for valid config", () => {
      const result = config2urlNoThrow(baseAzureState, "https://example.com", "/test");
      expect(typeof result).toBe("string");
      expect(result).toContain("https://example.com/test");
      expect(result).toContain("api-region=eastasia");
    });

    it("returns Error for invalid config", () => {
      const invalidState = { invalid: "data" } as unknown as AzureState;
      const result = config2urlNoThrow(invalidState, "https://example.com", "/test");
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe("url2config", () => {
    it("parses URL with single speaker correctly", () => {
      const url = new URL("https://example.com/test");
      url.searchParams.set("api-region", "westus");
      url.searchParams.set("api-key", "my-key");
      url.searchParams.set("pitch", "+10%");
      url.searchParams.set("format", "audio-24khz-160kbitrate-mono-mp3");
      url.searchParams.set("speaker", JSON.stringify({
        name: "en-US-AriaNeural",
        localName: "Aria",
        style: ["newscast"],
      }));

      const result = url2config(url);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.api.region).toBe("westus");
        expect(result.data.api.key).toBe("my-key");
        expect(result.data.voice.shared.pitch).toBe("+10%");
        expect(result.data.voice.shared.format).toBe("audio-24khz-160kbitrate-mono-mp3");
        expect(result.data.voice.shared.customUA).toBeNull();
        expect(result.data.voice.speakerConfig.type).toBe("single");
        if (result.data.voice.speakerConfig.type === "single") {
          expect(result.data.voice.speakerConfig.speaker.name).toBe("en-US-AriaNeural");
          expect(result.data.voice.speakerConfig.speaker.localName).toBe("Aria");
          expect(result.data.voice.speakerConfig.speaker.style).toEqual(["newscast"]);
        }
      }
    });

    it("parses URL with custom UA correctly", () => {
      const url = new URL("https://example.com/test");
      url.searchParams.set("api-region", "eastus");
      url.searchParams.set("api-key", "key123");
      url.searchParams.set("pitch", "default");
      url.searchParams.set("format", "audio-16khz-128kbitrate-mono-mp3");
      url.searchParams.set("custom-ua", "MyApp/2.0");
      url.searchParams.set("speaker", JSON.stringify({
        name: "zh-TW-HsiaoChenNeural",
        localName: "曉臻",
        style: [],
      }));

      const result = url2config(url);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.voice.shared.customUA).toBe("MyApp/2.0");
      }
    });

    it("parses URL with multiple speakers correctly", () => {
      const url = new URL("https://example.com/test");
      url.searchParams.set("api-region", "southeastasia");
      url.searchParams.set("api-key", "multi-key");
      url.searchParams.set("pitch", "-5%");
      url.searchParams.set("format", "audio-48khz-192kbitrate-mono-mp3");
      url.searchParams.append("speaker", JSON.stringify({
        name: "ko-KR-SunHiNeural",
        localName: "선희",
        style: ["cheerful"],
      }));
      url.searchParams.append("speaker", JSON.stringify({
        name: "ja-JP-KeitaNeural",
        localName: "慧太",
        style: [null, "sad"],
      }));

      const result = url2config(url);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.voice.speakerConfig.type).toBe("multiple");
        if (result.data.voice.speakerConfig.type === "multiple") {
          expect(result.data.voice.speakerConfig.speakers).toHaveLength(2);
          expect(result.data.voice.speakerConfig.speakers[0].name).toBe("ko-KR-SunHiNeural");
          expect(result.data.voice.speakerConfig.speakers[1].name).toBe("ja-JP-KeitaNeural");
          expect(result.data.voice.speakerConfig.speakers[1].style).toEqual([null, "sad"]);
        }
      }
    });

    it("returns error for URL without speaker", () => {
      const url = new URL("https://example.com/test");
      url.searchParams.set("api-region", "eastus");
      url.searchParams.set("api-key", "key123");
      url.searchParams.set("pitch", "default");
      url.searchParams.set("format", "audio-16khz-128kbitrate-mono-mp3");

      const result = url2config(url);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain("speaker is required");
      }
    });

    it("returns error for invalid speaker JSON", () => {
      const url = new URL("https://example.com/test");
      url.searchParams.set("api-region", "eastus");
      url.searchParams.set("api-key", "key123");
      url.searchParams.set("pitch", "default");
      url.searchParams.set("format", "audio-16khz-128kbitrate-mono-mp3");
      url.searchParams.set("speaker", "invalid json");

      expect(() => {
        const result = url2config(url);
        if (result.success === false) {
          throw result.error;
        }
      }).toThrow(/JSON/);
    });
  });

  describe("edge cases and error handling", () => {
    it("handles empty string pitch as default", () => {
      const stateWithEmptyPitch = produce(baseAzureState, (draft) => {
        draft.voice.shared.pitch = "";
      });
      expect(convertBackAndForward(stateWithEmptyPitch)).toEqual(stateWithEmptyPitch);
    });

    it("preserves exact speaker configuration structure", () => {
      const baseSpeaker = {
        type: "single" as const,
        speaker: {
          name: "zh-CN-XiaoxiaoNeural",
          localName: "晓晓",
          style: [] as (string | null)[],
        },
      };
      const complexSpeaker = produce(baseAzureState, (draft) => {
        draft.voice.speakerConfig = produce(baseSpeaker, (speakerDraft) => {
          speakerDraft.speaker.style = ["gentle", null, "cheerful"];
        });
      });
      const converted = convertBackAndForward(complexSpeaker);
      if (converted.voice.speakerConfig.type === "single") {
        expect(converted.voice.speakerConfig.speaker.style).toEqual(["gentle", null, "cheerful"]);
      }
    });
  });
});
