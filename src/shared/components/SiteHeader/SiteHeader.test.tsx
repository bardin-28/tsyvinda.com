import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { usePathname } from "next/navigation";
import { useUser } from "@/shared/contexts/UserContext";

import { SiteHeader } from "./SiteHeader";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("@/shared/contexts/UserContext", () => ({
  useUser: jest.fn(),
}));

const usePathnameMock = usePathname as jest.MockedFunction<typeof usePathname>;
const useUserMock = useUser as jest.MockedFunction<typeof useUser>;

const logoutMock = jest.fn();

function mockUser(user: { firstName: string } | null) {
  useUserMock.mockReturnValue({
    user: user as never,
    loading: false,
    error: null,
    refetch: jest.fn(),
    setUser: jest.fn(),
    logout: logoutMock,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  usePathnameMock.mockReturnValue("/");
  mockUser(null);
});

describe("SiteHeader", () => {
  it("renders the menu trigger collapsed by default", () => {
    render(<SiteHeader />);
    const trigger = screen.getByRole("button", { name: /toggle navigation menu/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens the dropdown with all page links on click", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(screen.getByRole("button", { name: /toggle navigation menu/i }));

    expect(screen.getByRole("button", { name: /toggle navigation menu/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    const menu = screen.getByRole("menu");
    expect(menu).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("menuitem", { name: "About" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("menuitem", { name: "Blog" })).toHaveAttribute("href", "/blog");
  });

  it("marks the active route with aria-current", async () => {
    usePathnameMock.mockReturnValue("/about");
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(screen.getByRole("button", { name: /toggle navigation menu/i }));

    expect(screen.getByRole("menuitem", { name: "About" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("menuitem", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("shows a Sign in link when logged out", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(screen.getByRole("button", { name: /toggle navigation menu/i }));

    expect(screen.getByRole("menuitem", { name: /sign in/i })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.queryByRole("menuitem", { name: /log out/i })).not.toBeInTheDocument();
  });

  it("shows Log out and calls logout when logged in", async () => {
    mockUser({ firstName: "Vladyslav" });
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(screen.getByRole("button", { name: /toggle navigation menu/i }));
    await user.click(screen.getByRole("menuitem", { name: /log out/i }));

    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  it("shows a Profile link in the menu when logged in", async () => {
    mockUser({ firstName: "Vladyslav" });
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(screen.getByRole("button", { name: /toggle navigation menu/i }));

    expect(screen.getByRole("menuitem", { name: "Profile" })).toHaveAttribute(
      "href",
      "/profile",
    );
  });

  it("hides the Profile link when logged out", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(screen.getByRole("button", { name: /toggle navigation menu/i }));

    expect(screen.queryByRole("menuitem", { name: "Profile" })).not.toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(screen.getByRole("button", { name: /toggle navigation menu/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
  });

  it("renders nothing on chrome-hidden routes", () => {
    usePathnameMock.mockReturnValue("/blog/cover");
    render(<SiteHeader />);
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /toggle navigation menu/i })).not.toBeInTheDocument();
  });
});
