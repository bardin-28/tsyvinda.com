import { fireEvent, screen } from "@testing-library/react";
import { renderWithIntl } from "@/shared/testing/intl";
import type { Post } from "@/api/posts";
import { PostCard } from "./PostCard";

const basePost: Post = {
  id: "abc-123",
  locale: "en",
  locales: ["en", "uk"],
  slug: "abc-123",
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
  coverAlt: null,
  categories: [{ id: "cat-1", name: "Frontend", slug: "frontend" }],
  publishedAt: "2026-02-10T08:00:00.000Z",
  seoTitle: null,
  seoDescription: null,
  ogImageUrl: null,
  canonicalUrl: null,
};

describe("PostCard", () => {
  it("shows the main category and uses the cover's alt text", () => {
    renderWithIntl(
      <PostCard post={{ ...basePost, coverAlt: "A laptop on a desk" }} />,
    );
    expect(screen.getByText("Frontend")).toBeInTheDocument();
    expect(screen.getByAltText("A laptop on a desk")).toBeInTheDocument();
  });

  it("renders title, description, author and formatted date", () => {
    renderWithIntl(<PostCard post={basePost} />);

    expect(
      screen.getByRole("heading", {
        name: "Building production-grade Next.js apps",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Lessons from shipping React 19 + App Router to real users.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Vladyslav Tsyvinda")).toBeInTheDocument();

    const time = screen.getByRole("time");
    expect(time).toHaveAttribute("datetime", "2026-02-10T08:00:00.000Z");
    expect(time.textContent).toMatch(/Feb/);
  });

  it("links to the blog detail route", () => {
    renderWithIntl(<PostCard post={basePost} />);
    const link = screen.getByRole("link", { name: /Read article/i });
    expect(link).toHaveAttribute("href", "/blog/abc-123");
  });

  it("shows initials fallback when author has no profile image", () => {
    const post: Post = {
      ...basePost,
      author: { ...basePost.author, profileImageUrl: "" },
    };
    renderWithIntl(<PostCard post={post} />);
    expect(screen.getByText("VT")).toBeInTheDocument();
  });

  it("shows a no-image placeholder when imageUrl is empty", () => {
    const post: Post = { ...basePost, imageUrl: "" };
    renderWithIntl(<PostCard post={post} />);
    expect(screen.getByText("No image")).toBeInTheDocument();
  });

  it("shows the no-image placeholder when the cover fails to load", () => {
    renderWithIntl(<PostCard post={basePost} />);
    fireEvent.error(screen.getByRole("img", { name: basePost.title }));
    expect(screen.getByText("No image")).toBeInTheDocument();
  });
});
