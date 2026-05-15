"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function CylinderScene() {
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
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      isMobile ? 52 : 42,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = isMobile ? 8.5 : 6.5;

    // Hat dimensions
    const BODY_R = 1.0;
    const BODY_H = 2.0;
    const BRIM_R = 1.8;
    const BRIM_H = 0.14;
    const BODY_TOP =  BODY_H / 2;          //  1.5
    const BODY_BOT = -BODY_H / 2;          // -1.5
    const BRIM_CENTER_Y = BODY_BOT - BRIM_H / 2; // -1.57

    // Shared materials
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
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfd7e14,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });
    const midRingMat = new THREE.MeshBasicMaterial({
      color: 0xfd7e14,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });

    // Body cylinder
    const cylGeom = new THREE.CylinderGeometry(BODY_R, BODY_R, BODY_H, 128, 64, true);
    const cylinder = new THREE.Mesh(cylGeom, cylMat);
    cylinder.renderOrder = 0;

    // Body caps
    const capGeom = new THREE.CircleGeometry(BODY_R, 128);
    const topCap = new THREE.Mesh(capGeom, capMat);
    topCap.rotation.x = -Math.PI / 2;
    topCap.position.y = BODY_TOP;
    cylinder.add(topCap);

    // Body edge rings
    const edgeRingGeom = new THREE.TorusGeometry(BODY_R + 0.005, 0.008, 8, 128);
    const topRing = new THREE.Mesh(edgeRingGeom, ringMat);
    topRing.rotation.x = Math.PI / 2;
    topRing.position.y = BODY_TOP;
    topRing.renderOrder = 1;
    const botRing = new THREE.Mesh(edgeRingGeom, ringMat);
    botRing.rotation.x = Math.PI / 2;
    botRing.position.y = BODY_BOT;
    botRing.renderOrder = 1;
    cylinder.add(topRing, botRing);

    // Mid-band accent ring
    const midRingGeom = new THREE.TorusGeometry(BODY_R + 0.01, 0.005, 8, 128);
    const midRing = new THREE.Mesh(midRingGeom, midRingMat);
    midRing.rotation.x = Math.PI / 2;
    midRing.renderOrder = 1;
    cylinder.add(midRing);

    // Brim side wall (open-ended — avoids z-fight with body bottom cap)
    const brimSideGeom = new THREE.CylinderGeometry(BRIM_R, BRIM_R, BRIM_H, 128, 2, true);
    const brimSide = new THREE.Mesh(brimSideGeom, cylMat);
    brimSide.position.y = BRIM_CENTER_Y;

    // Brim top: ring from body radius to brim edge
    const brimCapMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xfd7e14),
      metalness: 1.0,
      roughness: 0.02,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      transparent: true,
      opacity: 0.88,
      depthWrite: true,
      side: THREE.DoubleSide,
    });
    const brimTopGeom = new THREE.RingGeometry(BODY_R, BRIM_R, 128);
    const brimTopMesh = new THREE.Mesh(brimTopGeom, brimCapMat);
    brimTopMesh.rotation.x = -Math.PI / 2;
    brimTopMesh.position.y = BODY_BOT;

    // Brim bottom: full circle
    const brimBotGeom = new THREE.CircleGeometry(BRIM_R, 128);
    const brimBotMesh = new THREE.Mesh(brimBotGeom, brimCapMat);
    brimBotMesh.rotation.x = Math.PI / 2;
    brimBotMesh.position.y = BODY_BOT - BRIM_H;

    // Brim edge rings
    const brimRingGeom = new THREE.TorusGeometry(BRIM_R + 0.005, 0.008, 8, 128);
    const brimTopRing = new THREE.Mesh(brimRingGeom, ringMat);
    brimTopRing.rotation.x = Math.PI / 2;
    brimTopRing.position.y = BODY_BOT;
    brimTopRing.renderOrder = 1;
    const brimBotRing = new THREE.Mesh(brimRingGeom, ringMat);
    brimBotRing.rotation.x = Math.PI / 2;
    brimBotRing.position.y = BODY_BOT - BRIM_H;
    brimBotRing.renderOrder = 1;

    // Hat group — body + brim spin as one unit
    const hatGroup = new THREE.Group();
    hatGroup.add(cylinder, brimSide, brimTopMesh, brimBotMesh, brimTopRing, brimBotRing);

    // Inner glow shell
    const innerGeom = new THREE.CylinderGeometry(BODY_R - 0.12, BODY_R - 0.12, BODY_H - 0.05, 64, 1, true);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xfd7e14,
      transparent: true,
      opacity: 0.07,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const innerCyl = new THREE.Mesh(innerGeom, innerMat);

    // Wireframe cage
    const wireGeom = new THREE.CylinderGeometry(BODY_R + 0.03, BODY_R + 0.03, BODY_H + 0.05, 20, 5, false);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xfd7e14,
      wireframe: true,
      transparent: true,
      opacity: 0.07,
      depthWrite: false,
    });
    const wire = new THREE.Mesh(wireGeom, wireMat);

    // Particle halo
    const PARTICLE_COUNT = isMobile ? 150 : 300;
    const pPos = new Float32Array(PARTICLE_COUNT * 3);
    const pColors = new Float32Array(PARTICLE_COUNT * 3);
    const palette = [
      new THREE.Color(0xfd7e14),
      new THREE.Color(0xfd7e14),
      new THREE.Color(0xffa94d),
      new THREE.Color(0xff922b),
      new THREE.Color(0xffe066),
    ];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 2.5 + Math.random() * 2.5;
      pPos[i * 3]     = Math.cos(angle) * r;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 6.5;
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

    // Lighting
    scene.add(new THREE.AmbientLight(0x1a0a00, 5));

    const orbitLights: {
      light: THREE.PointLight;
      r: number;
      speed: number;
      ySpeed: number;
      phase: number;
    }[] = [
      { color: 0xfd7e14, intensity: 130, r: 3.8, speed:  0.45, ySpeed: 0.28, phase: 0 },
      { color: 0xffa94d, intensity: 100, r: 3.0, speed: -0.32, ySpeed: 0.38, phase: Math.PI },
      { color: 0xff922b, intensity:  70, r: 3.5, speed:  0.38, ySpeed: 0.22, phase: Math.PI / 2 },
      { color: 0xffe066, intensity:  55, r: 2.6, speed: -0.55, ySpeed: 0.48, phase: Math.PI * 1.5 },
      { color: 0xfd7e14, intensity:  80, r: 4.0, speed:  0.2,  ySpeed: 0.15, phase: Math.PI * 0.7 },
    ].map(({ color, intensity, r, speed, ySpeed, phase }) => {
      const light = new THREE.PointLight(color, intensity, 14);
      scene.add(light);
      return { light, r, speed, ySpeed, phase };
    });

    // Input — mouse + touch parallax
    let mouseX = 0;
    let mouseY = 0;
    let smoothX = 0;
    let smoothY = 0;

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
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    // Scene assembly
    const group = new THREE.Group();
    group.add(hatGroup, innerCyl, wire, particles);
    group.rotation.z = -(25 * Math.PI) / 180;
    scene.add(group);

    let raf: number;
    const clock = new THREE.Clock();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      smoothX += (mouseX - smoothX) * 0.04;
      smoothY += (mouseY - smoothY) * 0.04;

      group.rotation.z = -(25 * Math.PI) / 180 + smoothX * 0.18;
      group.rotation.x = smoothY * -0.18;

      hatGroup.rotation.y = t * 0.26;
      hatGroup.rotation.x = Math.sin(t * 0.17) * 0.1;
      innerCyl.rotation.y = hatGroup.rotation.y;
      innerCyl.rotation.x = hatGroup.rotation.x;
      wire.rotation.y = t * 0.14;
      wire.rotation.x = Math.sin(t * 0.17) * 0.06;
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
      window.removeEventListener("resize", onResize);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
      [
        cylGeom, capGeom, edgeRingGeom, midRingGeom,
        brimSideGeom, brimTopGeom, brimBotGeom, brimRingGeom,
        innerGeom, wireGeom, pGeom,
      ].forEach((g) => g.dispose());
      [cylMat, capMat, brimCapMat, ringMat, midRingMat, innerMat, wireMat, pMat].forEach((m) => m.dispose());
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
