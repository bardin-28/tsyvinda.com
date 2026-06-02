"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import * as THREE from "three";
import {
  type CoverState,
  SCENE_BG_COLOR,
  getSizePreset,
} from "../const";
import styles from "./CoverComposer.module.css";

export type CoverComposerHandle = {
  download: (filename: string) => Promise<void>;
};

type CoverComposerProps = {
  state: CoverState;
};

const FONT_STACK_FALLBACK = "system-ui, -apple-system, Segoe UI, Roboto, sans-serif";

function probeFontFamily(): string {
  if (typeof document === "undefined") return FONT_STACK_FALLBACK;
  const probe = document.createElement("span");
  probe.style.fontFamily = "var(--font-roboto), system-ui, sans-serif";
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  document.body.appendChild(probe);
  const family = getComputedStyle(probe).fontFamily || FONT_STACK_FALLBACK;
  document.body.removeChild(probe);
  return family;
}

type WrappedLine = { text: string; width: number };

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): WrappedLine[] {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: WrappedLine[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    const w = ctx.measureText(candidate).width;
    if (w > maxWidth && current) {
      lines.push({ text: current, width: ctx.measureText(current).width });
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) {
    lines.push({ text: current, width: ctx.measureText(current).width });
  }
  return lines;
}

type SceneContext = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  clock: THREE.Clock;
  group: THREE.Group;
  knot: THREE.Mesh;
  shell: THREE.Mesh;
  halo1: THREE.Mesh;
  halo2: THREE.Mesh;
  particles: THREE.Points;
  orbitLights: {
    light: THREE.PointLight;
    r: number;
    speed: number;
    ySpeed: number;
    phase: number;
  }[];
  disposables: (THREE.BufferGeometry | THREE.Material)[];
};

function createScene(width: number, height: number): SceneContext {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
  camera.position.z = 7;

  const group = new THREE.Group();
  scene.add(group);

  const knotGeom = new THREE.TorusKnotGeometry(1.0, 0.32, 220, 32, 2, 3);
  const knotMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xfd7e14),
    metalness: 0.85,
    roughness: 0.12,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    transparent: true,
    opacity: 0.88,
    envMapIntensity: 1.8,
  });
  const knot = new THREE.Mesh(knotGeom, knotMat);
  group.add(knot);

  const shellGeom = new THREE.TorusKnotGeometry(1.05, 0.42, 160, 20, 2, 3);
  const shellMat = new THREE.MeshBasicMaterial({
    color: 0xfd7e14,
    wireframe: true,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
  });
  const shell = new THREE.Mesh(shellGeom, shellMat);
  knot.add(shell);

  const haloGeom = new THREE.TorusGeometry(2.6, 0.008, 6, 256);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xffa94d,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const halo1 = new THREE.Mesh(haloGeom, haloMat);
  halo1.rotation.x = Math.PI / 2.6;
  const halo2 = new THREE.Mesh(haloGeom, haloMat);
  halo2.rotation.x = Math.PI / 1.7;
  halo2.rotation.y = Math.PI / 3.5;
  group.add(halo1, halo2);

  const PARTICLE_COUNT = 700;
  const pPos = new Float32Array(PARTICLE_COUNT * 3);
  const pColors = new Float32Array(PARTICLE_COUNT * 3);
  const palette = [
    new THREE.Color(0xfd7e14),
    new THREE.Color(0xffa94d),
    new THREE.Color(0xff922b),
    new THREE.Color(0xffe066),
    new THREE.Color(0xec4899),
  ];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const r = 3.2 + Math.random() * 4.2;
    pPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pPos[i * 3 + 2] = r * Math.cos(phi);
    const c = palette[Math.floor(Math.random() * palette.length)];
    pColors[i * 3] = c.r;
    pColors[i * 3 + 1] = c.g;
    pColors[i * 3 + 2] = c.b;
  }
  const pGeom = new THREE.BufferGeometry();
  pGeom.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  pGeom.setAttribute("color", new THREE.BufferAttribute(pColors, 3));
  const pMat = new THREE.PointsMaterial({
    size: 0.032,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
    vertexColors: true,
    depthWrite: false,
  });
  const particles = new THREE.Points(pGeom, pMat);
  group.add(particles);

  scene.add(new THREE.AmbientLight(0x1a0a00, 4));
  const orbitLights = [
    { color: 0xfd7e14, intensity: 110, r: 3.6, speed: 0.45, ySpeed: 0.3, phase: 0 },
    { color: 0xffa94d, intensity: 90, r: 3.0, speed: -0.35, ySpeed: 0.4, phase: Math.PI },
    { color: 0xff922b, intensity: 70, r: 3.4, speed: 0.4, ySpeed: 0.22, phase: Math.PI / 2 },
    { color: 0xffe066, intensity: 55, r: 2.6, speed: -0.55, ySpeed: 0.48, phase: Math.PI * 1.5 },
  ].map(({ color, intensity, r, speed, ySpeed, phase }) => {
    const light = new THREE.PointLight(color, intensity, 14);
    scene.add(light);
    return { light, r, speed, ySpeed, phase };
  });

  return {
    renderer,
    scene,
    camera,
    clock: new THREE.Clock(),
    group,
    knot,
    shell,
    halo1,
    halo2,
    particles,
    orbitLights,
    disposables: [knotGeom, shellGeom, haloGeom, pGeom, knotMat, shellMat, haloMat, pMat],
  };
}

