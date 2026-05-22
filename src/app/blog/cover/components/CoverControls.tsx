"use client";

import {
  Button,
  ColorPicker,
  Input,
  Segmented,
  Slider,
  Space,
  Switch,
} from "antd";
import type { Color } from "antd/es/color-picker";
import {
  COVER_SIZES,
  type CoverAlignment,
  type CoverSizePreset,
  type CoverState,
} from "../const";
import styles from "./CoverControls.module.css";

type CoverControlsProps = {
  state: CoverState;
  onChange: <K extends keyof CoverState>(key: K, value: CoverState[K]) => void;
  onReset: () => void;
  onDownload: () => void;
  isDownloading: boolean;
};

const SIZE_OPTIONS = COVER_SIZES.map((s) => ({ label: s.label, value: s.id }));
const ALIGN_OPTIONS: { label: string; value: CoverAlignment }[] = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
];

export function CoverControls({
  state,
  onChange,
  onReset,
  onDownload,
  isDownloading,
}: CoverControlsProps) {
  return (
    <div className={styles.panel}>
      <header className={styles.header}>
        <h2 className={styles.heading}>Cover generator</h2>
        <p className={styles.lede}>
          Compose a branded cover with the blog scene. Adjust text and styling,
          then download as JPEG.
        </p>
      </header>

      <section className={styles.group}>
        <h3 className={styles.groupTitle}>Text</h3>

        <div className={styles.field}>
          <div className={styles.fieldHead}>
            <label className={styles.label} htmlFor="cover-eyebrow">
              Eyebrow
            </label>
            <Switch
              size="small"
              checked={state.showEyebrow}
              onChange={(checked) => onChange("showEyebrow", checked)}
            />
          </div>
          <Input
            id="cover-eyebrow"
            value={state.eyebrow}
            disabled={!state.showEyebrow}
            onChange={(e) => onChange("eyebrow", e.target.value)}
            placeholder="Blog"
            maxLength={32}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="cover-title">
            Title
          </label>
          <Input.TextArea
            id="cover-title"
            value={state.title}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="Notes on building software"
            autoSize={{ minRows: 2, maxRows: 4 }}
            maxLength={140}
          />
        </div>

        <div className={styles.field}>
          <div className={styles.fieldHead}>
            <label className={styles.label} htmlFor="cover-subtitle">
              Subtitle
            </label>
            <Switch
              size="small"
              checked={state.showSubtitle}
              onChange={(checked) => onChange("showSubtitle", checked)}
            />
          </div>
          <Input.TextArea
            id="cover-subtitle"
            value={state.subtitle}
            disabled={!state.showSubtitle}
            onChange={(e) => onChange("subtitle", e.target.value)}
            placeholder="Frontend engineering, React, Next.js."
            autoSize={{ minRows: 2, maxRows: 4 }}
            maxLength={220}
          />
        </div>
      </section>

      <section className={styles.group}>
        <h3 className={styles.groupTitle}>Layout</h3>

        <div className={styles.field}>
          <span className={styles.label}>Output size</span>
          <Segmented
            block
            options={SIZE_OPTIONS}
            value={state.sizeId}
            onChange={(val) =>
              onChange("sizeId", val as CoverSizePreset["id"])
            }
          />
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Alignment</span>
          <Segmented
            block
            options={ALIGN_OPTIONS}
            value={state.alignment}
            onChange={(val) => onChange("alignment", val as CoverAlignment)}
          />
        </div>

        <div className={styles.field}>
          <span className={styles.label}>
            Title size <span className={styles.muted}>{state.titleScale.toFixed(2)}×</span>
          </span>
          <Slider
            min={0.6}
            max={1.5}
            step={0.05}
            value={state.titleScale}
            onChange={(val) => onChange("titleScale", val as number)}
          />
        </div>
      </section>

      <section className={styles.group}>
        <h3 className={styles.groupTitle}>Style</h3>

        <div className={styles.fieldRow}>
          <span className={styles.label}>Accent color</span>
          <ColorPicker
            value={state.accentColor}
            disabledAlpha
            onChange={(color: Color) =>
              onChange("accentColor", color.toHexString())
            }
            presets={[
              {
                label: "Brand",
                colors: ["#fd7e14", "#ec4899", "#ffe066", "#6366f1", "#22c55e", "#ffffff"],
              },
            ]}
          />
        </div>

        <div className={styles.fieldRow}>
          <span className={styles.label}>Vignette</span>
          <Switch
            checked={state.vignette}
            onChange={(checked) => onChange("vignette", checked)}
          />
        </div>
      </section>

      <footer className={styles.actions}>
        <Space size={12}>
          <Button onClick={onReset}>Reset</Button>
          <Button type="primary" loading={isDownloading} onClick={onDownload}>
            Download JPEG
          </Button>
        </Space>
      </footer>
    </div>
  );
}
