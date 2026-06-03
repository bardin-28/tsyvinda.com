import type { Preview } from "@storybook/nextjs";
import { Roboto } from "next/font/google";
import "../../src/app/(home)/globals.css";

// Mirror the app's font setup (layout.tsx). Storybook never renders the root
// layout, so the `--font-roboto` variable that globals.css relies on is
// otherwise undefined and previews fall back to system-ui.
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const preview: Preview = {
  decorators: [
    (Story) => (
      <div className={`${roboto.variable} ${roboto.className}`}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    // Provide the App Router context so hooks like `usePathname()` return a
    // real path instead of null (which crashes `isChromeHidden`). Stories can
    // override the path via `parameters.nextjs.navigation.pathname`.
    nextjs: {
      appDirectory: true,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
