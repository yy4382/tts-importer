import {
  vi,
  describe,
  test,
  expect,
  // afterEach,
  // beforeEach,
  beforeAll,
  afterAll,
} from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ExportRa } from "./export";
import { Provider } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { raApiConfigAtom, RaVoiceConfig, raVoiceConfigAtom } from "./ra-data";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({
  toast: vi.fn(),
  posthog: {
    capture: vi.fn(),
  },
  clipboardWriteText: vi.fn().mockResolvedValue(undefined),
  generate: {
    legado: vi.fn().mockReturnValue("generated-legado-profile"),
    ireadnote: vi.fn().mockReturnValue("generated-ireadnote-profile"),
  },
}));

vi.mock(import("posthog-js"), () => ({
  posthog: {
    capture: mocks.posthog.capture,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
}));

vi.mock(
  import("sonner"),
  () =>
    ({
      toast: mocks.toast,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
);

vi.mock(import("./generate-profile"), () => ({
  generateProfileLegado: mocks.generate.legado,
  generateProfileIreadnote: mocks.generate.ireadnote,
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

// beforeEach(() => {
//   vi.clearAllMocks();
//   vi.useFakeTimers().setSystemTime(new Date("2024-01-01T00:00:00.000Z"));
// });

// afterEach(() => {
//   vi.useRealTimers();
// });

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
    expect(mocks.generate.legado).toHaveBeenCalledWith(
      expect.objectContaining({
        api: expect.objectContaining({ url: "https://example.com" }),
      }),
      expect.objectContaining({ rateTemplate: "" })
    );
    await waitFor(() => {
      expect(mocks.toast).toHaveBeenCalled();
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
    expect(mocks.toast).toHaveBeenCalledWith(expect.stringContaining("下载"));
    expect(mocks.posthog.capture).toHaveBeenCalledWith("profile exported", {
      type: "ra",
      app: "legado",
      method: "copy-profile",
    });
    expect(mocks.generate.legado).toHaveBeenCalledWith(
      expect.objectContaining({
        api: expect.objectContaining({ url: "https://example.com" }),
      }),
      expect.objectContaining({ rateTemplate: "" })
    );
    expect(createURLMock).toHaveBeenCalled();
  });
  test("rate template applied", async () => {
    const user = userEvent.setup();
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
    const rateTemplateInput = screen.getByLabelText(/语速/);
    // four {{{{ because of user-event escape
    await user.type(rateTemplateInput, "{{{{(speakSpeed-4.9)/30+0.5}}");
    await user.click(screen.getByRole("button"));
    expect(mocks.generate.legado).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        rateTemplate: "{{(speakSpeed-4.9)/30+0.5}}",
      })
    );
  });
});

describe("ireadnote export", () => {
  test("button disabled when voice config invalid", async () => {
    const user = userEvent.setup();

    render(<ExportRa />, {
      wrapper: ({ children }) => (
        <TestProvider
          // @ts-expect-error intentionally invalid voice config for validation failure
          initialValues={[
            [
              raVoiceConfigAtom,
              { advanced: { pitch: "", rate: "", format: "", volume: "" } },
            ],
          ]}
        >
          {children}
        </TestProvider>
      ),
    });

    await user.click(screen.getByRole("tab", { name: "爱阅记" }));

    expect(
      screen.getByRole("button", { name: "复制爱阅记配置" })
    ).toBeDisabled();
  });

  test("copy profile when state is valid", async () => {
    const user = userEvent.setup();

    render(<ExportRa />, {
      wrapper: ({ children }) => (
        <TestProvider
          // @ts-expect-error ignore jotai tuple typing
          initialValues={[
            [raApiConfigAtom, { url: "https://example.com", token: "" }],
          ]}
        >
          {children}
        </TestProvider>
      ),
    });

    await user.click(screen.getByRole("tab", { name: "爱阅记" }));
    const exportButton = screen.getByRole("button", { name: "复制爱阅记配置" });
    expect(exportButton).toBeEnabled();

    fireEvent.click(exportButton);

    // expect(mocks.clipboardWriteText).toHaveBeenCalled();
    await waitFor(async () => {
      expect(await navigator.clipboard.readText()).toContain(
        "generated-ireadnote-profile"
      );
    });

    expect(mocks.generate.ireadnote).toHaveBeenCalledWith(
      expect.objectContaining({
        api: expect.objectContaining({ url: "https://example.com" }),
      })
    );
    expect(mocks.posthog.capture).toHaveBeenCalledWith("profile exported", {
      type: "ra",
      app: "ireadnote",
      method: "copy-profile",
    });

    await waitFor(() => {
      expect(mocks.toast).toHaveBeenCalledWith("已复制到剪贴板");
    });
  });
});

describe("sourcereader export", () => {
  test("downloads json for single voice with voice name in filename", async () => {
    render(<ExportRa />, {
      wrapper: ({ children }) => (
        <TestProvider
          // @ts-expect-error ignore jotai tuple typing
          initialValues={[
            [raApiConfigAtom, { url: "https://example.com", token: "" }],
          ]}
        >
          {children}
        </TestProvider>
      ),
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole("tab", { name: "源阅读" }));
    await user.click(screen.getByRole("button", { name: "下载源阅读配置" }));

    expect(mocks.generate.legado).toHaveBeenCalledWith(
      expect.objectContaining({
        api: expect.objectContaining({ url: "https://example.com" }),
      }),
      expect.objectContaining({ rateTemplate: "" })
    );

    expect(mocks.posthog.capture).toHaveBeenCalledWith("profile exported", {
      type: "ra",
      app: "sourcereader",
      method: "copy-profile",
    });

    await waitFor(() => {
      expect(createURLMock).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(revokeObjectURLMock).toHaveBeenCalled();
    });
  });
});
