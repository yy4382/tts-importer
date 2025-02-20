import { useCallback } from "react";
import { toast } from "sonner";

type CopyFn = (text: string) => Promise<boolean>;

export function useCopyToClipboard(): CopyFn {
  const copy: CopyFn = useCallback(async (text) => {
    if (!navigator?.clipboard) {
      console.warn("Clipboard API not available");
      toast.error("Clipboard API not available");
      return false;
    }

    // Try to save to clipboard then save it in the state if worked
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
      return true;
    } catch (error) {
      console.warn("Copy failed", error);
      toast.error("Failed to copy to clipboard", {
        description: (error as Error).message,
      });
      return false;
    }
  }, []);
  return copy;
}
