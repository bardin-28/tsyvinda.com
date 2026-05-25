import type { Meta, StoryObj } from "@storybook/nextjs";
import { Logo } from "./Logo";

const meta: Meta<typeof Logo> = {
  title: "Shared/Logo",
  component: Logo,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ background: "#080810", padding: 48, color: "#fd7e14" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Logo>;

export const Brand: Story = {
  render: () => (
    <>
      <Logo title="Vladyslav Tsyvinda" className="logo-demo" />
      <style>{`.logo-demo { height: 40px; width: auto; }`}</style>
    </>
  ),
};

export const White: Story = {
  decorators: [
    (Story) => (
      <div style={{ background: "#080810", padding: 48, color: "#ffffff" }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <>
      <Logo title="VT" className="logo-demo-white" />
      <style>{`.logo-demo-white { height: 40px; width: auto; }`}</style>
    </>
  ),
};

export const Large: Story = {
  render: () => (
    <>
      <Logo title="VT" className="logo-large" />
      <style>{`.logo-large { height: 120px; width: auto; }`}</style>
    </>
  ),
};
