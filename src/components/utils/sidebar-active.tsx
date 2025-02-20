"use client";

import { usePathname } from "next/navigation";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export function SidebarItemActive({
  pathname,
  ...restProp
}: Readonly<
  React.ComponentProps<typeof SidebarMenuButton> & { pathname: string }
>) {
  const location = usePathname();
  return <SidebarMenuButton {...restProp} isActive={pathname === location} />;
}
