import Link from "next/link";
// import { compareDesc, format, parseISO } from "date-fns";
import { allHelps } from "content-collections";
import { AppTopbar } from "@/components/modules/app-topbar";

function DocsCard(doc: (typeof allHelps)[number]) {
  return (
    <h2 className="mb-1 text-xl">
      <Link
        href={`/help/${doc.slug}`}
        className="text-blue-700 hover:text-blue-900 dark:text-blue-400 underline underline-offset-2"
      >
        {doc.title}
      </Link>
    </h2>
  );
}

export default function Home() {
  const posts = allHelps;

  return (
    <div className="w-full">
      <AppTopbar location={[{ title: "帮助" }]} />
      <div className="mx-auto max-w-xl py-8">
        <h1 className="mb-8 text-center text-2xl font-black">帮助中心</h1>
        {posts.map((post, idx) => (
          <DocsCard key={idx} {...post} />
        ))}
      </div>
    </div>
  );
}
