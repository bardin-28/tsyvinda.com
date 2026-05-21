import type { Meta, StoryObj } from "@storybook/nextjs";
import CylinderScene from "./CylinderScene";

const meta: Meta<typeof CylinderScene> = {
  title: "Home/CylinderScene",
  component: CylinderScene,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Decorative full-screen three.js hero. Mounts a fixed-position WebGL canvas with pointer-events disabled. Adapts particle count and camera FOV when innerWidth < 768.",
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

type Story = StoryObj<typeof CylinderScene>;

export const Default: Story = {};

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};
