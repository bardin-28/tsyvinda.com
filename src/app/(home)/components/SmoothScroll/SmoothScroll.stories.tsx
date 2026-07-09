import type { Meta, StoryObj } from "@storybook/nextjs";
import SmoothScroll from "./SmoothScroll";

const meta: Meta<typeof SmoothScroll> = {
  title: "Home/SmoothScroll",
  component: SmoothScroll,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Wraps the home page in a global Lenis instance for eased momentum scrolling. Honors prefers-reduced-motion by rendering children with native scrolling instead. `root` mode drives the window scroller, so code reading window.scrollY (e.g. the scroll-coupled oloid scene) keeps working.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof SmoothScroll>;

const TallContent = () => (
  <div style={{ background: "#080810", color: "#fff" }}>
    {Array.from({ length: 8 }).map((_, i) => (
      <section
        key={i}
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2rem",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Scroll section {i + 1}
      </section>
    ))}
  </div>
);

export const Default: Story = {
  render: () => (
    <SmoothScroll>
      <TallContent />
    </SmoothScroll>
  ),
};
