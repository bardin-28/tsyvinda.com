"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function BlogScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isMobile = window.innerWidth < 768;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      isMobile ? 58 : 46,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = isMobile ? 9 : 7;

    const group = new THREE.Group();
    scene.add(group);

    // Core torus knot — glass orange figure
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

    // Wireframe shell — same knot shape, larger tube radius, low opacity
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

    // Outer halo torus
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

    // Particle field
    const PARTICLE_COUNT = isMobile ? 350 : 800;
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

    // Lighting
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

    // Parallax inputs
    let mouseX = 0;
    let mouseY = 0;
    let smoothX = 0;
    let smoothY = 0;
    let scrollY = 0;
    let smoothScroll = 0;

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
    const onScroll = () => {
      scrollY = window.scrollY / Math.max(1, window.innerHeight);
    };
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    let raf: number;
    const timer = new THREE.Timer();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      timer.update();
      const t = timer.getElapsed();

      smoothX += (mouseX - smoothX) * 0.04;
      smoothY += (mouseY - smoothY) * 0.04;
      smoothScroll += (scrollY - smoothScroll) * 0.06;

      group.position.y = smoothScroll * 0.6;
      group.rotation.y = t * 0.18 + smoothX * 0.32;
      group.rotation.x = smoothY * -0.25 + Math.sin(t * 0.15) * 0.08;

      knot.rotation.x = t * 0.32;
      knot.rotation.y = t * 0.4;
      halo1.rotation.z = t * 0.2;
      halo2.rotation.z = -t * 0.16;

      particles.rotation.y = t * 0.025;

      orbitLights.forEach(({ light, r, speed, ySpeed, phase }) => {
        light.position.x = Math.cos(t * speed + phase) * r;
        light.position.y = Math.sin(t * ySpeed) * 2.0;
        light.position.z = Math.sin(t * speed + phase) * r;
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
      [knotGeom, shellGeom, haloGeom, pGeom].forEach((g) => g.dispose());
      [knotMat, shellMat, haloMat, pMat].forEach((m) => m.dispose());
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
            "radial-gradient(ellipse at center, rgba(8, 8, 16, 0.45) 0%, rgba(8, 8, 16, 0.78) 100%)",
        }}
        aria-hidden="true"
      />
    </>
  );
}
