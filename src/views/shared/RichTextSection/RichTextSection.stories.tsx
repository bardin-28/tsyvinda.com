import type { Meta, StoryObj } from "@storybook/nextjs";

import { RichTextSection } from "./RichTextSection";

const meta: Meta<typeof RichTextSection> = {
  title: "CMS/RichTextSection",
  component: RichTextSection,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RichTextSection>;

export const Default: Story = {
  args: {
    data: {
      heading: "What are cookies?",
      html: '<p>Cookies are small text files. See the <a href="/privacy-policy">Privacy Policy</a>.</p><ul><li>Strictly necessary</li><li>Analytics</li></ul>',
    },
  },
};
