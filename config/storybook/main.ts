import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["../../src/**/*.stories.@(ts|tsx|mdx)"],
  addons: [],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  staticDirs: ["../../public"],
  typescript: {
    reactDocgen: "react-docgen-typescript",
  },
  // The tsconfig-paths plugin resolves `@/x` imports but not webpack context requests built from
  // template strings (`require(\`@/messages/${locale}/…\`)` in src/shared/testing/intl.tsx), so `@`
  // is also registered as a plain alias.
  webpackFinal: async (webpackConfig) => {
    webpackConfig.resolve ??= {};
    webpackConfig.resolve.alias = {
      ...webpackConfig.resolve.alias,
      "@": fileURLToPath(new URL("../../src", import.meta.url)),
    };
    return webpackConfig;
  },
};

export default config;
