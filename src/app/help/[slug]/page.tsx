// import { format, parseISO } from "date-fns";
import { AppTopbar } from "@/components/modules/app-topbar";
import { allDocs } from "contentlayer/generated";

export const generateStaticParams = async () =>
  allDocs.map((post) => ({ slug: post._raw.flattenedPath }));

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const post = allDocs.find((post) => post.url.split("/").pop() === slug);
  if (!post) throw new Error(`Post not found for slug: ${slug}`);
  return { title: post.title };
};

const PostLayout = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const post = allDocs.find((post) => post.url.split("/").pop() === slug);
  if (!post) throw new Error(`Post not found for slug: ${slug}`);

  return (
    <div className="w-full">
      <AppTopbar
        location={[{ title: "帮助", link: "/help" }, { title: post.title }]}
      />
      <article className="mx-auto max-w-xl py-8 prose dark:prose-dark">
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.body.html }} />
      </article>
    </div>
  );
};

export default PostLayout;
