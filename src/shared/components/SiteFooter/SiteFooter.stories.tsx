import type { Meta, StoryObj } from "@storybook/nextjs";
import { ConsentProvider } from "@/shared/consent";

import { SiteFooter } from "./SiteFooter";

const meta: Meta<typeof SiteFooter> = {
  title: "Shared/SiteFooter",
  component: SiteFooter,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <ConsentProvider>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            background: "#080810",
          }}
        >
          <Story />
        </div>
      </ConsentProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof SiteFooter>;

export const Default: Story = {};
