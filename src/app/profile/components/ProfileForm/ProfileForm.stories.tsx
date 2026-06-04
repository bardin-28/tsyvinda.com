import type { Meta, StoryObj } from "@storybook/nextjs";

import { UserProvider, type User } from "@/shared/contexts/UserContext";

import { ProfileForm } from "./ProfileForm";

const baseUser: User = {
  id: "980de598-64f9-4c36-b346-3f90910544b3",
  email: "vladyslav@tsyvinda.com",
  firstName: "Vladyslav",
  lastName: "Tsyvinda",
  profileImageUrl: null,
  emailVerified: true,
  approvedByAdmin: true,
  createdAt: "2026-05-20T21:32:36.216Z",
};

const userWithAvatar: User = {
  ...baseUser,
  profileImageUrl: "https://i.pravatar.cc/160?img=12",
};

const unverifiedUser: User = {
  ...baseUser,
  emailVerified: false,
};

const meta: Meta<typeof ProfileForm> = {
  title: "Profile/ProfileForm",
  component: ProfileForm,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div
        style={{
          width: 520,
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

type Story = StoryObj<typeof ProfileForm>;

export const ReadOnly: Story = {
  decorators: [
    (Story) => (
      <UserProvider initialUser={baseUser}>
        <Story />
      </UserProvider>
    ),
  ],
};

export const WithAvatar: Story = {
  decorators: [
    (Story) => (
      <UserProvider initialUser={userWithAvatar}>
        <Story />
      </UserProvider>
    ),
  ],
};

export const Unverified: Story = {
  decorators: [
    (Story) => (
      <UserProvider initialUser={unverifiedUser}>
        <Story />
      </UserProvider>
    ),
  ],
};

export const NotSignedIn: Story = {
  decorators: [
    (Story) => (
      <UserProvider initialUser={null}>
        <Story />
      </UserProvider>
    ),
  ],
};
