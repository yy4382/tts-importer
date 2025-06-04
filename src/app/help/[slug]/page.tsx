// import { format, parseISO } from "date-fns";
import { AppTopbar } from "@/components/modules/app-topbar";
import { allHelps } from "content-collections";
import { MDXContent } from "@content-collections/mdx/react";

export const generateStaticParams = async () =>
  allHelps.map((post) => ({ slug: post.slug }));

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const post = allHelps.find((post) => post.slug === slug);
  if (!post) throw new Error(`Post not found for slug: ${slug}`);
  return { title: post.title };
};

const PostLayout = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const post = allHelps.find((post) => post.slug === slug);
  if (!post) throw new Error(`Post not found for slug: ${slug}`);

  return (
    <div className="w-full">
      <AppTopbar
        location={[{ title: "帮助", link: "/help" }, { title: post.title }]}
      />
      <article className="mx-auto max-w-[min(36rem,90%)] py-8 prose dark:prose-invert">
        <h1>{post.title}</h1>
        <MDXContent code={post.mdx} />
      </article>
    </div>
  );
};

export default PostLayout;
