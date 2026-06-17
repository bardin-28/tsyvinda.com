import { render, screen } from "@testing-library/react";
import { useReducedMotion } from "framer-motion";
import SmoothScroll from "./SmoothScroll";

jest.mock("framer-motion", () => ({
  useReducedMotion: jest.fn(),
}));

// Stand-in for the real Lenis provider so the test stays in jsdom: it simply
// renders its children inside a tagged wrapper we can assert against.
jest.mock("lenis/react", () => ({
  ReactLenis: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="lenis-root">{children}</div>
  ),
}));

// The CSS side-effect import has no behaviour to test; stub it out.
jest.mock("lenis/dist/lenis.css", () => ({}), { virtual: true });

const mockUseReducedMotion = useReducedMotion as jest.MockedFunction<
  typeof useReducedMotion
>;

describe("SmoothScroll", () => {
  afterEach(() => {
    mockUseReducedMotion.mockReset();
  });

  it("wraps children in the Lenis provider when motion is allowed", () => {
    mockUseReducedMotion.mockReturnValue(false);

    render(
      <SmoothScroll>
        <p>content</p>
      </SmoothScroll>,
    );

    expect(screen.getByTestId("lenis-root")).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("renders children without Lenis when reduced motion is requested", () => {
    mockUseReducedMotion.mockReturnValue(true);

    render(
      <SmoothScroll>
        <p>content</p>
      </SmoothScroll>,
    );

    expect(screen.queryByTestId("lenis-root")).not.toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });
});
