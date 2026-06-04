import type { Meta, StoryObj } from "@storybook/nextjs";

import { ConfirmEmail } from "./ConfirmEmail";

const meta: Meta<typeof ConfirmEmail> = {
  title: "Registration/ConfirmEmail",
  component: ConfirmEmail,
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

type Story = StoryObj<typeof ConfirmEmail>;

// A token long enough to pass the 32-128 char shape guard; with no API mock the
// request stays pending, so this renders the "Confirming your email…" state.
export const Verifying: Story = {
  args: { token: "a".repeat(40) },
};

// An empty/short token renders the malformed-link error panel without a request.
export const InvalidToken: Story = {
  args: { token: "" },
};
