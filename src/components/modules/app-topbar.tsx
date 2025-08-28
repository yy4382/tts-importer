import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";
import { ModeToggle } from "../ui/theme-changer";
import { buttonVariants } from "../ui/button";

export function AppTopbar(prop: {
  location: { title: string; link?: string }[];
}) {
  return (
    <header className="flex items-center w-full gap-2 px-4 h-12 border-b mb-4 sticky top-0 bg-background z-10">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-1 my-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList className="text-base">
          {prop.location.map((item, idx) => (
            <Fragment key={item.title}>
              {idx !== 0 && <BreadcrumbSeparator />}
              {item.link ? (
                <BreadcrumbLink href={item.link}>{item.title}</BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              )}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex-grow justify-end flex gap-2">
        <a
          href="https://github.com/yy4382/tts-importer/issues/new"
          target="_blank"
          className={buttonVariants({ variant: "outline" })}
        >
          问题反馈
        </a>
        <ModeToggle className="justify-self-end" />
      </div>
    </header>
  );
}
