import {
  vi,
  describe,
  test,
  expect,
  afterEach,
  beforeEach,
  beforeAll,
  afterAll,
} from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExportRa } from "./export";
import { Provider } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { raApiConfigAtom, RaVoiceConfig, raVoiceConfigAtom } from "./ra-data";

const mocks = vi.hoisted(() => ({
  toast: vi.fn(),
  posthog: {
    capture: vi.fn(),
  },
  clipboardWriteText: vi.fn().mockResolvedValue(undefined),
}));

vi.mock(import("posthog-js"), () => ({
  posthog: {
    capture: mocks.posthog.capture,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
}));

vi.stubGlobal("navigator", {
  clipboard: {
    writeText: mocks.clipboardWriteText,
  },
});

const createURLMock = vi.fn();
let originalCreateObjectURL: typeof URL.createObjectURL;

const revokeObjectURLMock = vi.fn();
let originalRevokeObjectURL: typeof URL.revokeObjectURL;

beforeAll(() => {
  originalCreateObjectURL = URL.createObjectURL;
  originalRevokeObjectURL = URL.revokeObjectURL;
  URL.createObjectURL = createURLMock;
  URL.revokeObjectURL = revokeObjectURLMock;
});
afterAll(() => {
  URL.createObjectURL = originalCreateObjectURL;
  URL.revokeObjectURL = originalRevokeObjectURL;
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers().setSystemTime(new Date("2024-01-01T00:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

const HydrateAtoms = ({
  initialValues,
  children,
}: {
  initialValues: Parameters<typeof useHydrateAtoms>[0];
  children: React.ReactNode;
}) => {
  useHydrateAtoms(initialValues);
  return children;
};

const TestProvider = ({
  initialValues,
  children,
}: Parameters<typeof HydrateAtoms>[0]) => (
  <Provider>
    <HydrateAtoms initialValues={initialValues}>{children}</HydrateAtoms>
  </Provider>
);

describe("legado export", () => {
  test("button disabled when raState raState is not ready", async () => {
    render(<ExportRa />, { wrapper: Provider });
    expect(screen.getByRole("button")).toBeDisabled();
  });

  test("copy when single voice", async () => {
    render(<ExportRa />, {
      wrapper: ({ children }) => (
        <TestProvider
          // @ts-expect-error ignore
          initialValues={[
            [raApiConfigAtom, { url: "https://example.com", token: "" }],
          ]}
        >
          {children}
        </TestProvider>
      ),
    });
    fireEvent.click(screen.getByRole("button"));
    expect(mocks.clipboardWriteText).toHaveBeenCalled();
    expect(mocks.posthog.capture).toHaveBeenCalledWith("profile exported", {
      type: "ra",
      app: "legado",
      method: "copy-profile",
    });
  });

  test("download when multi voice", async () => {
    render(<ExportRa />, {
      wrapper: ({ children }) => (
        <TestProvider
          // @ts-expect-error ignore
          initialValues={[
            [raApiConfigAtom, { url: "https://example.com", token: "" }],
            [
              raVoiceConfigAtom,
              {
                voiceName: { type: "all-zh", nameList: ["1"] },
                advanced: {
                  pitch: "",
                  rate: "",
                  format: "audio-24khz-48kbitrate-mono-mp3",
                  volume: "",
                },
              } satisfies RaVoiceConfig,
            ],
          ]}
        >
          {children}
        </TestProvider>
      ),
    });
    fireEvent.click(screen.getByRole("button"));
    expect(createURLMock).toHaveBeenCalled();
  });
});
