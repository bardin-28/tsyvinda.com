import type { Meta, StoryObj } from "@storybook/nextjs";
import type { Post } from "@/api/posts";
import { PostCard } from "./PostCard";

const samplePost: Post = {
  id: "sample-1",
  title: "Building production-grade Next.js apps",
  description:
    "Lessons from shipping React 19 + App Router to real users — caching, streaming, and SEO at the edge.",
  htmlContent: "<p>body</p>",
  imageUrl:
    "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1200&q=80",
  author: {
    id: "author-1",
    firstName: "Vladyslav",
    lastName: "Tsyvinda",
    profileImageUrl:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=96&q=80",
  },
  createdAt: "2026-02-10T08:00:00.000Z",
  updatedAt: "2026-02-10T08:00:00.000Z",
};

const meta: Meta<typeof PostCard> = {
  title: "Blog/PostCard",
  component: PostCard,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: 360, background: "#080810", padding: 32 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof PostCard>;

export const Default: Story = {
  args: { post: samplePost },
};

export const NoCoverImage: Story = {
  args: { post: { ...samplePost, imageUrl: "" } },
};

export const AuthorWithoutAvatar: Story = {
  args: {
    post: {
      ...samplePost,
      author: { ...samplePost.author, profileImageUrl: "" },
    },
  },
};

export const LongTitle: Story = {
  args: {
    post: {
      ...samplePost,
      title:
        "A very long, multi-line title that demonstrates how the card clamps overflowing headings to two lines while keeping the layout tidy",
    },
  },
};
