"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";

/** Brand orange — single source shared with manifest, antd, and CSS Modules. */
const ACCENT = 0xfd7e14;

/**
 * Sample `count` evenly-spaced points around a unit circle. `centerX` shifts the
 * circle along x; `plane` picks which axes it spans. The oloid is the convex hull
 * of two such circles in perpendicular planes whose centres sit one radius apart.
 */
const circlePoints = (
  count: number,
  centerX: number,
  plane: "xy" | "xz",
): THREE.Vector3[] => {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const u = Math.cos(angle);
    const v = Math.sin(angle);
    if (plane === "xy") {
      points.push(new THREE.Vector3(centerX + u, v, 0));
    } else {
      points.push(new THREE.Vector3(centerX + u, 0, v));
    }
  }
  return points;
};

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

export default function ScrollOloidScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isMobile = window.innerWidth < 768;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      isMobile ? 52 : 42,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    camera.position.z = isMobile ? 9 : 7;

    // Oloid — convex hull of two perpendicular unit circles, centres one radius
    // apart. 96 samples per circle gives a near-smooth metallic surface.
    const SEGMENTS = isMobile ? 64 : 96;
    const hullPoints = [
      ...circlePoints(SEGMENTS, -0.5, "xy"),
      ...circlePoints(SEGMENTS, 0.5, "xz"),
    ];
    const oloidGeom = new ConvexGeometry(hullPoints);
    oloidGeom.computeVertexNormals();

    const oloidMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(ACCENT),
      metalness: 0.95,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      envMapIntensity: 2.0,
      side: THREE.DoubleSide,
    });
    const oloid = new THREE.Mesh(oloidGeom, oloidMat);
    oloid.scale.setScalar(1.7);

    // Glowing edge wireframe accents the developable oloid seams.
    const edgeGeom = new THREE.EdgesGeometry(oloidGeom, 18);
    const edgeMat = new THREE.LineBasicMaterial({
      color: ACCENT,
      transparent: true,
      opacity: 0.18,
    });
    const edges = new THREE.LineSegments(edgeGeom, edgeMat);
    edges.scale.setScalar(1.7);

    // Tumble group — the oloid spins; the outer group tilts with the pointer.
    const tumbleGroup = new THREE.Group();
    tumbleGroup.add(oloid, edges);

    // Faint particle halo for ambient depth.
    const PARTICLE_COUNT = isMobile ? 150 : 300;
    const pPos = new Float32Array(PARTICLE_COUNT * 3);
    const pColors = new Float32Array(PARTICLE_COUNT * 3);
    const palette = [
      new THREE.Color(0xfd7e14),
      new THREE.Color(0xffa94d),
      new THREE.Color(0xff922b),
      new THREE.Color(0xffe066),
    ];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.6 + Math.random() * 2.6;
      pPos[i * 3] = Math.cos(angle) * radius;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 6.5;
      pPos[i * 3 + 2] = Math.sin(angle) * radius;
      const color = palette[Math.floor(Math.random() * palette.length)];
      pColors[i * 3] = color.r;
      pColors[i * 3 + 1] = color.g;
      pColors[i * 3 + 2] = color.b;
    }
    const pGeom = new THREE.BufferGeometry();
    pGeom.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    pGeom.setAttribute("color", new THREE.BufferAttribute(pColors, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.028,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
      vertexColors: true,
    });
    const particles = new THREE.Points(pGeom, pMat);

    // Lighting — orbiting point lights for moving metallic highlights.
    scene.add(new THREE.AmbientLight(0x1a0a00, 5));
    const orbitLights = [
      { color: 0xfd7e14, intensity: 130, r: 3.8, speed: 0.45, ySpeed: 0.28, phase: 0 },
      { color: 0xffa94d, intensity: 100, r: 3.0, speed: -0.32, ySpeed: 0.38, phase: Math.PI },
      { color: 0xff922b, intensity: 70, r: 3.5, speed: 0.38, ySpeed: 0.22, phase: Math.PI / 2 },
      { color: 0xffe066, intensity: 55, r: 2.6, speed: -0.55, ySpeed: 0.48, phase: Math.PI * 1.5 },
    ].map(({ color, intensity, r, speed, ySpeed, phase }) => {
      const light = new THREE.PointLight(color, intensity, 14);
      scene.add(light);
      return { light, r, speed, ySpeed, phase };
    });

    const group = new THREE.Group();
    group.add(tumbleGroup, particles);
    scene.add(group);

    // Pointer parallax (tilt), smoothed each frame.
    let mouseX = 0;
    let mouseY = 0;
    let smoothX = 0;
    let smoothY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseX = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
      }
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    // Scroll progress (0..1 over the whole page), smoothed toward target.
    let targetProgress = 0;
    let smoothProgress = 0;

    const computeProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      targetProgress = max > 0 ? clamp01(window.scrollY / max) : 0;
    };
    computeProgress();
    window.addEventListener("scroll", computeProgress, { passive: true });

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      computeProgress();
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    const timer = new THREE.Timer();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      timer.update();
      const t = timer.getElapsed();

      smoothX += (mouseX - smoothX) * 0.04;
      smoothY += (mouseY - smoothY) * 0.04;
      smoothProgress += (targetProgress - smoothProgress) * 0.08;
      const p = smoothProgress;

      // Outer group tilts with the pointer.
      group.rotation.z = smoothX * 0.12;
      group.rotation.x = smoothY * -0.12;

      // Continuous idle tumble so it always rotates, with scroll adding extra spin.
      tumbleGroup.rotation.y = t * 0.35 + p * Math.PI * 3;
      tumbleGroup.rotation.x = t * 0.14 + p * Math.PI * 1.2;
      tumbleGroup.rotation.z = Math.sin(t * 0.2) * 0.18;
      particles.rotation.y = t * 0.06;

      orbitLights.forEach(({ light, r, speed, ySpeed, phase }) => {
        light.position.x = Math.cos(t * speed + phase) * r;
        light.position.y = Math.sin(t * ySpeed) * 2.2;
        light.position.z = Math.sin(t * speed + phase) * r;
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("scroll", computeProgress);
      window.removeEventListener("resize", onResize);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
      [oloidGeom, edgeGeom, pGeom].forEach((g) => g.dispose());
      [oloidMat, edgeMat, pMat].forEach((m) => m.dispose());
    };
  }, []);

  return (
    <>
      <div
        ref={mountRef}
        style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }}
        aria-hidden="true"
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center, rgba(8, 8, 16, 0.35) 0%, rgba(8, 8, 16, 0.65) 100%)",
        }}
        aria-hidden="true"
      />
    </>
  );
}
