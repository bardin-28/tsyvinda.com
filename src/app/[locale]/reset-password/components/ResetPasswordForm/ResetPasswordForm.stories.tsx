import type { Meta, StoryObj } from "@storybook/nextjs";

import { ResetPasswordForm } from "./ResetPasswordForm";

const meta: Meta<typeof ResetPasswordForm> = {
  title: "ResetPassword/ResetPasswordForm",
  component: ResetPasswordForm,
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

type Story = StoryObj<typeof ResetPasswordForm>;

// A token long enough to pass the 32-128 char shape guard, so the form renders.
const VALID_TOKEN = "a".repeat(40);

export const Default: Story = {
  args: { token: VALID_TOKEN },
};

// An empty/short token shows the recovery panel instead of the form.
export const InvalidToken: Story = {
  args: { token: "" },
};
