import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LOCALE_STORAGE_KEY } from "@/i18n/locales";
import { renderWithIntl } from "@/shared/testing/intl";

import { LanguageSwitcher } from "./LanguageSwitcher";

const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

beforeEach(() => {
  pushMock.mockReset();
  window.localStorage.clear();
  document.head.innerHTML = "";
});

describe("LanguageSwitcher", () => {
  it("shows the current language and lists both languages", async () => {
    renderWithIntl(<LanguageSwitcher />);
    await userEvent.click(
      screen.getByRole("button", { name: "Language: English" }),
    );
    expect(screen.getByRole("option", { name: /English/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByRole("option", { name: /Українська/ }),
    ).toBeInTheDocument();
  });

  it("saves the choice and opens the same page in Ukrainian", async () => {
    const link = document.createElement("link");
    link.rel = "alternate";
    link.hreflang = "uk";
    link.href = "https://tsyvinda.com/uk/about";
    document.head.appendChild(link);

    renderWithIntl(<LanguageSwitcher />);
    await userEvent.click(
      screen.getByRole("button", { name: "Language: English" }),
    );
    await userEvent.click(screen.getByRole("option", { name: /Українська/ }));

    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("uk");
    expect(pushMock).toHaveBeenCalledWith("/uk/about");
  });

  it("labels itself in Ukrainian on Ukrainian pages", () => {
    renderWithIntl(<LanguageSwitcher />, { locale: "uk" });
    expect(
      screen.getByRole("button", { name: "Мова: Українська" }),
    ).toHaveTextContent("UA");
  });
});
