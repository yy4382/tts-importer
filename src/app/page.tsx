import Link from "next/link";
import { allHelps } from "content-collections";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { AppTopbar } from "@/components/modules/app-topbar";
import { ArrowRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import raIcon from "@/assets/image/read-aloud-svgrepo-com.svg";
import azureTtsIcon from "@/assets/image/favicon.svg";

export default function Page() {
  const helpDocs = allHelps.sort((a, b) => (a.order < b.order ? -1 : 1));

  return (
    <div className="w-full min-h-screen">
      <AppTopbar location={[{ title: "首页" }]} />

      {/* Hero Section */}
      <div className="relative">
        <div className="relative container mx-auto px-6 pt-20 lg:pt-28">
          <div className="max-w-6xl mx-auto">
            {/* Hero Content */}
            <div className="text-left mb-20">
              <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight">
                <span className="text-primary">轻松导入</span>
                <br />
                <span className="text-primary">TTS 语音合成</span>
              </h1>

              <p className="text-xl lg:text-2xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
                为听书应用生成 TTS 配置并提供快速导入链接。支持 Azure TTS 官方
                API 和 Read Aloud（大声朗读，Edge
                TTS）两种服务，兼容阅读系、爱阅系等一系列听书软件。
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid lg:grid-cols-2 gap-8 mb-24">
              <Card className="group relative overflow-hidden border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 justify-between">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-950/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Image
                        src={azureTtsIcon}
                        alt="Azure TTS"
                        className="size-6 [filter:brightness(0)] dark:[filter:brightness(0)_invert(1)]"
                      />
                    </div>
                    <CardTitle className="text-2xl font-bold">
                      Azure TTS 导入
                    </CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed text-muted-foreground">
                    快速、稳定、高质量的微软官方 TTS
                    服务，支持的语音、语气格式丰富。
                    <br />
                    需要 Azure 账号，每月 50 万字符的免费额度。
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link
                    href="/azure"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "flex items-center justify-center gap-2 w-full group/btn"
                    )}
                  >
                    开始配置 Azure TTS
                    <ArrowRight className="size-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </Link>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 justify-between">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Image
                        src={raIcon}
                        alt="Read Aloud"
                        className="size-6 [filter:brightness(0)] dark:[filter:brightness(0)_invert(1)]"
                      />
                    </div>
                    <CardTitle className="text-2xl font-bold">
                      Read Aloud (Edge TTS) 导入
                    </CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed text-muted-foreground">
                    自托管的大声朗读服务，可以满足听书软件对 Edge TTS 的需求。
                    <br />
                    依托于{" "}
                    <a href="https://ra.yfi.moe" className="text-blue-500">
                      yy4382/read-aloud
                    </a>{" "}
                    项目的 API 转发功能，可以自行部署于 Cloudflare、Vercel 或者
                    Docker 容器中。
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link
                    href="/ra"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "flex items-center justify-center gap-2 w-full group/btn"
                    )}
                  >
                    开始配置 Edge TTS
                    <ArrowRight className="size-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                需要帮助？
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {helpDocs.map((doc, idx) => (
                <Card
                  key={idx}
                  className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border hover:border-primary/20"
                >
                  <CardContent className="px-6">
                    <Link href={`/help/${doc.slug}`} className="block">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                          <BookOpen className="size-4" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors duration-300">
                            {doc.title}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground group-hover:text-primary/70 transition-colors duration-300">
                            阅读指南
                            <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform duration-200" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
