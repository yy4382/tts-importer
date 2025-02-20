import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import favicon from "@/assets/image/favicon.svg";
import { GithubIcon } from "lucide-react";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { allDocs } from "contentlayer/generated";
import { SidebarItemActive } from "../utils/sidebar-active";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-10" asChild>
              <div className="flex items-center justify-between w-full">
                <Link
                  href="/"
                  className="flex items-center space-x-2 md:flex-1 rtl:space-x-reverse"
                >
                  <Image
                    src={favicon}
                    className="size-8"
                    alt="Azure TTS logo"
                  />
                  <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
                    TTS Importer
                  </span>
                </Link>
                <Link
                  href="https://github.com/yy4382/tts-importer"
                  className={cn(
                    buttonVariants({ variant: "none", size: "icon" }),
                    "hover:text-purple-400"
                  )}
                >
                  <GithubIcon className="!size-5" />
                </Link>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>导入</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarItemActive asChild pathname="/">
                  <Link href="/">Azure TTS</Link>
                </SidebarItemActive>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>帮助</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {allDocs.map((doc, idx) => (
                <SidebarMenuItem key={idx}>
                  <SidebarItemActive asChild pathname={doc.url}>
                    <Link href={doc.url}>{doc.title}</Link>
                  </SidebarItemActive>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
