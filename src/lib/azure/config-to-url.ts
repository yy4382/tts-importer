import { ZodError } from "zod";
import { AzureState, azureStateToSearchParams } from "./schema";

export function config2url(
  state: AzureState,
  origin: string,
  pathname: string
): URL {
  const url = new URL(pathname, origin);
  url.search = "?" + azureStateToSearchParams.decode(state).toString();
  return url;
}

export function config2urlNoThrow(...args: Parameters<typeof config2url>) {
  try {
    return config2url(...args).toString();
  } catch (e) {
    if (!(e instanceof Error)) {
      return new Error("unknown error");
    }
    if (e instanceof ZodError) {
      return new Error(e.issues[0].message, { cause: e });
    }
    return e;
  }
}

export function url2config(
  url: URL
): { success: true; data: AzureState } | { success: false; error: Error } {
  const state = azureStateToSearchParams.safeEncode(url.searchParams);
  if (!state.success) {
    return { success: false, error: state.error };
  }
  return { success: true, data: state.data };
}
