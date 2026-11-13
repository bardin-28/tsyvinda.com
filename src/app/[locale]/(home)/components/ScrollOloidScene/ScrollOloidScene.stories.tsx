import type { Meta, StoryObj } from "@storybook/nextjs";
import ScrollOloidScene from "./ScrollOloidScene";

const meta: Meta<typeof ScrollOloidScene> = {
  title: "Home/ScrollOloidScene",
  component: ScrollOloidScene,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Scroll-driven full-screen three.js hero. A metallic brand-orange oloid (convex hull of two perpendicular circles) with glowing edge seams tumbles as the page scrolls, lit by orbiting point lights, with a faint particle halo. Reads window scroll directly (smoothed) so it pairs with Lenis, and keeps a slow idle spin at rest. Mounts a fixed-position WebGL canvas with pointer-events disabled; adapts hull segments, particle count, and camera FOV when innerWidth < 768.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ minHeight: "100vh", background: "#080810" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ScrollOloidScene>;

export const Default: Story = {};

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};
