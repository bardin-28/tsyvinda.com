import type { Meta, StoryObj } from "@storybook/nextjs";

import { RequestResetForm } from "./RequestResetForm";

const meta: Meta<typeof RequestResetForm> = {
  title: "ResetPassword/RequestResetForm",
  component: RequestResetForm,
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

type Story = StoryObj<typeof RequestResetForm>;

// The email-request form. Submitting it (with a mock backend) swaps to the
// generic "check your inbox" panel; here we show the default input state.
export const Default: Story = {};
