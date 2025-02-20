"use client";

import { Provider } from "jotai";
import type { PropsWithChildren } from "react";
import { Toaster } from "@/components/ui/sonner";
import { DevTools } from "jotai-devtools";
import { SidebarProvider } from "@/components/ui/sidebar";
if (process.env.NODE_ENV === "development") {
  // @ts-expect-error css
  import("jotai-devtools/styles.css");
}

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <Provider>
      <SidebarProvider>
        <DevTools position="bottom-right" />
        {children}
        <Toaster richColors />
      </SidebarProvider>
    </Provider>
  );
};
