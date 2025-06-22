import { AppTopbar } from "@/components/modules/app-topbar";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="w-full">
      <AppTopbar location={[{ title: "帮助", link: "/help" }]} />
      <div className="mx-auto max-w-[min(36rem,90%)] space-y-4 py-8">
        <h1 className="text-2xl font-bold">帮助不存在</h1>
        <p>请检查帮助的链接是否正确。如果问题仍然存在，请联系我们。</p>
        <Link href="/help" className={buttonVariants({ variant: "outline" })}>
          返回帮助中心
        </Link>
      </div>
    </div>
  );
}
