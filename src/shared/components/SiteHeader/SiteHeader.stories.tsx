import type { Meta, StoryObj } from "@storybook/nextjs";
import { UserProvider, type User } from "@/shared/contexts/UserContext";
import { SiteHeader } from "./SiteHeader";

const demoUser: User = {
  id: "1",
  email: "bardindeveloper@gmail.com",
  name: "Vladyslav Tsyvinda",
};

const meta: Meta<typeof SiteHeader> = {
  title: "Shared/SiteHeader",
  component: SiteHeader,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ minHeight: "100vh", background: "#080810" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof SiteHeader>;

export const LoggedOut: Story = {
  decorators: [
    (Story) => (
      <UserProvider initialUser={null}>
        <Story />
      </UserProvider>
    ),
  ],
};

export const LoggedIn: Story = {
  decorators: [
    (Story) => (
      <UserProvider initialUser={demoUser}>
        <Story />
      </UserProvider>
    ),
  ],
};
