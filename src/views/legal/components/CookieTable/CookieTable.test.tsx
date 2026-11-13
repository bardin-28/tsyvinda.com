import { screen, within } from "@testing-library/react";

import { renderWithIntl } from "@/shared/testing/intl";

import { COOKIE_ROWS } from "../../const";
import { CookieTable } from "./CookieTable";

describe("CookieTable", () => {
  it("lists every cookie with provider, purpose, duration and category", () => {
    renderWithIntl(<CookieTable />);

    const rows = screen.getAllByRole("row").slice(1);
    expect(rows).toHaveLength(COOKIE_ROWS.length);

    const consentRow = screen
      .getByRole("rowheader", { name: "cookie_consent" })
      .closest("tr") as HTMLElement;
    expect(within(consentRow).getByText("tsyvinda.com")).toBeInTheDocument();
    expect(within(consentRow).getByText("6 months")).toBeInTheDocument();
    expect(
      within(consentRow).getByText("Strictly necessary"),
    ).toBeInTheDocument();

    const gaRow = screen
      .getByRole("rowheader", { name: "_ga" })
      .closest("tr") as HTMLElement;
    expect(within(gaRow).getByText("Google")).toBeInTheDocument();
    expect(within(gaRow).getByText("Analytics")).toBeInTheDocument();
  });

  it("lists the language memory as strictly necessary", () => {
    renderWithIntl(<CookieTable />);
    const localeRow = screen
      .getByRole("rowheader", { name: "locale (localStorage)" })
      .closest("tr") as HTMLElement;
    expect(
      within(localeRow).getByText("Strictly necessary"),
    ).toBeInTheDocument();
  });

  it("renders in Ukrainian", () => {
    renderWithIntl(<CookieTable />, { locale: "uk" });
    expect(
      screen.getByRole("columnheader", { name: "Постачальник" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Аналітичні")).toHaveLength(2);
  });
});
