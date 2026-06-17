import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vladyslav Tsyvinda",
    short_name: "Tsyvinda",
    description:
      "Personal website of Vladyslav Tsyvinda — get in touch via LinkedIn or Telegram.",
    start_url: "/",
    display: "standalone",
    background_color: "#080810",
    theme_color: "#fd7e14",
    icons: [
      {
        src: "/favicon/favicon_32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/favicon/favicon_64.png",
        sizes: "64x64",
        type: "image/png",
      },
      {
        src: "/favicon/favicon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
