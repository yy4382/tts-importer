"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { atom, useAtom } from "jotai";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export type RaApiConfig = {
  url: string;
  token: string;
};

export const raApiConfigAtom = atom<RaApiConfig>({
  url: "",
  token: "",
});

export default function ApiUrl() {
  const [api, setApi] = useAtom(raApiConfigAtom);
  const searchParams = useSearchParams();
  const urlFromSearch = searchParams.get("api-site");
  // sync api.url with urlFromSearch
  useEffect(() => {
    if (urlFromSearch) {
      setApi((prev) => ({ ...prev, url: urlFromSearch }));
    }
  }, [urlFromSearch, setApi]);

  return (
    <Card className="w-card">
      <CardHeader>
        <CardTitle>API 设置</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-2 w-full">
            <Label>API URL</Label>
            <Input
              value={api.url}
              onChange={(e) => {
                setApi((prev) => ({ ...prev, url: e.target.value }));
                updateUrl(e.target.value);
              }}
            />
            <p className="text-[0.8rem] text-neutral-500 dark:text-neutral-400">
              Cloudflare Workers 部署的 URL。
            </p>
            {!api.url && (
              <p className="prose dark:prose-invert w-full text-sm">
                本网页是 <a href="https://ra.yfi.moe">Read Aloud 转发 API</a>{" "}
                的附属项目。 如果想要使用，需要先部署
                <a href="https://github.com/yy4382/read-aloud">
                  这个 Cloudflare Workers&nbsp;
                </a>
                服务，然后填入 API URL。
              </p>
            )}
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
              Cloudflare Workers 中设置的 TOKEN。
            </p>
          </div>
        </div>{" "}
      </CardContent>
    </Card>
  );
}

function updateUrl(apiUrl: string) {
  const currentParams = new URLSearchParams(window.location.search);
  if (apiUrl) {
    currentParams.set("api-site", apiUrl);
  } else {
    currentParams.delete("api-site");
  }
  const newSearch = currentParams.toString();
  const newUrl = newSearch ? `?${newSearch}` : window.location.pathname;
  window.history.replaceState({}, "", newUrl);
}
