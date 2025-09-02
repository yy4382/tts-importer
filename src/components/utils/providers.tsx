"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import {
  QueryClient,
  QueryClientProvider,
  defaultShouldDehydrateQuery,
  isServer,
} from "@tanstack/react-query";
import { Provider } from "jotai";
import type { PropsWithChildren } from "react";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
      dehydrate: {
        // include pending queries in dehydration
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export const Providers = ({ children }: PropsWithChildren) => {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <SidebarProvider>
          {children}
          <Toaster richColors />
        </SidebarProvider>
      </Provider>
    </QueryClientProvider>
  );
};
