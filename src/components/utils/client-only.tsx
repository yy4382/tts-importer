"use client";
import * as React from "react";
export function ClientOnly({
  children,
  serverFallback,
  ...delegated
}: React.PropsWithChildren<
  { serverFallback?: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>
>) {
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) {
    return serverFallback || null;
  }
  return <div {...delegated}>{children}</div>;
}
