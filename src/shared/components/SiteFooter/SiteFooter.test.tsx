import { screen } from "@testing-library/react";
import { renderWithIntl } from "@/shared/testing/intl";

import { usePathname } from "next/navigation";

import { SiteFooter } from "./SiteFooter";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

const usePathnameMock = usePathname as jest.MockedFunction<typeof usePathname>;

beforeEach(() => {
  jest.clearAllMocks();
  usePathnameMock.mockReturnValue("/");
});

describe("SiteFooter", () => {
  it("renders the page navigation links", () => {
    renderWithIntl(<SiteFooter />);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/about",
    );
    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute(
      "href",
      "/blog",
    );
  });

  it("renders social links with accessible labels", () => {
    renderWithIntl(<SiteFooter />);
    expect(screen.getByRole("link", { name: "LinkedIn" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Telegram" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Email" })).toBeInTheDocument();
  });

  it("renders the privacy policy link", () => {
    renderWithIntl(<SiteFooter />);
    expect(
      screen.getByRole("link", { name: "Privacy Policy" }),
    ).toHaveAttribute("href", "/privacy-policy");
  });

  it("renders the copyright with the current year and name", () => {
    renderWithIntl(<SiteFooter />);
    const year = new Date().getFullYear();
    expect(
      screen.getByText(
        `© 2023 - ${year} Vladyslav Tsyvinda. All rights reserved.`,
      ),
    ).toBeInTheDocument();
  });

  it("renders nothing on chrome-hidden routes", () => {
    usePathnameMock.mockReturnValue("/blog/cover");
    renderWithIntl(<SiteFooter />);
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
  });
});
