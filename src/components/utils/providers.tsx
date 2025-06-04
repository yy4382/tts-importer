"use client";

import { Provider } from "jotai";
import type { PropsWithChildren } from "react";
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PostHogProvider } from "./posthog-provider";

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <PostHogProvider>
      <Provider>
        <SidebarProvider>
          {children}
          <Toaster richColors />
        </SidebarProvider>
      </Provider>
    </PostHogProvider>
  );
};
