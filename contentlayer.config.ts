import { defineDocumentType, makeSource } from "contentlayer/source-files";
import rehypeImageOptimization, {
  defineOptions as defineOptimizeOptions,
} from "rehype-image-optim";

export const Docs = defineDocumentType(() => ({
  name: "Docs",
  filePathPattern: `**/*.md`,
  fields: {
    title: { type: "string", required: true },
    order: { type: "number", required: true },
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (doc) => `/${doc._raw.flattenedPath}`,
    },
  },
}));

export default makeSource({
  contentDirPath: "./content",
  documentTypes: [Docs],
  markdown: {
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
  },
});
