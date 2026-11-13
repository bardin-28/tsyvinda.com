import { fireEvent, screen } from "@testing-library/react";
import { renderWithIntl } from "@/shared/testing/intl";
import { CategoryFilter } from "./CategoryFilter";

const categories = [
  { id: "c1", name: "Frontend", slug: "frontend" },
  { id: "c2", name: "Security", slug: "security" },
];

describe("CategoryFilter", () => {
  it("renders nothing without categories", () => {
    const { container } = renderWithIntl(
      <CategoryFilter categories={[]} selected={null} onSelect={jest.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("marks the selected chip and reports clicks", () => {
    const onSelect = jest.fn();
    renderWithIntl(
      <CategoryFilter
        categories={categories}
        selected="security"
        onSelect={onSelect}
      />,
    );

    expect(screen.getByRole("button", { name: "Security" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    fireEvent.click(screen.getByRole("button", { name: "Frontend" }));
    expect(onSelect).toHaveBeenCalledWith("frontend");
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(onSelect).toHaveBeenCalledWith(null);
  });
});
