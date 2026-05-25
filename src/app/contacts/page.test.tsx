import { render, screen } from "@testing-library/react";
import { SOCIAL_NAV } from "@/shared/const";
import ContactsPage from "./page";

describe("ContactsPage", () => {
  it("renders the hero heading", () => {
    render(<ContactsPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /work together/i,
    );
  });

  it("renders every contact channel with its href and handle", () => {
    render(<ContactsPage />);

    for (const item of SOCIAL_NAV) {
      const link = screen.getByRole("link", {
        name: `${item.label}: ${item.handle}`,
      });
      expect(link).toHaveAttribute("href", item.href);
      expect(link).toHaveTextContent(item.label);
      expect(link).toHaveTextContent(item.handle);
    }
  });

  it("opens external channels in a new tab but not mailto links", () => {
    render(<ContactsPage />);

    const linkedin = screen.getByRole("link", { name: /^LinkedIn:/ });
    expect(linkedin).toHaveAttribute("target", "_blank");
    expect(linkedin).toHaveAttribute("rel", "noopener noreferrer");

    const email = screen.getByRole("link", { name: /^Email:/ });
    expect(email).not.toHaveAttribute("target");
  });
});
