import { render, screen } from "@testing-library/react";
import { Logo } from "./Logo";

describe("Logo", () => {
  it("exposes an accessible name when a title is provided", () => {
    render(<Logo title="Vladyslav Tsyvinda" />);
    expect(screen.getByRole("img", { name: "Vladyslav Tsyvinda" })).toBeInTheDocument();
  });

  it("is decorative (hidden from a11y tree) without a title", () => {
    const { container } = render(<Logo />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
