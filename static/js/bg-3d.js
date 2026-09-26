/**
 * CampusConnect 3D Atmospheric Background Engine
 * Specifications:
 * - Subtle floating stardust & tiny glowing light particles
 * - Very subtle blue/cyan/violet light streaks and depth fog
 * - Soft glowing ambient orbs with dynamic breathing
 * - Real-time smooth mouse parallax broadcast for hero layers
 * - Subdued, cinematic rendering so the college building remains the primary visual background
 */
(function() {
  'use strict';

  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded. 3D atmospheric effects disabled.');
    return;
  }

  const canvas = document.getElementById('bg3dCanvas');
  if (!canvas) return;

  // Scene & Camera Setup with Depth Fog
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05070D, 0.009);

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 48);

  // High-Performance WebGL Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));

  // Dynamic Ambient Lighting (Subtle & Dark)
  const ambientLight = new THREE.AmbientLight(0x1a233d, 1.6);
  scene.add(ambientLight);

  const blueOrb = new THREE.PointLight(0x3b82f6, 2.5, 90);
  blueOrb.position.set(-20, 10, 15);
  scene.add(blueOrb);

  const cyanOrb = new THREE.PointLight(0x06b6d4, 2.8, 85);
  cyanOrb.position.set(20, -12, 10);
  scene.add(cyanOrb);

  const violetOrb = new THREE.PointLight(0x8b5cf6, 2.2, 80);
  violetOrb.position.set(0, 18, 5);
  scene.add(violetOrb);

  // Soft Circular Particle Texture
  const pCanvas = document.createElement('canvas');
  pCanvas.width = 32;
  pCanvas.height = 32;
  const pCtx = pCanvas.getContext('2d');
  const radGrad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
  radGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  radGrad.addColorStop(0.35, 'rgba(56, 189, 248, 0.7)');
  radGrad.addColorStop(0.7, 'rgba(99, 102, 241, 0.25)');
  radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  pCtx.fillStyle = radGrad;
  pCtx.fillRect(0, 0, 32, 32);
  const particleTexture = new THREE.CanvasTexture(pCanvas);

  // -------------------------------------------------------------
  // 1. Subtle Floating Stardust & Light Specks (1,600 Particles)
  // -------------------------------------------------------------
  const particleCount = 1600;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);
  const particleVelocities = [];

  const colorPalette = [
    new THREE.Color(0x38bdf8), // Cyan / Sky
    new THREE.Color(0x60a5fa), // Blue
    new THREE.Color(0xa78bfa), // Violet
    new THREE.Color(0xc084fc), // Soft Purple
    new THREE.Color(0xffffff)  // Pure White speck
  ];

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    particlePositions[i3] = (Math.random() - 0.5) * 160;
    particlePositions[i3 + 1] = (Math.random() - 0.5) * 110;
    particlePositions[i3 + 2] = (Math.random() - 0.5) * 120 - 10;

    const chosenColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    particleColors[i3] = chosenColor.r;
    particleColors[i3 + 1] = chosenColor.g;
    particleColors[i3 + 2] = chosenColor.b;

    particleVelocities.push({
      vx: (Math.random() - 0.5) * 0.015,
      vy: 0.01 + Math.random() * 0.02, // Gentle upward drift
      vz: (Math.random() - 0.5) * 0.01,
      baseY: particlePositions[i3 + 1]
    });
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 1.1,
    map: particleTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  // -------------------------------------------------------------
  // 2. Very Subtle Blue/Cyan Atmospheric Light Streaks (Curved Ribbons)
  // -------------------------------------------------------------
  const streakGroup = new THREE.Group();
  const streakCount = 5;

  for (let s = 0; s < streakCount; s++) {
    const points = [];
    const length = 55 + Math.random() * 30;
    const startX = (Math.random() - 0.5) * 80;
    const startY = (Math.random() - 0.5) * 60;
    const startZ = -15 - Math.random() * 25;

    for (let p = 0; p < 8; p++) {
      points.push(new THREE.Vector3(
        startX + (p * length / 7) + (Math.sin(p * 0.8) * 8),
        startY + (Math.cos(p * 0.6) * 6),
        startZ + (p * 2.5)
      ));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.12, 6, false);
    const streakMat = new THREE.MeshBasicMaterial({
      color: s % 2 === 0 ? 0x06b6d4 : 0x8b5cf6,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending
    });

    const streakMesh = new THREE.Mesh(tubeGeo, streakMat);
    streakMesh.userData = {
      driftSpeed: 0.0008 + Math.random() * 0.0012,
      baseX: startX,
      phase: s * 1.5
    };
    streakGroup.add(streakMesh);
  }

  scene.add(streakGroup);

  // -------------------------------------------------------------
  // 3. Smooth Mouse Parallax Tracking & Background Parallax
  // -------------------------------------------------------------
  let mouseX = 0;
  let mouseY = 0;
  let targetCamX = 0;
  let targetCamY = 0;
  let scrollY = 0;

  const heroBgParallax = document.getElementById('heroBgParallax');

  window.addEventListener('mousemove', function(e) {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

    targetCamX = mouseX * 4.5;
    targetCamY = mouseY * 3.5;

    // Parallax on the college building background: moves slightly in opposite direction
    if (heroBgParallax) {
      const moveX = -mouseX * 14; // Opposite direction, max 14px
      const moveY = mouseY * 12;  // Opposite direction, max 12px
      heroBgParallax.style.transform = `translate3d(${moveX.toFixed(1)}px, ${moveY.toFixed(1)}px, 0)`;
    }
  }, { passive: true });

  window.addEventListener('scroll', function() {
    scrollY = window.scrollY || document.documentElement.scrollTop;
  }, { passive: true });

  window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  });

  // -------------------------------------------------------------
  // 4. Smooth 60 FPS Render Loop
  // -------------------------------------------------------------
  const clock = new THREE.Clock();
  let isTabVisible = true;

  document.addEventListener('visibilitychange', function() {
    isTabVisible = !document.hidden;
  });

  function animate() {
    requestAnimationFrame(animate);
    if (!isTabVisible) return;

    const time = clock.getElapsedTime();

    // Smooth Camera lerping with mouse & scroll offset
    const scrollOffset = scrollY * 0.012;
    camera.position.x += (targetCamX - camera.position.x) * 0.04;
    camera.position.y += ((targetCamY - scrollOffset) - camera.position.y) * 0.04;
    camera.lookAt(targetCamX * 0.15, -scrollOffset * 0.25, 0);

    // Animate Soft Glowing Point Lights (Orbs)
    blueOrb.position.x = -20 + Math.sin(time * 0.6) * 5;
    blueOrb.position.y = 10 + Math.cos(time * 0.7) * 4;
    cyanOrb.position.x = 20 + Math.cos(time * 0.5) * 6;
    cyanOrb.position.y = -12 + Math.sin(time * 0.6) * 5;
    violetOrb.position.z = 5 + Math.sin(time * 0.8) * 4;

    // Upward Floating Particle Drift
    const pos = particleGeo.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const v = particleVelocities[i];
      pos[i3 + 1] += v.vy;

      // Wrap around when rising past bounds
      if (pos[i3 + 1] > 55) {
        pos[i3 + 1] = -55;
        pos[i3] = (Math.random() - 0.5) * 160;
      }
    }
    particleGeo.attributes.position.needsUpdate = true;

    // Subtle drift on light streaks
    streakGroup.children.forEach(mesh => {
      const ud = mesh.userData;
      mesh.position.y = Math.sin(time * 0.4 + ud.phase) * 2.5;
      mesh.rotation.z = Math.sin(time * 0.2 + ud.phase) * 0.03;
    });

    renderer.render(scene, camera);
  }

  animate();
  console.log('CampusConnect 3D Atmospheric Engine active.');
})();
