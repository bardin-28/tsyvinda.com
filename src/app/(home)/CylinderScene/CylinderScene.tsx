"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function CylinderScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 6.5;

    // Main cylinder
    const cylGeom = new THREE.CylinderGeometry(1.2, 1.2, 3.8, 128, 64, false);
    const cylMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xfd7e14),
      metalness: 0.95,
      roughness: 0.07,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      transparent: true,
      opacity: 0.82,
      side: THREE.FrontSide,
      depthWrite: true,
      envMapIntensity: 2.0,
    });
    const cylinder = new THREE.Mesh(cylGeom, cylMat);
    cylinder.renderOrder = 0;
    scene.add(cylinder);

    // Polished caps
    const capGeom = new THREE.CircleGeometry(1.2, 128);
    const capMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xfd7e14),
      metalness: 1.0,
      roughness: 0.02,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      transparent: true,
      opacity: 0.88,
      depthWrite: true,
    });
    const topCap = new THREE.Mesh(capGeom, capMat);
    topCap.rotation.x = -Math.PI / 2;
    topCap.position.y = 1.9;
    const botCap = new THREE.Mesh(capGeom, capMat);
    botCap.rotation.x = Math.PI / 2;
    botCap.position.y = -1.9;
    cylinder.add(topCap);
    cylinder.add(botCap);

    // Edge rings — orange, scene-level so renderOrder is independent
    const ringGeom = new THREE.TorusGeometry(1.205, 0.008, 8, 128);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfd7e14,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });
    const topRing = new THREE.Mesh(ringGeom, ringMat);
    topRing.rotation.x = Math.PI / 2;
    topRing.position.y = 1.9;
    topRing.renderOrder = 1;
    const botRing = new THREE.Mesh(ringGeom, ringMat);
    botRing.rotation.x = Math.PI / 2;
    botRing.position.y = -1.9;
    botRing.renderOrder = 1;
    cylinder.add(topRing);
    cylinder.add(botRing);

    // Mid-band accent ring — orange
    const midRingGeom = new THREE.TorusGeometry(1.21, 0.005, 8, 128);
    const midRingMat = new THREE.MeshBasicMaterial({
      color: 0xfd7e14,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    const midRing = new THREE.Mesh(midRingGeom, midRingMat);
    midRing.rotation.x = Math.PI / 2;
    midRing.renderOrder = 1;
    cylinder.add(midRing);

    // Inner glow shell — orange tint
    const innerGeom = new THREE.CylinderGeometry(1.08, 1.08, 3.75, 64, 1, true);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xfd7e14,
      transparent: true,
      opacity: 0.07,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const innerCyl = new THREE.Mesh(innerGeom, innerMat);
    scene.add(innerCyl);

    // Wireframe cage — orange tint
    const wireGeom = new THREE.CylinderGeometry(1.23, 1.23, 3.85, 20, 5, false);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xfd7e14,
      wireframe: true,
      transparent: true,
      opacity: 0.07,
      depthWrite: false,
    });
    const wire = new THREE.Mesh(wireGeom, wireMat);
    scene.add(wire);

    // Particle halo — orange dominant
    const PARTICLE_COUNT = 300;
    const pPos = new Float32Array(PARTICLE_COUNT * 3);
    const pColors = new Float32Array(PARTICLE_COUNT * 3);
    const palette = [
      new THREE.Color(0xfd7e14),
      new THREE.Color(0xfd7e14),
      new THREE.Color(0xec4899),
      new THREE.Color(0x818cf8),
      new THREE.Color(0xffa94d),
    ];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 1.75 + Math.random() * 2.5;
      pPos[i * 3]     = Math.cos(angle) * r;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 5.5;
      pPos[i * 3 + 2] = Math.sin(angle) * r;
      const c = palette[Math.floor(Math.random() * palette.length)];
      pColors[i * 3]     = c.r;
      pColors[i * 3 + 1] = c.g;
      pColors[i * 3 + 2] = c.b;
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
    scene.add(particles);

    // Lighting — orange dominant
    scene.add(new THREE.AmbientLight(0x1a0a00, 5));


    const orbitLights: {
      light: THREE.PointLight;
      r: number;
      speed: number;
      ySpeed: number;
      phase: number;
    }[] = [
      { color: 0xfd7e14, intensity: 130, r: 3.8, speed: 0.45,  ySpeed: 0.28, phase: 0 },
      { color: 0xffa94d, intensity: 100, r: 3.0, speed: -0.32, ySpeed: 0.38, phase: Math.PI },
      { color: 0xec4899, intensity: 70,  r: 3.5, speed: 0.38,  ySpeed: 0.22, phase: Math.PI / 2 },
      { color: 0x818cf8, intensity: 55,  r: 2.6, speed: -0.55, ySpeed: 0.48, phase: Math.PI * 1.5 },
      { color: 0xfd7e14, intensity: 80,  r: 4.0, speed: 0.2,   ySpeed: 0.15, phase: Math.PI * 0.7 },
    ].map(({ color, intensity, r, speed, ySpeed, phase }) => {
      const light = new THREE.PointLight(color, intensity, 14);
      scene.add(light);
      return { light, r, speed, ySpeed, phase };
    });

    // Mouse tracking
    let mouseX = 0;
    let mouseY = 0;
    let smoothX = 0;
    let smoothY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    let raf: number;
    const clock = new THREE.Clock();

    // Group to apply 45-degree base tilt cleanly
    const group = new THREE.Group();
    group.add(cylinder);
    group.add(innerCyl);
    group.add(wire);
    group.add(particles);
    group.rotation.z = -(25 * Math.PI) / 180;
    scene.add(group);

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth mouse lerp
      smoothX += (mouseX - smoothX) * 0.04;
      smoothY += (mouseY - smoothY) * 0.04;

      // Base auto-rotation + mouse parallax on group
      group.rotation.z = -(25 * Math.PI) / 180 + smoothX * 0.18;
      group.rotation.x = smoothY * -0.18;

      // Cylinder spins on its own Y inside the group
      cylinder.rotation.y = t * 0.26;
      cylinder.rotation.x = Math.sin(t * 0.17) * 0.1;
      innerCyl.rotation.copy(cylinder.rotation);
      wire.rotation.y = t * 0.14;
      wire.rotation.x = cylinder.rotation.x * 0.6;
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
      window.removeEventListener("resize", onResize);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
      [cylGeom, capGeom, ringGeom, midRingGeom, innerGeom, wireGeom, pGeom].forEach((g) => g.dispose());
      [cylMat, capMat, ringMat, midRingMat, innerMat, wireMat, pMat].forEach((m) => m.dispose());
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }}
      aria-hidden="true"
    />
  );
}
