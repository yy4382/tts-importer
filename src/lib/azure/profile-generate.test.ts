import { afterEach } from "node:test";
import legadoConfig from "./legado";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { azureStateSchema, speakerSchema } from "./schema";
import { produce } from "immer";
import { isValidXML } from "@/../test/utils/is-valid-xml";
import z from "zod";
import ifreetimeConfig from "./ifreetime";
import { isValid } from "ulid";

beforeEach(() => {
  vi.setSystemTime(new Date(2025, 0, 1));
});
afterEach(() => {
  vi.useRealTimers();
});

const azureState = azureStateSchema.decode({
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

describe("legadoConfig", () => {
  function extractSsmlFromLegadoConfig(configStr: string, pos = 0) {
    const config = JSON.parse(configStr);
    const url: string = config[pos].url;
    const obj = url.slice(url.indexOf(",") + 1);
    const ssml = JSON.parse(obj).body;
    return ssml;
  }

  function isSsmlValidInLegadoConfig(configStr: string, pos = 0) {
    const ssml = extractSsmlFromLegadoConfig(configStr, pos);
    return isValidXML(ssml);
  }
  it("should generate a valid legado config", () => {
    const config = legadoConfig(azureState);
    expect(JSON.parse(config)).toMatchSnapshot();
  });
  describe("should throw error on common state misconstruct", () => {
    it("region is empty", () => {
      const state = produce(azureState, (draft) => {
        draft.api.region = "";
      });
      expect(() => legadoConfig(state)).toThrowError("region");
    });
    it("key is empty", () => {
      const state = produce(azureState, (draft) => {
        draft.api.key = "";
      });
      expect(() => legadoConfig(state)).toThrowError("key");
    });
  });

  describe("pitch", () => {
    it("default", () => {
      const state = produce(azureState, (draft) => {
        draft.voice.shared.pitch = "default";
      });
      const config = legadoConfig(state);
      expect(config).not.toContain("pitch=");
      expect(isSsmlValidInLegadoConfig(config), "SSML be valid xml").toBe(true);
    });
    it("empty", () => {
      const state = produce(azureState, (draft) => {
        draft.voice.shared.pitch = "";
      });
      const config = legadoConfig(state);
      expect(config).not.toContain("pitch=");
      expect(isSsmlValidInLegadoConfig(config), "SSML be valid xml").toBe(true);
    });
    it("non-default", () => {
      const state = produce(azureState, (draft) => {
        draft.voice.shared.pitch = "x-low";
      });
      const config = legadoConfig(state);
      expect(config).toContain("pitch=");
      expect(config).toContain("x-low");
      expect(isSsmlValidInLegadoConfig(config), "SSML be valid xml").toBe(true);
    });
    it("custom", () => {
      const state = produce(azureState, (draft) => {
        draft.voice.shared.pitch = "600Hz";
      });
      const config = legadoConfig(state);
      expect(config).toContain("pitch=");
      expect(config).toContain("600Hz");
      expect(isSsmlValidInLegadoConfig(config), "SSML be valid xml").toBe(true);
    });
  });

  describe("ua", () => {
    it("not set", () => {
      const state = produce(azureState, (draft) => {
        draft.voice.shared.customUA = null;
      });
      const config = legadoConfig(state);
      expect(config).toContain('\\"User-Agent\\":\\"legado\\"');
    });
    it("empty string", () => {
      const state = produce(azureState, (draft) => {
        draft.voice.shared.customUA = "";
      });
      const config = legadoConfig(state);
      expect(config).toContain('\\"User-Agent\\":\\"\\"');
    });
    it("custom", () => {
      const state = produce(azureState, (draft) => {
        draft.voice.shared.customUA = "custom";
      });
      const config = legadoConfig(state);
      expect(config).toContain('\\"User-Agent\\":\\"custom\\"');
    });
  });

  describe("single speaker", () => {
    describe("style", () => {
      const baseSpeaker = {
        type: "single" as const,
        speaker: {
          name: "zh-CN-XiaoxiaoNeural",
          localName: "晓晓",
          style: [] as z.infer<typeof speakerSchema>["style"],
        },
      };
      function modifyStyle(style: z.infer<typeof speakerSchema>["style"]) {
        return produce(azureState, (draft) => {
          draft.voice.speakerConfig = produce(baseSpeaker, (draft) => {
            draft.speaker.style = style;
          });
        });
      }
      it("array empty", () => {
        const state = modifyStyle([]);
        const config = legadoConfig(state);
        expect(isSsmlValidInLegadoConfig(config), "SSML be valid xml").toBe(
          true
        );
        expect(config).not.toContain("style=");
        expect(config).not.toContain("mstts:express-as");
      });
      it("array with only null", () => {
        const state = modifyStyle([null]);
        const config = legadoConfig(state);
        expect(isSsmlValidInLegadoConfig(config), "SSML be valid xml").toBe(
          true
        );
        expect(config).not.toContain("style=");
        expect(config).not.toContain("mstts:express-as");
      });
      it("array with only but multiple null", () => {
        const state = modifyStyle([null, null]);
        const config = legadoConfig(state);
        expect(isSsmlValidInLegadoConfig(config), "SSML be valid xml").toBe(
          true
        );
        expect(config).not.toContain("style=");
        expect(config).not.toContain("mstts:express-as");
      });
      it("array with one string", () => {
        const state = modifyStyle(["normal"]);
        const config = legadoConfig(state);
        expect(isSsmlValidInLegadoConfig(config), "SSML be valid xml").toBe(
          true
        );
        expect(config).toContain("style=");
        expect(config).toContain("normal");
      });
      // TODO: support multiple styles
      it.todo("array with multiple strings");
      it.todo("array with strings and null");
      it.todo("array with strings and multiple null");
    });
  });
  // TODO: support multiple speakers
  describe.todo("multiple speakers");
});

describe("ifreetimeConfig", () => {
  function extractSsmlFromIfreetimeConfig(configStr: string) {
    const configObj = JSON.parse(configStr);
    const text = configObj.ttsHandles[0].params.text;
    return text.split("format('")[1].split("',txt)")[0];
  }
  function isSsmlValidInConfig(configStr: string) {
    const ssml = extractSsmlFromIfreetimeConfig(configStr);
    return isValidXML(ssml);
  }

  it("should generate a valid ifreetime config", () => {
    const config = ifreetimeConfig(azureState);
    const configObj = JSON.parse(config);
    expect(isValid(configObj._TTSConfigID)).toBe(true);
    delete configObj._TTSConfigID;
    expect(configObj).toMatchSnapshot();
  });

  describe("should throw error on common state misconstruct", () => {
    it("region is empty", () => {
      const state = produce(azureState, (draft) => {
        draft.api.region = "";
      });
      expect(() => ifreetimeConfig(state)).toThrowError("region");
    });
    it("key is empty", () => {
      const state = produce(azureState, (draft) => {
        draft.api.key = "";
      });
      expect(() => ifreetimeConfig(state)).toThrowError("key");
    });
  });

  describe("pitch", () => {
    it("default", () => {
      const state = produce(azureState, (draft) => {
        draft.voice.shared.pitch = "default";
      });
      const config = ifreetimeConfig(state);
      console.log(extractSsmlFromIfreetimeConfig(config));
      expect(isSsmlValidInConfig(config), "SSML be valid xml").toBe(true);
      expect(config).not.toContain("pitch=");
    });
    it("empty", () => {
      const state = produce(azureState, (draft) => {
        draft.voice.shared.pitch = "";
      });
      const config = ifreetimeConfig(state);
      expect(isSsmlValidInConfig(config), "SSML be valid xml").toBe(true);
      expect(config).not.toContain("pitch=");
    });
    it("non-default", () => {
      const state = produce(azureState, (draft) => {
        draft.voice.shared.pitch = "x-low";
      });
      const config = ifreetimeConfig(state);
      expect(isSsmlValidInConfig(config), "SSML be valid xml").toBe(true);
      expect(config).toContain("pitch=");
      expect(config).toContain("x-low");
    });
    it("custom", () => {
      const state = produce(azureState, (draft) => {
        draft.voice.shared.pitch = "600Hz";
      });
      const config = ifreetimeConfig(state);
      expect(isSsmlValidInConfig(config), "SSML be valid xml").toBe(true);
      expect(config).toContain("pitch=");
      expect(config).toContain("600Hz");
    });
  });

  describe("ua", () => {
    it("not set", () => {
      const state = produce(azureState, (draft) => {
        draft.voice.shared.customUA = null;
      });
      const config = ifreetimeConfig(state);
      expect(config).toContain('"User-Agent":"AiyueTTS"');
    });
    it("empty string", () => {
      const state = produce(azureState, (draft) => {
        draft.voice.shared.customUA = "";
      });
      const config = ifreetimeConfig(state);
      expect(config).toContain('"User-Agent":""');
    });
    it("custom", () => {
      const state = produce(azureState, (draft) => {
        draft.voice.shared.customUA = "custom";
      });
      const config = ifreetimeConfig(state);
      expect(config).toContain('"User-Agent":"custom"');
    });
  });

  describe("single speaker", () => {
    const baseSpeaker = {
      type: "single" as const,
      speaker: {
        name: "zh-CN-XiaoxiaoNeural",
        localName: "晓晓",
        style: [] as z.infer<typeof speakerSchema>["style"],
      },
    };
    function modifyStyle(style: z.infer<typeof speakerSchema>["style"]) {
      return produce(azureState, (draft) => {
        draft.voice.speakerConfig = produce(baseSpeaker, (draft) => {
          draft.speaker.style = style;
        });
      });
    }
    describe("style", () => {
      it("array empty", () => {
        const state = modifyStyle([]);
        const config = ifreetimeConfig(state);
        expect(isSsmlValidInConfig(config), "SSML be valid xml").toBe(true);
        expect(config).not.toContain("style=");
        expect(config).not.toContain("mstts:express-as");
      });
      it("array with only null", () => {
        const state = modifyStyle([null]);
        const config = ifreetimeConfig(state);
        expect(isSsmlValidInConfig(config), "SSML be valid xml").toBe(true);
        expect(config).not.toContain("style=");
        expect(config).not.toContain("mstts:express-as");
      });
      it("array with only but multiple null", () => {
        const state = modifyStyle([null, null]);
        const config = ifreetimeConfig(state);
        expect(isSsmlValidInConfig(config), "SSML be valid xml").toBe(true);
        expect(config).not.toContain("style=");
        expect(config).not.toContain("mstts:express-as");
      });
      it("array with one string", () => {
        const state = modifyStyle(["normal"]);
        const config = ifreetimeConfig(state);
        expect(isSsmlValidInConfig(config), "SSML be valid xml").toBe(true);
        expect(config).toContain("style=");
        expect(config).toContain("normal");
      });
      // TODO: support multiple styles
      it.todo("array with multiple strings");
      it.todo("array with strings and null");
      it.todo("array with strings and multiple null");
    });
  });

  // TODO: support multiple speakers
  describe.todo("multiple speakers");
});
