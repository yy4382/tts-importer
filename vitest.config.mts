import { defineConfig, configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    setupFiles: ["test/vitest-setup.ts"],
    coverage: {
      exclude: [
        ...(configDefaults.coverage.exclude || []),
        "src/components/ui/*",
        "content-collections.ts",
        "next.config.ts",
        "postcss.config.mjs",
      ],
    },
  },
});
