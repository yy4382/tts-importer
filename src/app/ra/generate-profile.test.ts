import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_LEGADO_RATE_TEMPLATE,
  generateProfileIreadnote,
  generateProfileLegado,
} from "./generate-profile";
import { raStateSchema, type RaState } from "./ra-data";
import { isValid as isValidUlid } from "ulid";

const FIXED_TIME = new Date("2024-01-01T00:00:00.000Z");
const BASE_ID = Math.floor(FIXED_TIME.getTime() / 1000) * 1000;

type StateOverrides = {
  api?: Partial<RaState["api"]>;
  voice?: {
    voiceName?: RaState["voice"]["voiceName"];
    advanced?: Partial<RaState["voice"]["advanced"]>;
  };
};

function createState(overrides: StateOverrides = {}): RaState {
  const base = {
    api: {
      url: "https://ra.example.com/base",
      token: "token",
    },
    voice: {
      voiceName: {
        type: "single" as const,
        name: "en-US-JennyNeural",
      },
      advanced: {
        pitch: "",
        rate: "",
        volume: "",
        format: "audio-24khz-48kbitrate-mono-mp3",
      },
    },
  } satisfies Parameters<typeof raStateSchema.parse>[0];

  const state = {
    api: {
      ...base.api,
      ...overrides.api,
    },
    voice: {
      voiceName: overrides.voice?.voiceName ?? base.voice.voiceName,
      advanced: {
        ...base.voice.advanced,
        ...overrides.voice?.advanced,
      },
    },
  } satisfies Parameters<typeof raStateSchema.parse>[0];

  return raStateSchema.parse(state);
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_TIME);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("generateProfileLegado", () => {
  it("uses the default rate template when none provided", () => {
    const state = createState();

    const result = generateProfileLegado(state, { rateTemplate: "" });
    const config = JSON.parse(result) as {
      name: string;
      url: string;
      id: number;
    };

    expect(config.name).toBe("☁️ Read Aloud en-US-JennyNeural");
    expect(config.id).toBe(BASE_ID);
    expect(config.url).toContain("voiceName=en-US-JennyNeural");
    expect(config.url).toContain(`rate=${DEFAULT_LEGADO_RATE_TEMPLATE}`);
    expect(config.url).toContain("token=token");
    expect(config.url).toContain("format=audio-24khz-48kbitrate-mono-mp3");
    expect(config.url).not.toContain("pitch=");
    expect(config.url).not.toContain("volume=");
  });

  it("includes advanced fields and custom rate template", () => {
    const state = createState({
      voice: {
        advanced: {
          pitch: "high",
          volume: "loud",
          format: "audio-webm",
        },
      },
    });

    const result = generateProfileLegado(state, {
      rateTemplate: "{{customRate}}",
    });
    const config = JSON.parse(result) as { url: string };

    expect(config.url).toContain("pitch=high");
    expect(config.url).toContain("volume=loud");
    expect(config.url).toContain("format=audio-webm");
    expect(config.url).toContain("rate={{customRate}}");
  });

  it("builds multiple entries when multiple voices supplied", () => {
    const state = createState({
      voice: {
        voiceName: {
          type: "all",
          nameList: ["VoiceOne", "VoiceTwo"],
        },
      },
    });

    const result = generateProfileLegado(state, {});
    const config = JSON.parse(result) as Array<{
      name: string;
      url: string;
      id: number;
    }>;

    expect(config).toHaveLength(2);
    expect(config[0].name).toBe("☁️ Read Aloud VoiceOne");
    expect(config[1].name).toBe("☁️ Read Aloud VoiceTwo");
    expect(config[0].id).toBe(BASE_ID);
    expect(config[1].id).toBe(BASE_ID + 1);
    expect(config[0].url).toContain("voiceName=VoiceOne");
    expect(config[1].url).toContain("voiceName=VoiceTwo");
  });
});

describe("generateProfileIreadnote", () => {
  it("serializes a single voice configuration", () => {
    const state = createState({
      voice: {
        advanced: {
          pitch: "hi",
          rate: "1.1",
          volume: "medium",
        },
      },
    });

    const result = generateProfileIreadnote(state);
    const config = JSON.parse(result);

    expect(config).toMatchObject({
      _ClassName: "JxdAdvCustomTTS",
      ttsConfigGroup: "☁️ EdgeRA ra.example.com",
      _TTSName: "Read Aloud en-US-JennyNeural",
    });
    expect(isValidUlid(config._TTSConfigID)).toBe(true);
    expect(config.ttsHandles[0]).toMatchObject({
      forGetMethod: 1,
      processType: 1,
      url: "https://ra.example.com/api/synthesis",
      parser: { playData: "ResponseData" },
    });
    expect(config.ttsHandles[0].params).toMatchObject({
      pitch: "hi",
      rate: "1.1",
      volume: "medium",
      format: "audio-24khz-48kbitrate-mono-mp3",
      voiceName: "en-US-JennyNeural",
      token: "token",
      text: "%@",
    });
    expect(config).not.toHaveProperty("voiceList");
  });

  it("includes voice list and placeholder voice name for multi-voice configurations", () => {
    const state = createState({
      voice: {
        voiceName: {
          type: "all-zh",
          nameList: ["语音一", "语音二"],
        },
      },
    });

    const result = generateProfileIreadnote(state);
    const config = JSON.parse(result);

    expect(config._TTSName).toBe("Read Aloud 全中文 2 个");
    expect(config.voiceList).toEqual([
      { name: "语音一", display: "语音一" },
      { name: "语音二", display: "语音二" },
    ]);
    expect(config.ttsHandles[0].params.voiceName).toBe("@json:voiceName");
  });
});
