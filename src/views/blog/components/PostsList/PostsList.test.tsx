import { screen } from "@testing-library/react";
import { renderWithIntl } from "@/shared/testing/intl";
import type { Post } from "@/api/posts";
import { PostsList } from "./PostsList";

type ObserverInstance = {
  observe: jest.Mock;
  disconnect: jest.Mock;
  callback: IntersectionObserverCallback;
};

const observers: ObserverInstance[] = [];

class MockIntersectionObserver {
  observe: jest.Mock;
  disconnect: jest.Mock;
  callback: IntersectionObserverCallback;

  constructor(cb: IntersectionObserverCallback) {
    this.callback = cb;
    this.observe = jest.fn();
    this.disconnect = jest.fn();
    observers.push(this);
  }

  unobserve = jest.fn();
  takeRecords = jest.fn().mockReturnValue([]);
  root = null;
  rootMargin = "";
  thresholds: number[] = [];
}

const makePost = (id: string, title: string): Post => ({
  id,
  locale: "en",
  locales: ["en", "uk"],
  slug: id,
  title,
  description: `${title} description`,
  htmlContent: "<p>x</p>",
  imageUrl: "https://example.com/img.jpg",
  author: {
    id: "u",
    firstName: "John",
    lastName: "Doe",
    profileImageUrl: "",
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  coverAlt: null,
  categories: [{ id: "cat-1", name: "Frontend", slug: "frontend" }],
  publishedAt: "2026-02-10T08:00:00.000Z",
  seoTitle: null,
  seoDescription: null,
  ogImageUrl: null,
  canonicalUrl: null,
});

const baseProps = {
  items: [] as Post[],
  isLoading: false,
  isLoadingMore: false,
  hasMore: false,
  error: null as Error | null,
  onLoadMore: jest.fn(),
  onRetry: jest.fn(),
};

beforeAll(() => {
  (
    globalThis as unknown as {
      IntersectionObserver: typeof IntersectionObserver;
    }
  ).IntersectionObserver =
    MockIntersectionObserver as unknown as typeof IntersectionObserver;
});

beforeEach(() => {
  observers.length = 0;
  baseProps.onLoadMore.mockClear();
  baseProps.onRetry.mockClear();
});

describe("PostsList", () => {
  it("renders skeletons when initial load is in progress with no items", () => {
    const { container } = renderWithIntl(
      <PostsList {...baseProps} isLoading hasMore />,
    );
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it("renders empty state when not loading and no items", () => {
    renderWithIntl(<PostsList {...baseProps} />);
    expect(screen.getByText("No posts yet")).toBeInTheDocument();
  });

  it("renders error state with retry button when error and no items", () => {
    renderWithIntl(<PostsList {...baseProps} error={new Error("boom")} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    screen.getByRole("button", { name: /retry/i }).click();
    expect(baseProps.onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders post cards for items", () => {
    const items = [makePost("a", "First"), makePost("b", "Second")];
    renderWithIntl(<PostsList {...baseProps} items={items} />);
    expect(screen.getByRole("heading", { name: "First" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Second" })).toBeInTheDocument();
  });

  it("calls onLoadMore when sentinel intersects", () => {
    const items = [makePost("a", "First")];
    renderWithIntl(<PostsList {...baseProps} items={items} hasMore />);

    expect(observers).toHaveLength(1);
    const observer = observers[0];
    expect(observer.observe).toHaveBeenCalledTimes(1);

    observer.callback(
      [
        {
          isIntersecting: true,
          target: document.createElement("div"),
          intersectionRatio: 1,
          time: 0,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
        },
      ],
      observer as unknown as IntersectionObserver,
    );

    expect(baseProps.onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("shows end-of-feed when there are items and no more pages", () => {
    const items = [makePost("a", "Only")];
    renderWithIntl(<PostsList {...baseProps} items={items} hasMore={false} />);
    expect(screen.getByText(/end of feed/i)).toBeInTheDocument();
  });
});

describe("PostsList pagination links", () => {
  const items = [makePost("a", "First")];

  it("links to the older and newer feed pages in plain HTML", () => {
    renderWithIntl(
      <PostsList
        {...baseProps}
        items={items}
        hasMore
        pagination={{ newerHref: "/blog", olderHref: "/blog?page=3" }}
      />,
    );
    expect(screen.getByRole("link", { name: /older posts/i })).toHaveAttribute(
      "href",
      "/blog?page=3",
    );
    expect(screen.getByRole("link", { name: /newer posts/i })).toHaveAttribute(
      "href",
      "/blog",
    );
  });

  it("renders no navigation without page links", () => {
    renderWithIntl(
      <PostsList
        {...baseProps}
        items={items}
        pagination={{ newerHref: null, olderHref: null }}
      />,
    );
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
