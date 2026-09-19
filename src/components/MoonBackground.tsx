import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface MoonBackgroundProps {
  scrollProgress: number; // 0 -> 1 across the whole page
}

function makeGlowTexture(): THREE.Texture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,244,222,0.95)");
  gradient.addColorStop(0.25, "rgba(255,231,190,0.55)");
  gradient.addColorStop(0.55, "rgba(140,110,220,0.18)");
  gradient.addColorStop(1, "rgba(140,110,220,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export const MoonBackground: React.FC<MoonBackgroundProps> = ({ scrollProgress }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0);

  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07060d, 0.028);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    // --- Moon -------------------------------------------------------
    const moonGroup = new THREE.Group();
    moonGroup.position.set(2.6, 0.6, -2);

    const moonGeo = new THREE.SphereGeometry(1.35, 64, 64);
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xf3e6cf,
      emissive: 0x8a6a3a,
      emissiveIntensity: 0.35,
      roughness: 0.85,
      metalness: 0.05,
    });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moonGroup.add(moon);

    const glowTexture = makeGlowTexture();
    const glowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.Sprite(glowMaterial);
    glow.scale.set(7.5, 7.5, 1);
    moonGroup.add(glow);

    scene.add(moonGroup);

    const key = new THREE.DirectionalLight(0xffe9c7, 1.3);
    key.position.set(-3, 2, 4);
    scene.add(key);
    scene.add(new THREE.AmbientLight(0x4a3f7a, 0.5));

    // --- Starfield ----------------------------------------------------
    const STAR_COUNT = 900;
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      const r = 14 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi) - 6;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xdcd4ff,
      size: 0.045,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- Interaction state ---------------------------------------------
    const state = { mouseX: 0, mouseY: 0, targetX: 0, targetY: 0 };
    const onMouseMove = (e: MouseEvent) => {
      state.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      state.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const scroll = scrollRef.current;

      state.mouseX += (state.targetX - state.mouseX) * 0.04;
      state.mouseY += (state.targetY - state.mouseY) * 0.04;

      moonGroup.position.y = 0.6 + Math.sin(t * 0.25) * 0.15 - scroll * 2.4;
      moonGroup.position.x = 2.6 - scroll * 1.1 + state.mouseX * 0.25;
      moonGroup.rotation.y = t * 0.05;

      stars.rotation.y = t * 0.012 + scroll * 0.4;
      stars.rotation.x = state.mouseY * 0.05;

      camera.position.x += (state.mouseX * 0.5 - camera.position.x) * 0.03;
      camera.position.y += (-state.mouseY * 0.3 - scroll * 0.4 - camera.position.y) * 0.03;
      camera.lookAt(0, -scroll * 1.5, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      moonGeo.dispose();
      moonMat.dispose();
      glowMaterial.dispose();
      glowTexture.dispose();
      starGeo.dispose();
      starMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true" />;
};
