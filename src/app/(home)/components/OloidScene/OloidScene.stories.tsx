import type { Meta, StoryObj } from "@storybook/nextjs";
import OloidScene from "./OloidScene";

const meta: Meta<typeof OloidScene> = {
  title: "Home/OloidScene",
  component: OloidScene,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Decorative full-screen three.js hero. A metallic brand-orange oloid (the convex hull of two perpendicular circles) tumbles inside an orbiting-light rig with a particle halo. Mounts a fixed-position WebGL canvas with pointer-events disabled; adapts hull segments, particle count, and camera FOV when innerWidth < 768.",
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

type Story = StoryObj<typeof OloidScene>;

export const Default: Story = {};

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};
