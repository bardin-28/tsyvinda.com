import type { Meta, StoryObj } from "@storybook/nextjs";

import { AntdProvider } from "@/shared/providers/AntdProvider";

import { ConsentProvider } from "../../ConsentProvider";
import { CookiePreferences } from "../CookiePreferences/CookiePreferences";
import { CookieBanner } from "./CookieBanner";

/**
 * The banner hides once a choice is saved in the `cookie_consent` cookie. To see it again after
 * clicking a button, delete that cookie for the Storybook origin and reload.
 */
const meta: Meta<typeof CookieBanner> = {
  title: "Consent/CookieBanner",
  component: CookieBanner,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <ConsentProvider>
        <AntdProvider>
          <div style={{ minHeight: "100vh", background: "#080810" }}>
            <Story />
            <CookiePreferences />
          </div>
        </AntdProvider>
      </ConsentProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof CookieBanner>;

export const Default: Story = {};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
