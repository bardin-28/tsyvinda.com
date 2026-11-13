import type { Meta, StoryObj } from "@storybook/nextjs";

import { RegisterForm } from "./RegisterForm";

const meta: Meta<typeof RegisterForm> = {
  title: "Register/RegisterForm",
  component: RegisterForm,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div
        style={{
          width: 420,
          maxWidth: "100%",
          padding: 32,
          background: "var(--surface-1, #14141c)",
          border: "1px solid var(--border, rgba(255,255,255,0.1))",
          borderRadius: 20,
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof RegisterForm>;

export const Default: Story = {};
