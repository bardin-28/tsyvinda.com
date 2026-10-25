import { fireEvent, render, screen } from "@testing-library/react";
import { PostCoverImage } from "./PostCoverImage";

const SIZES = "100vw";

describe("PostCoverImage", () => {
  it("renders the cover image when a src is given", () => {
    render(<PostCoverImage src="https://example.com/cover.jpg" alt="Cover" sizes={SIZES} />);
    expect(screen.getByRole("img", { name: "Cover" })).toBeInTheDocument();
    expect(screen.queryByText("No image")).not.toBeInTheDocument();
  });

  it.each([null, undefined, ""])("shows the placeholder when src is %p", (src) => {
    render(<PostCoverImage src={src} alt="Cover" sizes={SIZES} />);
    expect(screen.getByText("No image")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Cover (no cover image)" })).toBeInTheDocument();
  });

  it("swaps to the placeholder when the image fails to load", () => {
    render(<PostCoverImage src="https://example.com/broken.jpg" alt="Cover" sizes={SIZES} />);

    fireEvent.error(screen.getByRole("img", { name: "Cover" }));

    expect(screen.getByText("No image")).toBeInTheDocument();
  });

  it("retries when the src changes after a failure", () => {
    const { rerender } = render(
      <PostCoverImage src="https://example.com/broken.jpg" alt="Cover" sizes={SIZES} />,
    );
    fireEvent.error(screen.getByRole("img", { name: "Cover" }));

    rerender(<PostCoverImage src="https://example.com/fixed.jpg" alt="Cover" sizes={SIZES} />);

    expect(screen.getByRole("img", { name: "Cover" })).toBeInTheDocument();
    expect(screen.queryByText("No image")).not.toBeInTheDocument();
  });
});