function disposeScene(ctx: SceneContext) {
  ctx.disposables.forEach((d) => d.dispose());
  ctx.renderer.dispose();
}

function tickScene(ctx: SceneContext) {
  const t = ctx.clock.getElapsedTime();
  ctx.group.rotation.y = t * 0.18;
  ctx.group.rotation.x = Math.sin(t * 0.15) * 0.08;
  ctx.knot.rotation.x = t * 0.32;
  ctx.knot.rotation.y = t * 0.4;
  ctx.halo1.rotation.z = t * 0.2;
  ctx.halo2.rotation.z = -t * 0.16;
  ctx.particles.rotation.y = t * 0.025;

  ctx.orbitLights.forEach(({ light, r, speed, ySpeed, phase }) => {
    light.position.x = Math.cos(t * speed + phase) * r;
    light.position.y = Math.sin(t * ySpeed) * 2.0;
    light.position.z = Math.sin(t * speed + phase) * r;
  });

  ctx.renderer.render(ctx.scene, ctx.camera);
}

function paintFrame(
  outputCtx: CanvasRenderingContext2D,
  threeCanvas: HTMLCanvasElement,
  state: CoverState,
  fontFamily: string,
  width: number,
  height: number,
) {
  outputCtx.fillStyle = SCENE_BG_COLOR;
  outputCtx.fillRect(0, 0, width, height);
  outputCtx.drawImage(threeCanvas, 0, 0, width, height);

  if (state.vignette) {
    const g = outputCtx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.max(width, height) / 1.35,
    );
    g.addColorStop(0, "rgba(8, 8, 16, 0.0)");
    g.addColorStop(1, "rgba(8, 8, 16, 0.78)");
    outputCtx.fillStyle = g;
    outputCtx.fillRect(0, 0, width, height);
  }

  const padding = Math.round(width * 0.06);
  const innerWidth = width - padding * 2;
  const alignment = state.alignment;
  let anchorX: number;
  let textAlign: CanvasTextAlign;
  if (alignment === "center") {
    anchorX = width / 2;
    textAlign = "center";
  } else if (alignment === "right") {
    anchorX = width - padding;
    textAlign = "right";
  } else {
    anchorX = padding;
    textAlign = "left";
  }

  const titleBaseSize = Math.round(height * 0.13);
  const titleSize = Math.round(titleBaseSize * state.titleScale);
  const subtitleSize = Math.round(titleSize * 0.36);
  const eyebrowSize = Math.round(titleSize * 0.22);

  outputCtx.textBaseline = "alphabetic";
  outputCtx.textAlign = textAlign;

  const blocks: { lines: WrappedLine[]; size: number; gap: number; color: string; weight: number; letterSpacing: number; isEyebrow?: boolean }[] = [];

  if (state.showEyebrow && state.eyebrow.trim()) {
    outputCtx.font = `600 ${eyebrowSize}px ${fontFamily}`;
    blocks.push({
      lines: [{ text: state.eyebrow.toUpperCase(), width: outputCtx.measureText(state.eyebrow.toUpperCase()).width }],
      size: eyebrowSize,
      gap: Math.round(eyebrowSize * 1.1),
      color: state.accentColor,
      weight: 600,
      letterSpacing: 0.16,
      isEyebrow: true,
    });
  }

  outputCtx.font = `700 ${titleSize}px ${fontFamily}`;
  const titleLines = wrapText(outputCtx, state.title, innerWidth);
  if (titleLines.length > 0) {
    blocks.push({
      lines: titleLines,
      size: titleSize,
      gap: Math.round(titleSize * 1.08),
      color: "#ffffff",
      weight: 700,
      letterSpacing: -0.01,
    });
  }

  if (state.showSubtitle && state.subtitle.trim()) {
    outputCtx.font = `500 ${subtitleSize}px ${fontFamily}`;
    const subLines = wrapText(outputCtx, state.subtitle, innerWidth);
    if (subLines.length > 0) {
      blocks.push({
        lines: subLines,
        size: subtitleSize,
        gap: Math.round(subtitleSize * 1.4),
        color: "rgba(255,255,255,0.78)",
        weight: 500,
        letterSpacing: 0,
      });
    }
  }

  let totalHeight = 0;
  blocks.forEach((b, i) => {
    totalHeight += b.lines.length * b.gap;
    if (i < blocks.length - 1) totalHeight += Math.round(b.size * 0.55);
  });

  let y = Math.round((height - totalHeight) / 2 + (blocks[0]?.size ?? 0) * 0.85);

  blocks.forEach((block, idx) => {
    outputCtx.fillStyle = block.color;
    outputCtx.font = `${block.weight} ${block.size}px ${fontFamily}`;

    if (block.isEyebrow) {
      const text = block.lines[0].text;
      const textWidth = outputCtx.measureText(text).width;
      const pillPaddingX = Math.round(block.size * 0.7);
      const pillPaddingY = Math.round(block.size * 0.35);
      const pillHeight = block.size + pillPaddingY * 2;
      const pillWidth = textWidth + pillPaddingX * 2;

      let pillX: number;
      if (textAlign === "center") pillX = anchorX - pillWidth / 2;
      else if (textAlign === "right") pillX = anchorX - pillWidth;
      else pillX = anchorX;

      const pillY = y - block.size - pillPaddingY * 0.6;
      const radius = pillHeight / 2;

      outputCtx.beginPath();
      outputCtx.moveTo(pillX + radius, pillY);
      outputCtx.lineTo(pillX + pillWidth - radius, pillY);
      outputCtx.arc(pillX + pillWidth - radius, pillY + radius, radius, -Math.PI / 2, Math.PI / 2);
      outputCtx.lineTo(pillX + radius, pillY + pillHeight);
      outputCtx.arc(pillX + radius, pillY + radius, radius, Math.PI / 2, -Math.PI / 2);
      outputCtx.closePath();
      outputCtx.fillStyle = `${block.color}22`;
      outputCtx.fill();
      outputCtx.strokeStyle = `${block.color}66`;
      outputCtx.lineWidth = Math.max(1, block.size * 0.06);
      outputCtx.stroke();

      outputCtx.fillStyle = block.color;
      let textX: number;
      if (textAlign === "center") textX = anchorX;
      else if (textAlign === "right") textX = pillX + pillWidth - pillPaddingX;
      else textX = pillX + pillPaddingX;
      outputCtx.textAlign = textAlign === "center" ? "center" : textAlign === "right" ? "right" : "left";
      outputCtx.fillText(text, textX, y);
    } else {
      block.lines.forEach((line) => {
        outputCtx.fillText(line.text, anchorX, y);
        y += block.gap;
      });
      y -= block.gap;
    }

    if (idx < blocks.length - 1) {
      y += block.gap + Math.round(block.size * 0.55);
    }
  });
}

