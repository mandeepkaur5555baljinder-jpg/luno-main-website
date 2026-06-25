import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface LunoSceneProps {
  scrollProgress: number; // 0 to 1 across the page, or custom steps
  activeStep: number;     // 0: Hero, 1: Ask Anything, 2: Build Websites, 3: Talk with Voice, 4: Settle / Download
}

export const LunoScene: React.FC<LunoSceneProps> = ({ scrollProgress, activeStep }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Keep state refs for smooth interpolation inside requestAnimationFrame
  const stateRef = useRef({
    scrollProgress: 0,
    activeStep: 0,
    mouseX: 0,
    mouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0,
  });

  // Sync props to refs to avoid tearing or triggering unnecessary useEffect setups
  useEffect(() => {
    stateRef.current.scrollProgress = scrollProgress;
    stateRef.current.activeStep = activeStep;
  }, [scrollProgress, activeStep]);

  useEffect(() => {
    // Check for reduced motion preferences
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Track mouse movement (parallax effect)
    const handleMouseMove = (event: MouseEvent) => {
      if (prefersReducedMotion) return;
      const { clientX, clientY } = event;
      const width = window.innerWidth;
      const height = window.innerHeight;
      stateRef.current.targetMouseX = (clientX / width - 0.5) * 2; // -1 to 1
      stateRef.current.targetMouseY = (clientY / height - 0.5) * 2; // -1 to 1
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Get exact container dimensions
    let width = container.clientWidth;
    let height = container.clientHeight;

    // Create scene, camera, renderer
    const scene = new THREE.Scene();
    
    // Low fog for deep atmosphere
    scene.fog = new THREE.FogExp2(0x0b0c10, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    // Adjusted initial camera position for beautiful visual footprint
    camera.position.z = 7.5;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Support high dynamic lights
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Master container group to handle scroll offsets & translations easily
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // --- PROCEDURAL QUANTUM CORE GEOMETRY ---

    // 1. Crystal Faceted Outer Glass Sphere (low polygon for high aesthetic, is glass refractive)
    const glassGeometry = new THREE.IcosahedronGeometry(1.7, 1); // 1 detail gives a highly stylized multifaceted crystal look
    
    // Save original position attribute for vertex waving animation during Voice Step
    const originalPositions = glassGeometry.attributes.position.clone();

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xdde7ff,
      metalness: 0.1,
      roughness: 0.18,
      transmission: 0.9,     // Makes it look glassy
      ior: 1.45,            // Glass index of refraction
      thickness: 1.2,       // Refraction depth
      specularIntensity: 1.0,
      specularColor: 0xffffff,
      transparent: true,
      opacity: 0.85,
      flatShading: true,    // Flat polygonal faces
    });

    const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
    masterGroup.add(glassMesh);

    // 2. Inner Glowing Core Sphere
    const innerGeometry = new THREE.IcosahedronGeometry(0.9, 2);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    masterGroup.add(innerMesh);

    // 3. Mini core light source inside the orb (emits premium frosted neutral light)
    const innerCoreLight = new THREE.PointLight(0xffffff, 5, 10);
    masterGroup.add(innerCoreLight);

    // 4. Double-Axis Orbiting Rings
    const ringGroup = new THREE.Group();
    masterGroup.add(ringGroup);

    const torusGeom = new THREE.TorusGeometry(2.3, 0.025, 8, 100);
    const ringMaterial1 = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.45,
    });
    const ringMesh1 = new THREE.Mesh(torusGeom, ringMaterial1);
    ringMesh1.rotation.x = Math.PI / 2;
    ringGroup.add(ringMesh1);

    const ringMaterial2 = new THREE.MeshStandardMaterial({
      color: 0xa1a1a1,
      roughness: 0.2,
      metalness: 0.9,
      transparent: true,
      opacity: 0.35,
    });
    const ringMesh2 = new THREE.Mesh(torusGeom, ringMaterial2);
    ringMesh2.rotation.y = Math.PI / 2;
    ringGroup.add(ringMesh2);

    // 5. Outer Particle Cloud system
    const particlesCount = 120;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const speedFactors = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount; i++) {
      // Create random distribution around core but not too close
      const radius = 2.5 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      speedFactors[i] = 0.2 + Math.random() * 0.8;
    }

    const originalParticlePositions = new Float32Array(positions);

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.04,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    masterGroup.add(particleSystem);


    // --- LIGHTS CONFIGURATION (Monochrome Frosted Luxury, High Static Highlights) ---
    const ambLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambLight);

    // Key premium top white light
    const bluePointLight = new THREE.PointLight(0xffffff, 8, 15);
    bluePointLight.position.set(4, 5, 3);
    scene.add(bluePointLight);

    // Vibrant secondary silver specular light
    const cyanPointLight = new THREE.PointLight(0xdadada, 4, 10);
    cyanPointLight.position.set(-5, 2, 2);
    scene.add(cyanPointLight);

    // Ambient soft bottom dark white light
    const softLight = new THREE.DirectionalLight(0xffffff, 0.5);
    softLight.position.set(0, -6, 2);
    scene.add(softLight);

    // Store target transformation values for beautiful, lag-free interpolation
    const targets = {
      x: 0,
      y: 0,
      z: 0,
      rotX: 0,
      rotY: 0,
      scale: 1,
      color: new THREE.Color(0xffffff),
      waveAmplitude: 0,
      ringSpeed: 1,
    };

    // Resize Event Handler
    const handleResize = () => {
      if (!container || !canvas) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    let animationId = 0;
    let clock = new THREE.Clock();

    // Render loop
    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      // State extraction
      const currentProgress = stateRef.current.scrollProgress; // 0 to 1
      const currentStep = stateRef.current.activeStep;

      // Mouse Lerp (smooth lag-free interpolation)
      stateRef.current.mouseX += (stateRef.current.targetMouseX - stateRef.current.mouseX) * 0.08;
      stateRef.current.mouseY += (stateRef.current.targetMouseY - stateRef.current.mouseY) * 0.08;

      // --- 3D STORY STATES INTERPOLATION ---
      // Step configurations:
      // Step 0: Hero. Centered, beautiful scale.
      // Step 1: Ask Anything. Moves slightly left (on desktop), scaled nicely.
      // Step 2: Build Websites. Rotates fast, metallic ring speed increases, turns silver/grey.
      // Step 3: Talk with voice. Center-right, waves dynamically.
      // Step 4: Download section. Sits neatly on the right, floating beautifully.

      // Determine viewport size configuration (mobile layout vs desktop layout)
      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        // Mobile-optimized transformations (keep it responsive and close to the center)
        switch (currentStep) {
          case 0: // Hero
            targets.x = 0;
            targets.y = 1.0; // Higher up on mobile to leave room for text
            targets.z = 0;
            targets.scale = 1.1;
            targets.rotX = elapsedHeightAngle(1.0);
            targets.rotY = elapsedHeightAngle(1.0);
            targets.color.setHex(0xe4e4e7);
            targets.waveAmplitude = 0;
            targets.ringSpeed = 1;
            break;
          case 1: // Ask Anything
            targets.x = 0;
            targets.y = 0.8;
            targets.z = 0;
            targets.scale = 1.25;
            targets.rotX = elapsedHeightAngle(1.5);
            targets.rotY = elapsedHeightAngle(1.2);
            targets.color.setHex(0xa1a1aa);
            targets.waveAmplitude = 0.08;
            targets.ringSpeed = 1.5;
            break;
          case 2: // Build Websites
            targets.x = 0;
            targets.y = 0.8;
            targets.z = 0.3;
            targets.scale = 1.15;
            targets.rotX = elapsedHeightAngle(3.0);
            targets.rotY = elapsedHeightAngle(2.5);
            targets.color.setHex(0xffffff);
            targets.waveAmplitude = 0.02;
            targets.ringSpeed = 2.5;
            break;
          case 3: // Talk with voice
            targets.x = 0;
            targets.y = 0.7;
            targets.z = 0.2;
            targets.scale = 1.35;
            targets.rotX = elapsedHeightAngle(1.0);
            targets.rotY = elapsedHeightAngle(2.0);
            targets.color.setHex(0xffffff); // Glowing audio white
            targets.waveAmplitude = 0.28;  // Strong audio ripples
            targets.ringSpeed = 1.2;
            break;
          case 4: // Download Section
            targets.x = 0;
            targets.y = 0.9;
            targets.z = -0.5;
            targets.scale = 0.9;
            targets.rotX = elapsedHeightAngle(1.0);
            targets.rotY = elapsedHeightAngle(1.0);
            targets.color.setHex(0x52525b);
            targets.waveAmplitude = 0.04;
            targets.ringSpeed = 0.8;
            break;
        }
      } else {
        // Desktop premium layout
        switch (currentStep) {
          case 0: // Hero - Center stage
            targets.x = 1.5; // Right-hand balance for standard landing
            targets.y = 0;
            targets.z = 0;
            targets.scale = 1.35;
            targets.rotX = elapsedHeightAngle(1.0);
            targets.rotY = elapsedHeightAngle(1.0);
            targets.color.setHex(0xe4e4e7);
            targets.waveAmplitude = 0.01;
            targets.ringSpeed = 1.0;
            break;
          case 1: // Ask anything
            targets.x = -1.6; // Slides to the left to align with screen story text
            targets.y = 0;
            targets.z = 0.2;
            targets.scale = 1.45;
            targets.rotX = elapsedHeightAngle(1.4);
            targets.rotY = elapsedHeightAngle(1.2);
            targets.color.setHex(0xa1a1aa);
            targets.waveAmplitude = 0.06;
            targets.ringSpeed = 1.5;
            break;
          case 2: // Build websites
            targets.x = 1.6; // Slides back to the right
            targets.y = 0;
            targets.z = 0.2;
            targets.scale = 1.45;
            targets.rotX = elapsedHeightAngle(3.0);
            targets.rotY = elapsedHeightAngle(2.5);
            targets.color.setHex(0xffffff);
            targets.waveAmplitude = 0.03;
            targets.ringSpeed = 2.8;
            break;
          case 3: // Talk with voice
            targets.x = -1.5; // Slides to left for chat layout
            targets.y = 0.1;
            targets.z = 0.5;
            targets.scale = 1.6; // Cinematic Zoom
            targets.rotX = elapsedHeightAngle(0.8);
            targets.rotY = elapsedHeightAngle(1.8);
            targets.color.setHex(0xffffff); // Light white wave pulse
            targets.waveAmplitude = 0.3; // Intense displacement pulse simulation
            targets.ringSpeed = 1.4;
            break;
          case 4: // Download Section
            targets.x = 1.8; // Positions snugly next to grid downloads
            targets.y = -0.2;
            targets.z = -0.3;
            targets.scale = 1.1;
            targets.rotX = elapsedHeightAngle(0.9);
            targets.rotY = elapsedHeightAngle(0.9);
            targets.color.setHex(0x52525b);
            targets.waveAmplitude = 0.03;
            targets.ringSpeed = 0.7;
            break;
        }
      }

      function elapsedHeightAngle(speedMultiplier: number) {
        return elapsedTime * 0.15 * speedMultiplier;
      }

      // --- SMOOTH PROPERTY LERPS ---
      const lerpSpeed = prefersReducedMotion ? 0.3 : 0.07;
      
      masterGroup.position.x += (targets.x - masterGroup.position.x) * lerpSpeed;
      masterGroup.position.y += (targets.y - masterGroup.position.y) * lerpSpeed;
      masterGroup.position.z += (targets.z - masterGroup.position.z) * lerpSpeed;
      
      const targetScaleV3 = new THREE.Vector3(targets.scale, targets.scale, targets.scale);
      masterGroup.scale.lerp(targetScaleV3, lerpSpeed);

      // Mouse Parallax Influence (additive, delicate, modern)
      if (!prefersReducedMotion) {
        masterGroup.position.x += (stateRef.current.mouseX * 0.3 - masterGroup.position.x) * 0.02;
        masterGroup.position.y += (-stateRef.current.mouseY * 0.3 - masterGroup.position.y) * 0.02;
        
        // Tilt rotations
        masterGroup.rotation.x += (targets.rotX + stateRef.current.mouseY * 0.15 - masterGroup.rotation.x) * lerpSpeed;
        masterGroup.rotation.y += (targets.rotY + stateRef.current.mouseX * 0.15 - masterGroup.rotation.y) * lerpSpeed;
      } else {
        masterGroup.rotation.x += (targets.rotX - masterGroup.rotation.x) * lerpSpeed;
        masterGroup.rotation.y += (targets.rotY - masterGroup.rotation.y) * lerpSpeed;
      }

      // Smooth color transitions for the inner mesh and PointLight
      innerMaterial.color.lerp(targets.color, lerpSpeed);
      innerCoreLight.color.lerp(targets.color, lerpSpeed);

      // --- PROCEDURAL VOICE RIPPLES / VERTEX WAVING EFFECT ---
      // We displace vertices dynamically using sine waves representing speech loops
      const glassPosAttr = glassMesh.geometry.attributes.position;
      const count = glassPosAttr.count;
      
      const currentAmp = THREE.MathUtils.lerp(
        glassPosAttr.getZ(0), // placeholder
        targets.waveAmplitude,
        0.08
      );

      if (currentAmp > 0.005 && !prefersReducedMotion) {
        const timeFactor = elapsedTime * 4.5;
        // Apply procedural mathematical displacement
        for (let i = 0; i < count; i++) {
          const vx = originalPositions.getX(i);
          const vy = originalPositions.getY(i);
          const vz = originalPositions.getZ(i);

          // Displace along the vertex normal vectors (from core outward)
          // Mathematical noise approximation using layered sine/cosine waves
          const distFromCore = Math.sqrt(vx * vx + vy * vy + vz * vz);
          const wave = Math.sin(vy * 3.0 + timeFactor) * Math.cos(vx * 2.5 + timeFactor) * currentAmp;
          
          const scaleFactor = (distFromCore + wave) / distFromCore;

          glassPosAttr.setXYZ(i, vx * scaleFactor, vy * scaleFactor, vz * scaleFactor);
        }
        glassGeometry.computeVertexNormals();
        glassPosAttr.needsUpdate = true;
      } else if (glassPosAttr.needsUpdate) {
        // Restore to original positions smoothly
        for (let i = 0; i < count; i++) {
          glassPosAttr.setXYZ(i, originalPositions.getX(i), originalPositions.getY(i), originalPositions.getZ(i));
        }
        glassGeometry.computeVertexNormals();
        glassPosAttr.needsUpdate = true;
      }

      // Rotate orbiting elements
      const speedParam = targets.ringSpeed;
      ringMesh1.rotation.z += 0.006 * speedParam;
      ringMesh2.rotation.x += 0.008 * speedParam;
      ringMesh2.rotation.y -= 0.004 * speedParam;

      // Float particles system slightly
      particleSystem.rotation.y += 0.001 * (speedParam * 0.5);
      particleSystem.rotation.x += 0.0005;

      // --- DYNAMIC SCROLL PARTICLES (DOTS) TRANSFORMATION ---
      // "when we scroll the dots separate and go down with us with scroll animation"
      const pAttrib = particlesGeometry.attributes.position;
      if (pAttrib) {
        const scrollP = stateRef.current.scrollProgress; // 0 to 1
        for (let i = 0; i < particlesCount; i++) {
          const ox = originalParticlePositions[i * 3];
          const oy = originalParticlePositions[i * 3 + 1];
          const oz = originalParticlePositions[i * 3 + 2];
          
          // Separate: increase distance from the center. And move down: subtract Y based on scrollP
          // Using speedFactor to make some dots separate and drift down faster than others
          const f = speedFactors[i];
          const separation = 1.0 + scrollP * 3.8 * f;
          const descent = scrollP * 14.0 * f;
          
          pAttrib.setXYZ(
            i,
            ox * separation,
            oy * separation - descent,
            oz * separation
          );
        }
        pAttrib.needsUpdate = true;
      }

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(tick);
    };

    tick();

    // Clean up
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
      
      // Memory cleanup
      glassGeometry.dispose();
      glassMaterial.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
      torusGeom.dispose();
      ringMaterial1.dispose();
      ringMaterial2.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};
