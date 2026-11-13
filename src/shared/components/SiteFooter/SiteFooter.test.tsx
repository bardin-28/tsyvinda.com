import { fireEvent, screen } from "@testing-library/react";
import { renderWithIntl } from "@/shared/testing/intl";

import { usePathname } from "next/navigation";

import { ConsentProvider, CookiePreferences } from "@/shared/consent";
import { ignorePseudoElementStyles } from "@/shared/consent/testing";

import { SiteFooter } from "./SiteFooter";

function renderFooter() {
  return renderWithIntl(
    <ConsentProvider>
      <SiteFooter />
      <CookiePreferences />
    </ConsentProvider>,
  );
}

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

ignorePseudoElementStyles();

describe("SiteFooter", () => {
  it("renders the page navigation links", () => {
    renderFooter();
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
    renderFooter();
    expect(screen.getByRole("link", { name: "LinkedIn" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Telegram" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Email" })).toBeInTheDocument();
  });

  it("renders the privacy policy link", () => {
    renderFooter();
    expect(
      screen.getByRole("link", { name: "Privacy Policy" }),
    ).toHaveAttribute("href", "/privacy-policy");
    expect(screen.getByRole("link", { name: "Cookie Policy" })).toHaveAttribute(
      "href",
      "/cookie-policy",
    );
  });

  it("reopens the cookie preference center from the legal row", async () => {
    renderFooter();
    fireEvent.click(screen.getByRole("button", { name: "Cookie settings" }));
    expect(
      await screen.findByRole("dialog", { name: "Your cookie options" }),
    ).toBeInTheDocument();
  });

  it("renders the copyright with the current year and name", () => {
    renderFooter();
    const year = new Date().getFullYear();
    expect(
      screen.getByText(
        `© 2023 - ${year} Vladyslav Tsyvinda. All rights reserved.`,
      ),
    ).toBeInTheDocument();
  });

  it("renders nothing on chrome-hidden routes", () => {
    usePathnameMock.mockReturnValue("/blog/cover");
    renderFooter();
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
  });
});
