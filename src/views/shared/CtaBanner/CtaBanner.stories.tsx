import type { Meta, StoryObj } from "@storybook/nextjs";

import { CtaBanner } from "./CtaBanner";

const meta: Meta<typeof CtaBanner> = {
  title: "CMS/CtaBanner",
  component: CtaBanner,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CtaBanner>;

export const Default: Story = {
  args: {
    data: {
      title: "Let’s build something.",
      text: "Open to discuss new projects. Reach me on any channel below.",
      linkLabel: "Get in touch",
      link: { key: "contacts", path: "/contacts" },
    },
  },
};

/** The linked page is not published in this language: the button is hidden. */
export const WithoutLink: Story = {
  args: {
    data: {
      title: "Let’s build something.",
      text: "",
      linkLabel: "Get in touch",
      link: { key: "contacts", path: null },
    },
  },
};
