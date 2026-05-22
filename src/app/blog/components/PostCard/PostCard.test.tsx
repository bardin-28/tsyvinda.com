import { render, screen } from "@testing-library/react";
import type { Post } from "@/api/posts";
import { PostCard } from "./PostCard";

const basePost: Post = {
  id: "abc-123",
  title: "Building production-grade Next.js apps",
  description: "Lessons from shipping React 19 + App Router to real users.",
  htmlContent: "<p>body</p>",
  imageUrl: "https://example.com/cover.jpg",
  author: {
    id: "author-1",
    firstName: "Vladyslav",
    lastName: "Tsyvinda",
    profileImageUrl: "https://example.com/avatar.jpg",
  },
  createdAt: "2026-02-10T08:00:00.000Z",
  updatedAt: "2026-02-10T08:00:00.000Z",
};

describe("PostCard", () => {
  it("renders title, description, author and formatted date", () => {
    render(<PostCard post={basePost} />);

    expect(
      screen.getByRole("heading", {
        name: "Building production-grade Next.js apps",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Lessons from shipping React 19 + App Router to real users."),
    ).toBeInTheDocument();
    expect(screen.getByText("Vladyslav Tsyvinda")).toBeInTheDocument();

    const time = screen.getByRole("time");
    expect(time).toHaveAttribute("datetime", "2026-02-10T08:00:00.000Z");
    expect(time.textContent).toMatch(/Feb/);
  });

  it("links to the blog detail route", () => {
    render(<PostCard post={basePost} />);
    const link = screen.getByRole("link", { name: /Read article/i });
    expect(link).toHaveAttribute("href", "/blog/abc-123");
  });

  it("shows initials fallback when author has no profile image", () => {
    const post: Post = {
      ...basePost,
      author: { ...basePost.author, profileImageUrl: "" },
    };
    render(<PostCard post={post} />);
    expect(screen.getByText("VT")).toBeInTheDocument();
  });

  it("shows a no-image placeholder when imageUrl is empty", () => {
    const post: Post = { ...basePost, imageUrl: "" };
    render(<PostCard post={post} />);
    expect(screen.getByText("No image")).toBeInTheDocument();
  });
});
