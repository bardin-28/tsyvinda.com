import { render, screen } from "@testing-library/react";

import { usePathname } from "next/navigation";

import { SiteFooter } from "./SiteFooter";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

const usePathnameMock = usePathname as jest.MockedFunction<typeof usePathname>;

beforeEach(() => {
  jest.clearAllMocks();
  usePathnameMock.mockReturnValue("/");
});

describe("SiteFooter", () => {
  it("renders the page navigation links", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog");
  });

  it("renders social links with accessible labels", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("link", { name: "LinkedIn" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Telegram" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Email" })).toBeInTheDocument();
  });

  it("renders the copyright with the current year and name", () => {
    render(<SiteFooter />);
    const year = new Date().getFullYear();
    expect(
      screen.getByText(`© ${year} Vladyslav Tsyvinda`),
    ).toBeInTheDocument();
  });

  it("renders nothing on chrome-hidden routes", () => {
    usePathnameMock.mockReturnValue("/blog/cover");
    render(<SiteFooter />);
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
  });
});
