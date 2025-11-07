import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "../ui/breadcrumb";
import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";
import { ModeToggle } from "../ui/theme-changer";
import { buttonVariants } from "../ui/button";
import { Fragment } from "react";
import Link from "next/link";

export function AppTopbar(prop: {
  location: { title: string; link?: string }[];
}) {
  return (
    <header className="flex items-center w-full gap-2 pr-4 pl-2 h-12 border-b mb-4 sticky top-0 bg-background z-10">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-1 my-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList className="text-base">
          {prop.location.map((item, idx) => (
            <Fragment key={item.title}>
              {idx !== 0 && <BreadcrumbSeparator />}
              {idx === prop.location.length - 1 ? (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.link || "/"}>
                  {item.title}
                </BreadcrumbLink>
              )}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex-grow justify-end flex gap-2">
        <Link
          href="/help/issue-report"
          className={buttonVariants({ variant: "outline" })}
        >
          问题反馈
        </Link>
        <ModeToggle className="justify-self-end" />
      </div>
    </header>
  );
}
