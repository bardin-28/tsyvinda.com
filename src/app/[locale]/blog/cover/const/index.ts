export type CoverSizePreset = {
  id: "og" | "wide";
  label: string;
  width: number;
  height: number;
};

export const COVER_SIZES: CoverSizePreset[] = [
  { id: "og", label: "OG 1200×630", width: 1200, height: 630 },
  { id: "wide", label: "16:9 1920×1080", width: 1920, height: 1080 },
];

export type CoverAlignment = "left" | "center" | "right";

export type CoverState = {
  eyebrow: string;
  title: string;
  subtitle: string;
  sizeId: CoverSizePreset["id"];
  alignment: CoverAlignment;
  titleScale: number;
  accentColor: string;
  vignette: boolean;
  showEyebrow: boolean;
  showSubtitle: boolean;
};

export const DEFAULT_COVER: CoverState = {
  eyebrow: "Blog",
  title: "Notes on building software",
  subtitle:
    "Frontend engineering, React, Next.js, TypeScript, and product delivery.",
  sizeId: "og",
  alignment: "left",
  titleScale: 1,
  accentColor: "#fd7e14",
  vignette: true,
  showEyebrow: true,
  showSubtitle: true,
};

export const SCENE_BG_COLOR = "#080810";

export function getSizePreset(id: CoverSizePreset["id"]): CoverSizePreset {
  return COVER_SIZES.find((s) => s.id === id) ?? COVER_SIZES[0];
}
