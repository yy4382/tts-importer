import Link from "next/link";
// import { compareDesc, format, parseISO } from "date-fns";
import { allDocs, Docs } from "contentlayer/generated";

function DocsCard(doc: Docs) {
  return (
    <div className="mb-8">
      <h2 className="mb-1 text-xl">
        <Link
          href={doc.url}
          className="text-blue-700 hover:text-blue-900 dark:text-blue-400"
        >
          {doc.title}
        </Link>
      </h2>
      <div
        className="text-sm [&>*]:mb-3 [&>*:last-child]:mb-0"
        dangerouslySetInnerHTML={{ __html: doc.body.html }}
      />
    </div>
  );
}

export default function Home() {
  const posts = allDocs;

  return (
    <div className="mx-auto max-w-xl py-8">
      <h1 className="mb-8 text-center text-2xl font-black">
        Next.js + Contentlayer Example
      </h1>
      {posts.map((post, idx) => (
        <DocsCard key={idx} {...post} />
      ))}
    </div>
  );
}
