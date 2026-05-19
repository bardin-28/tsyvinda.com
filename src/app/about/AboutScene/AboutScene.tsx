"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function AboutScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isMobile = window.innerWidth < 768;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      isMobile ? 60 : 50,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = isMobile ? 9 : 7;

    const group = new THREE.Group();
    scene.add(group);

    // Core wireframe icosahedron
    const coreGeom = new THREE.IcosahedronGeometry(1.4, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xfd7e14,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    const core = new THREE.Mesh(coreGeom, coreMat);
    group.add(core);

    // Inner solid faint
    const innerGeom = new THREE.IcosahedronGeometry(1.35, 0);
    const innerMat = new THREE.MeshPhysicalMaterial({
      color: 0xfd7e14,
      metalness: 0.8,
      roughness: 0.25,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const innerMesh = new THREE.Mesh(innerGeom, innerMat);
    group.add(innerMesh);

    // Outer dodecahedron shell
    const shellGeom = new THREE.DodecahedronGeometry(2.4, 0);
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const shell = new THREE.Mesh(shellGeom, shellMat);
    group.add(shell);

    // Distant ring
    const ringGeom = new THREE.TorusGeometry(3.2, 0.012, 6, 256);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xec4899,
      transparent: true,
      opacity: 0.45,
    });
    const ring1 = new THREE.Mesh(ringGeom, ringMat);
    ring1.rotation.x = Math.PI / 2.5;
    const ring2 = new THREE.Mesh(ringGeom, ringMat);
    ring2.rotation.x = Math.PI / 1.8;
    ring2.rotation.y = Math.PI / 3;
    group.add(ring1, ring2);

    // Particle nebula
    const PARTICLE_COUNT = isMobile ? 400 : 900;
    const pPos = new Float32Array(PARTICLE_COUNT * 3);
    const pColors = new Float32Array(PARTICLE_COUNT * 3);
    const palette = [
      new THREE.Color(0xfd7e14),
      new THREE.Color(0xffa94d),
      new THREE.Color(0x6366f1),
      new THREE.Color(0xec4899),
      new THREE.Color(0xffe066),
    ];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 3.5 + Math.random() * 4.5;
      pPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPos[i * 3 + 2] = r * Math.cos(phi);
      const c = palette[Math.floor(Math.random() * palette.length)];
      pColors[i * 3]     = c.r;
      pColors[i * 3 + 1] = c.g;
      pColors[i * 3 + 2] = c.b;
    }
    const pGeom = new THREE.BufferGeometry();
    pGeom.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    pGeom.setAttribute("color", new THREE.BufferAttribute(pColors, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.035,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      vertexColors: true,
      depthWrite: false,
    });
    const particles = new THREE.Points(pGeom, pMat);
    scene.add(particles);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const orbitLights = [
      { color: 0xfd7e14, intensity: 90, r: 3.5, speed:  0.5, ySpeed: 0.3, phase: 0 },
      { color: 0x6366f1, intensity: 70, r: 3.0, speed: -0.4, ySpeed: 0.4, phase: Math.PI },
      { color: 0xec4899, intensity: 60, r: 4.0, speed:  0.3, ySpeed: 0.2, phase: Math.PI / 2 },
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
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseX = (e.touches[0].clientX / window.innerWidth  - 0.5) * 2;
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
    const clock = new THREE.Clock();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      smoothX += (mouseX - smoothX) * 0.04;
      smoothY += (mouseY - smoothY) * 0.04;
      smoothScroll += (scrollY - smoothScroll) * 0.06;

      group.position.y = smoothScroll * 0.8;
      group.rotation.y = t * 0.18 + smoothX * 0.4;
      group.rotation.x = smoothY * -0.3 + Math.sin(t * 0.15) * 0.1;

      core.rotation.x = t * 0.35;
      core.rotation.y = t * 0.4;
      innerMesh.rotation.x = -t * 0.25;
      innerMesh.rotation.y = -t * 0.3;
      shell.rotation.x = -t * 0.12;
      shell.rotation.z = t * 0.08;
      ring1.rotation.z = t * 0.2;
      ring2.rotation.z = -t * 0.15;

      particles.rotation.y = t * 0.04 + smoothX * 0.1;
      particles.rotation.x = smoothY * -0.08;

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
      [coreGeom, innerGeom, shellGeom, ringGeom, pGeom].forEach((g) => g.dispose());
      [coreMat, innerMat, shellMat, ringMat, pMat].forEach((m) => m.dispose());
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
            "radial-gradient(ellipse at center, rgba(8, 8, 16, 0.4) 0%, rgba(8, 8, 16, 0.7) 100%)",
        }}
        aria-hidden="true"
      />
    </>
  );
}
