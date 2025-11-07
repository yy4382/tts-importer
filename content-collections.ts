import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import rehypeImageOptimization, {
  defineOptions as defineOptimizeOptions,
} from "rehype-image-optim";
import { z } from "zod";
import remarkGfm from "remark-gfm";

const help = defineCollection({
  name: "help",
  directory: "content/help",
  include: "*.mdx",
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    order: z.number(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        [
          rehypeImageOptimization,
          defineOptimizeOptions({
            provider: "cloudflare",
            originValidation: (url: string) => {
              return new URL(url).hostname === "i.yfi.moe";
            },
            optimizeSrcOptions: { options: "f=auto,w=640,fit=scale-down" },
            srcsetOptionsList: [
              [{ options: "f=auto,w=320,fit=scale-down" }, "320w"],
              [{ options: "f=auto,w=640,fit=scale-down" }, "640w"],
              [{ options: "f=auto,w=1280,fit=scale-down" }, "1280w"],
            ],
            sizesOptionsList: ["(max-width: 640px) 320px", "640px"],
            style: "max-width: 100%; width:100%; height: auto;",
          }),
        ],
      ],
    });
    return {
      ...document,
      mdx,
    };
  },
});

export default defineConfig({
  collections: [help],
});
