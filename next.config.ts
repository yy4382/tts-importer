import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import { withContentlayer } from "next-contentlayer";

const nextConfig: NextConfig = {
  /* config options here */
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  transpilePackages: ["jotai-devtools"],
  experimental: {
    swcPlugins: [
      // ["@swc-jotai/react-refresh", {}], // disabled due to https://github.com/pmndrs/swc-jotai/issues/21
      ["@swc-jotai/debug-label", {}],
    ],
  },
};
const withMDX = createMDX({
  // Add markdown plugins here, as desired
});

// Merge MDX config with Next.js config
export default withContentlayer(withMDX(nextConfig));
