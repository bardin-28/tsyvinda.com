import type { Meta, StoryObj } from "@storybook/nextjs";
import { Button } from "antd";

import { AntdProvider } from "@/shared/providers/AntdProvider";

import { ConsentProvider, useConsent } from "../../ConsentProvider";
import { CookiePreferences } from "./CookiePreferences";

/** Stands in for the banner / footer button that opens the preference center. */
function OpenPreferencesButton() {
  const { openPreferences } = useConsent();
  return (
    <Button type="primary" onClick={openPreferences}>
      Open cookie settings
    </Button>
  );
}

const meta: Meta<typeof CookiePreferences> = {
  title: "Consent/CookiePreferences",
  component: CookiePreferences,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <ConsentProvider>
        <AntdProvider>
          <div
            style={{ minHeight: "100vh", padding: 32, background: "#080810" }}
          >
            <OpenPreferencesButton />
            <Story />
          </div>
        </AntdProvider>
      </ConsentProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof CookiePreferences>;

export const Default: Story = {};
