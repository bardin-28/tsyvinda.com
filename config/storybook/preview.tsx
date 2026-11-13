import type { Preview } from "@storybook/nextjs";
import { Roboto } from "next/font/google";
import { IntlTestProvider } from "../../src/shared/testing/intl";
import "../../src/app/[locale]/(home)/globals.css";

// Mirror the app's font setup (layout.tsx). Storybook never renders the root
// layout, so the `--font-roboto` variable that globals.css relies on is
// otherwise undefined and previews fall back to system-ui.
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
});

// Portalled UI (antd Modal, Dropdown) mounts on <body>, outside the decorator <div>, so the font
// variables are set on <body> too.
if (typeof document !== "undefined") {
  document.body.classList.add(roboto.variable, roboto.className);
}

const preview: Preview = {
  decorators: [
    (Story) => (
      // Components read their texts from next-intl; stories render the English messages
      <IntlTestProvider>
        <div className={`${roboto.variable} ${roboto.className}`}>
          <Story />
        </div>
      </IntlTestProvider>
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
