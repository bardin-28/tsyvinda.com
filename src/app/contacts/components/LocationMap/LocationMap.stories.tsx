import type { Meta, StoryObj } from "@storybook/nextjs";
import LocationMap from "./LocationMap";

const meta: Meta<typeof LocationMap> = {
  title: "Contacts/LocationMap",
  component: LocationMap,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof LocationMap>;

/** Read-only Leaflet map centred on Kyiv with the city border outlined. */
export const Default: Story = {};