export const CoverComposer = forwardRef<CoverComposerHandle, CoverComposerProps>(
  function CoverComposer({ state }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const stateRef = useRef(state);
    const fontFamilyRef = useRef<string>(FONT_STACK_FALLBACK);
    const sceneRef = useRef<SceneContext | null>(null);

    useEffect(() => {
      stateRef.current = state;
    }, [state]);

    const size = useMemo(() => getSizePreset(state.sizeId), [state.sizeId]);

    useEffect(() => {
      const outputCanvas = canvasRef.current;
      if (!outputCanvas) return;
      const { width, height } = size;
      outputCanvas.width = width;
      outputCanvas.height = height;

      const outputCtx = outputCanvas.getContext("2d");
      if (!outputCtx) return;

      let cancelled = false;
      let raf = 0;

      const scene = createScene(width, height);
      sceneRef.current = scene;

      fontFamilyRef.current = probeFontFamily();

      const start = async () => {
        if (typeof document !== "undefined" && document.fonts?.ready) {
          try {
            await document.fonts.ready;
          } catch {
            // ignore
          }
        }
        const loop = () => {
          if (cancelled) return;
          raf = requestAnimationFrame(loop);
          tickScene(scene);
          paintFrame(
            outputCtx,
            scene.renderer.domElement,
            stateRef.current,
            fontFamilyRef.current,
            width,
            height,
          );
        };
        loop();
      };
      void start();

      return () => {
        cancelled = true;
        cancelAnimationFrame(raf);
        disposeScene(scene);
        sceneRef.current = null;
      };
    }, [size]);

    useImperativeHandle(
      ref,
      () => ({
        download: async (filename: string) => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          await new Promise<void>((resolve, reject) => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error("Failed to encode JPEG"));
                  return;
                }
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                resolve();
              },
              "image/jpeg",
              0.92,
            );
          });
        },
      }),
      [],
    );

    return (
      <div className={styles.frame}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          width={size.width}
          height={size.height}
          aria-label="Cover preview"
        />
      </div>
    );
  },
);
