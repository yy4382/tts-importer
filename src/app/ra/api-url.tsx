"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAtom } from "jotai";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import { raApiConfigAtom } from "./ra-data";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export default function ApiUrl() {
  const [api, setApi] = useAtom(raApiConfigAtom);
  const [apiSite, setApiSite] = useQueryState("api-site", {
    shallow: true,
    limitUrlUpdates: {
      method: "throttle",
      timeMs: 300,
    },
  });

  // sync api.url with apiSite URL param (only from URL to state)
  useEffect(() => {
    if (apiSite) {
      setApi((prev) => ({ ...prev, url: apiSite }));
    }
  }, [apiSite, setApi]);

  return (
    <Card className="w-card">
      <CardHeader>
        <CardTitle>API 设置</CardTitle>
        <CardDescription>
          <Link
            href="https://github.com/yy4382/read-aloud"
            className="text-blue-500"
          >
            yy4382/read-aloud
          </Link>{" "}
          项目的配置生成面板。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-2 w-full">
            <Label>API URL</Label>
            <Input
              value={api.url}
              onChange={(e) => {
                setApi((prev) => ({ ...prev, url: e.target.value }));
                setTimeout(() => {
                  setApiSite(e.target.value || null);
                }, 50);
              }}
            />
            <p className="text-[0.8rem] text-neutral-500 dark:text-neutral-400">
              yy4382/read-aloud 项目部署到的 URL。
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <Label>Token</Label>
            <Input
              value={api.token}
              onChange={(e) =>
                setApi((prev) => ({ ...prev, token: e.target.value }))
              }
            />
            <p className="text-[0.8rem] text-neutral-500 dark:text-neutral-400">
              在部署时设置的 TOKEN。
            </p>
          </div>
        </div>{" "}
      </CardContent>
    </Card>
  );
}

export function ApiUrlHelp() {
  return (
    <div className="w-card mb-4 mt-10 prose dark:prose-invert prose-sm">
      <h1 className="text-2xl text-foreground font-semibold mb-6">
        开始之前……
      </h1>
      <Accordion defaultValue="item-1" collapsible type="single">
        <AccordionItem value="item-1">
          <AccordionTrigger className="py-0">
            了解 Edge TTS, Read Aloud, yy4382/read-aloud 以及本网页之间的关系
          </AccordionTrigger>
          <AccordionContent>
            <ul className="mt-0 text-sm leading-snug">
              <li>
                <strong>Read Aloud</strong>（大声朗读）是微软给自家服务（如 Edge
                浏览器，Word 文档）提供的文字转语音服务。由于大家提取出来用的是
                Edge 浏览器使用的大声朗读接口，因此也常常被称为{" "}
                <strong>Edge TTS</strong>。
              </li>
              <li>
                由于 Edge TTS 使用的是大部分阅读软件都不支持的 WebSocket
                协议，因此需要一个服务来转发转换请求。
                <a
                  className="text-blue-500"
                  href="https://github.com/yy4382/read-aloud"
                >
                  <strong>yy4382/read-aloud</strong>
                </a>{" "}
                就是一个由我开发的 Edge TTS 转发服务，支持并鼓励自托管。
              </li>
              <li>
                当前网页是 <strong>yy4382/read-aloud</strong>{" "}
                的一个附属工具，负责生成各种听书软件的配置和导入链接。当前网页本身属于
                <a
                  className="text-blue-500"
                  href="https://github.com/yy4382/tts-importer"
                >
                  TTS Importer
                </a>{" "}
                项目，这是我用于不同种类 TTS 配置生成和导入的一站式前端。
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <p>
        如果想要使用当前网页上的工具生成 TTS 配置，需要先部署一个
        <a
          className="text-blue-500"
          href="https://github.com/yy4382/read-aloud"
        >
          yy4382/read-aloud
        </a>{" "}
        的服务，它支持被部署到 Cloudflare Worker, Vercel 或者 Docker 容器中。
      </p>
      <p className="">
        部署完成后，在下方填入对应的 API URL 和 Token
        即可使用。或在自己部署的网页中点击“导入”按钮，会被重定向到当前网页并自动填入
        API URL。
      </p>
      <p className="text-xs">
        注：由于自动填入特性的存在，如果从read-aloud 的示例网页跳转过来，可能
        API URL 中会被填入示例网页的 URL。您需要将它改为自己的部署地址。
      </p>
    </div>
  );
}
