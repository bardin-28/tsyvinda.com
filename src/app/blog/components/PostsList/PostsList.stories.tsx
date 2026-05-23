import type { Meta, StoryObj } from "@storybook/nextjs";
import type { Post } from "@/api/posts";
import { PostsList } from "./PostsList";

const makePost = (id: string, title: string): Post => ({
  id,
  slug: id,
  title,
  description:
    "Short description of the article. Two or three sentences to demonstrate the card layout.",
  htmlContent: "<p>x</p>",
  imageUrl:
    "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1200&q=80",
  author: {
    id: "u",
    firstName: "Vladyslav",
    lastName: "Tsyvinda",
    profileImageUrl: "",
  },
  createdAt: "2026-02-10T08:00:00.000Z",
  updatedAt: "2026-02-10T08:00:00.000Z",
});

const items = [
  makePost("1", "Building production-grade Next.js apps"),
  makePost("2", "From REST to cursor pagination: a practical migration"),
  makePost("3", "Three.js in App Router: avoiding GPU leaks"),
  makePost("4", "Cookie-based auth with HttpOnly tokens"),
];

const meta: Meta<typeof PostsList> = {
  title: "Blog/PostsList",
  component: PostsList,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ minHeight: "100vh", background: "#080810", padding: 48 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    onLoadMore: () => undefined,
    onRetry: () => undefined,
  },
};

export default meta;

type Story = StoryObj<typeof PostsList>;

export const Default: Story = {
  args: {
    items,
    isLoading: false,
    isLoadingMore: false,
    hasMore: true,
    error: null,
  },
};

export const Loading: Story = {
  args: {
    items: [],
    isLoading: true,
    isLoadingMore: false,
    hasMore: true,
    error: null,
  },
};

export const Empty: Story = {
  args: {
    items: [],
    isLoading: false,
    isLoadingMore: false,
    hasMore: false,
    error: null,
  },
};

export const ErrorState: Story = {
  args: {
    items: [],
    isLoading: false,
    isLoadingMore: false,
    hasMore: false,
    error: new Error("Network failed"),
  },
};

export const LoadingMore: Story = {
  args: {
    items,
    isLoading: false,
    isLoadingMore: true,
    hasMore: true,
    error: null,
  },
};

export const EndOfFeed: Story = {
  args: {
    items,
    isLoading: false,
    isLoadingMore: false,
    hasMore: false,
    error: null,
  },
};
