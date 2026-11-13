import { render } from "@testing-library/react";

import { Markup } from "./Markup";

describe("Markup", () => {
  it("renders accent, strong and line breaks", () => {
    const { container } = render(
      <p>
        <Markup
          text="Hi <accent>there</accent>,<br></br><strong>bold</strong>!"
          accentClassName="accent"
        />
      </p>,
    );
    expect(container.innerHTML).toBe(
      '<p>Hi <span class="accent">there</span>,<br><strong>bold</strong>!</p>',
    );
  });

  it("shows any other markup as plain text", () => {
    const { container } = render(
      <Markup text={'<img src=x onerror="alert(1)"> <a href="#">x</a>'} />,
    );
    expect(container.querySelector("img, a")).toBeNull();
    expect(container.textContent).toBe(
      '<img src=x onerror="alert(1)"> <a href="#">x</a>',
    );
  });
});
