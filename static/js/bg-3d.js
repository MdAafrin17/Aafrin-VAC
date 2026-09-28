/**
 * CampusConnect Next-Gen 3D Background Engine
 * Futuristic Cybernetic Campus Monolith & Orbital Radar Architecture
 * 
 * Visual Architecture:
 * 1. Quantum Cyber Diamond Monolith: Multifaceted architectural crystal diamond with glowing edge vectors and inner prism nucleus (Zero DNA/twist shapes)
 * 2. Spatial HUD Tech Compass & Concentric Orbital Rings: 3 concentric circular rings with 8 revolving beacon nodes and spatial radar brackets
 * 3. Cyber Horizon Wave Grid with Dynamic Rising Data Columns: Undulating wireframe landscape with 12 pulsing horizon tech monoliths
 * 4. Floating Geometric Tech Polyhedra (Octahedrons, Dodecahedrons, Tetrahedrons) with edge glow
 * 5. Kinetic Stardust Swarm (2,500 particles) with Interactive Cursor Gravitational Wave
 * 6. High-Speed Shooting Neon Data Comets with luminous trailing tails
 * 
 * Performance & Integration:
 * - 100% Background Execution (z-index: 1, pointer-events: none)
 * - Seamless integration with uploaded college building photo and dark glassmorphic cards
 * - Silky smooth 60 FPS WebGL rendering with camera mouse parallax and scroll tracking
 */
(function() {
  'use strict';

  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded. 3D graphics background disabled.');
    return;
  }

  const canvas = document.getElementById('bg3dCanvas');
  if (!canvas) return;

  // Scene & Camera Setup
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05070D, 0.009);

  const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 48);

  // WebGL Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));

  // Dynamic Lighting Setup (Cyber Neon Matrix)
  const ambientLight = new THREE.AmbientLight(0x1e1b4b, 2.8);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0x818cf8, 2.6);
  keyLight.position.set(25, 35, 25);
  scene.add(keyLight);

  const cyanLight = new THREE.PointLight(0x00f5ff, 4.8, 120);
  cyanLight.position.set(-25, -2, 22);
  scene.add(cyanLight);

  const purpleLight = new THREE.PointLight(0xa855f7, 5.0, 120);
  purpleLight.position.set(26, 14, 20);
  scene.add(purpleLight);

  const fuchsiaLight = new THREE.PointLight(0xf43f5e, 3.8, 100);
  fuchsiaLight.position.set(0, 18, 14);
  scene.add(fuchsiaLight);

  const goldLight = new THREE.PointLight(0xfbbf24, 2.8, 90);
  goldLight.position.set(-18, 22, -10);
  scene.add(goldLight);

  // High-Quality Circular Glowing Particle Disc Texture
  const pCanvas = document.createElement('canvas');
  pCanvas.width = 64;
  pCanvas.height = 64;
  const pCtx = pCanvas.getContext('2d');
  const radGrad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
  radGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  radGrad.addColorStop(0.2, 'rgba(0, 245, 255, 0.95)');
  radGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.55)');
  radGrad.addColorStop(0.8, 'rgba(244, 63, 94, 0.2)');
  radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  pCtx.fillStyle = radGrad;
  pCtx.fillRect(0, 0, 64, 64);
  const particleDiscTexture = new THREE.CanvasTexture(pCanvas);

  // Vibrant Cyber Palette
  const palette = [
    new THREE.Color(0x00f5ff), // Electric Cyan
    new THREE.Color(0x38bdf8), // Sky Blue
    new THREE.Color(0x818cf8), // Indigo
    new THREE.Color(0xa855f7), // Vibrant Violet
    new THREE.Color(0xec4899), // Hot Fuchsia
    new THREE.Color(0x34d399), // Cyber Emerald
    new THREE.Color(0xfbbf24)  // Golden Aura
  ];

  // Root Master Group
  const masterGroup = new THREE.Group();
  scene.add(masterGroup);

  // =========================================================================
  // 1. CENTERPIECE: QUANTUM CYBER DIAMOND MONOLITH (Architectural, No DNA)
  // =========================================================================
  const monolithCenter = new THREE.Group();
  monolithCenter.position.set(19, 5, 0); // Elegantly frames right hero area
  masterGroup.add(monolithCenter);

  // 1.1 Outer Geodesic Tech Sphere (Wireframe Shield)
  const sphereGeo = new THREE.IcosahedronGeometry(11.8, 2);
  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0x00f5ff,
    wireframe: true,
    transparent: true,
    opacity: 0.45,
    roughness: 0.1,
    metalness: 0.9
  });
  const techSphere = new THREE.Mesh(sphereGeo, sphereMat);
  monolithCenter.add(techSphere);

  // Glowing Vertex Beacons on the Geodesic Sphere
  const sphereVerts = sphereGeo.attributes.position;
  const sphereVertGeo = new THREE.BufferGeometry();
  sphereVertGeo.setAttribute('position', sphereVerts);
  const sphereVertMat = new THREE.PointsMaterial({
    size: 1.6,
    map: particleDiscTexture,
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const spherePoints = new THREE.Points(sphereVertGeo, sphereVertMat);
  monolithCenter.add(spherePoints);

  // 1.2 Quantum Cyber Diamond Crystal (Replaces any twisted/DNA geometry)
  // Outer Faceted Diamond (Double Pyramid Octahedron)
  const diamondGeo = new THREE.OctahedronGeometry(6.6, 0);
  const diamondMat = new THREE.MeshStandardMaterial({
    color: 0x8b5cf6,
    emissive: 0x1e1b4b,
    roughness: 0.12,
    metalness: 0.92,
    transparent: true,
    opacity: 0.72,
    wireframe: false
  });
  const diamondMesh = new THREE.Mesh(diamondGeo, diamondMat);
  monolithCenter.add(diamondMesh);

  // Glowing Edge Vectors on Diamond
  const diamondEdges = new THREE.EdgesGeometry(diamondGeo);
  const diamondEdgeMat = new THREE.LineBasicMaterial({
    color: 0x00f5ff,
    linewidth: 2,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
  });
  const diamondEdgeLines = new THREE.LineSegments(diamondEdges, diamondEdgeMat);
  monolithCenter.add(diamondEdgeLines);

  // Inner Prismatic Core (Nested Icosahedron)
  const innerPrismGeo = new THREE.IcosahedronGeometry(4.4, 0);
  const innerPrismMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    wireframe: true,
    transparent: true,
    opacity: 0.65,
    roughness: 0.1
  });
  const innerPrism = new THREE.Mesh(innerPrismGeo, innerPrismMat);
  monolithCenter.add(innerPrism);

  // Central Glowing Nucleus
  const coreNucleus = new THREE.Mesh(
    new THREE.OctahedronGeometry(2.2, 0),
    new THREE.MeshStandardMaterial({
      color: 0x00f5ff,
      emissive: 0x00f5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    })
  );
  monolithCenter.add(coreNucleus);

  // =========================================================================
  // 2. CONCENTRIC ORBITAL RADAR RINGS & REVOLVING BEACONS
  // =========================================================================
  // Ring 1: Inner Cyan Orbital Ring
  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(15.5, 0.2, 16, 120),
    new THREE.MeshStandardMaterial({
      color: 0x00f5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
      roughness: 0.2
    })
  );
  ring1.rotation.x = Math.PI / 3.4;
  monolithCenter.add(ring1);

  // 8 Revolving Satellite Beacons on Ring 1
  const satGroup = new THREE.Group();
  ring1.add(satGroup);
  const satCount = 8;
  const satNodes = [];
  for (let i = 0; i < satCount; i++) {
    const satMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.75, 0),
      new THREE.MeshStandardMaterial({
        color: 0x00f5ff,
        emissive: 0x38bdf8,
        roughness: 0.2,
        metalness: 0.8
      })
    );
    const angle = (i / satCount) * Math.PI * 2;
    satMesh.position.set(Math.cos(angle) * 15.5, Math.sin(angle) * 15.5, 0);
    satGroup.add(satMesh);
    satNodes.push(satMesh);
  }

  // Ring 2: Middle Neon Violet Orbital Ring
  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(19.8, 0.16, 16, 120),
    new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
      roughness: 0.2
    })
  );
  ring2.rotation.y = Math.PI / 2.6;
  ring2.rotation.z = Math.PI / 5;
  monolithCenter.add(ring2);

  // Ring 3: Outer Hot Fuchsia Halo Ring
  const ring3 = new THREE.Mesh(
    new THREE.TorusGeometry(24.2, 0.13, 16, 120),
    new THREE.MeshStandardMaterial({
      color: 0xec4899,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
      roughness: 0.2
    })
  );
  ring3.rotation.x = -Math.PI / 4;
  ring3.rotation.z = Math.PI / 3.2;
  monolithCenter.add(ring3);

  // Spatial HUD Radar Arc Brackets on Outer Perimeter
  const hudArcCount = 4;
  const hudArcs = [];
  for (let i = 0; i < hudArcCount; i++) {
    const arcGeo = new THREE.RingGeometry(25.5, 26.2, 32, 1, (i * Math.PI / 2) + 0.2, (Math.PI / 2) - 0.4);
    const arcMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending
    });
    const arcMesh = new THREE.Mesh(arcGeo, arcMat);
    monolithCenter.add(arcMesh);
    hudArcs.push(arcMesh);
  }

  // =========================================================================
  // 3. CYBER HORIZON WAVE GRID & RISING DATA COLUMNS
  // =========================================================================
  const gridWidth = 160;
  const gridHeight = 160;
  const gridSegments = 42;
  const gridGeo = new THREE.PlaneGeometry(gridWidth, gridHeight, gridSegments, gridSegments);
  gridGeo.rotateX(-Math.PI / 2.3);
  const gridPosAttr = gridGeo.attributes.position;
  const origGridPos = new Float32Array(gridPosAttr.count * 3);
  for (let i = 0; i < gridPosAttr.count * 3; i++) {
    origGridPos[i] = gridPosAttr.array[i];
  }
  const gridMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: true,
    transparent: true,
    opacity: 0.35
  });
  const gridMesh = new THREE.Mesh(gridGeo, gridMat);
  gridMesh.position.set(0, -18, -4);
  masterGroup.add(gridMesh);

  // 12 Rising Horizon Tech Columns / Data Pillars
  const monolithCount = 14;
  const monoliths = [];
  for (let i = 0; i < monolithCount; i++) {
    const height = 9 + Math.random() * 20;
    const mGeo = new THREE.BoxGeometry(2.4, height, 2.4);
    const mMat = new THREE.MeshStandardMaterial({
      color: i % 2 === 0 ? 0x00f5ff : 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
      roughness: 0.2,
      metalness: 0.8
    });
    const mMesh = new THREE.Mesh(mGeo, mMat);
    const x = (Math.random() - 0.5) * 85;
    const z = -25 - Math.random() * 30;
    mMesh.position.set(x, -18 + height / 2, z);
    mMesh.userData = {
      baseY: -18 + height / 2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.9 + Math.random() * 0.7
    };
    masterGroup.add(mMesh);
    monoliths.push(mMesh);
  }

  // =========================================================================
  // 4. FLOATING GEOMETRIC TECH CRYSTALS (Clean Architectural Facets)
  // =========================================================================
  const floatingShapes = [];
  const crystalConfigs = [
    { geo: new THREE.OctahedronGeometry(3.0, 0), pos: [-32, 14, 6], color: 0x00f5ff, speed: { x: 0.008, y: 0.012 }, amp: 1.8, phase: 0 },
    { geo: new THREE.TetrahedronGeometry(3.4, 0), pos: [-36, -7, 8], color: 0x818cf8, speed: { x: -0.01, y: 0.007 }, amp: 2.2, phase: 1.2 },
    { geo: new THREE.DodecahedronGeometry(2.8, 0), pos: [34, -10, 4], color: 0xa855f7, speed: { x: 0.011, y: -0.009 }, amp: 1.6, phase: 2.4 },
    { geo: new THREE.IcosahedronGeometry(2.2, 0), pos: [-16, 20, -5], color: 0x38bdf8, speed: { x: -0.006, y: -0.011 }, amp: 1.9, phase: 3.6 },
    { geo: new THREE.OctahedronGeometry(2.5, 0), pos: [12, -15, 10], color: 0xec4899, speed: { x: 0.009, y: 0.013 }, amp: 1.7, phase: 4.8 },
    { geo: new THREE.TetrahedronGeometry(2.6, 0), pos: [36, 18, -2], color: 0xfbbf24, speed: { x: 0.008, y: -0.007 }, amp: 1.5, phase: 5.5 }
  ];

  crystalConfigs.forEach(cfg => {
    const cMat = new THREE.MeshStandardMaterial({
      color: cfg.color,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
      roughness: 0.2,
      metalness: 0.8
    });
    const cMesh = new THREE.Mesh(cfg.geo, cMat);
    cMesh.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);

    // Add glowing edges
    const cEdges = new THREE.EdgesGeometry(cfg.geo);
    const cEdgeMesh = new THREE.LineSegments(cEdges, new THREE.LineBasicMaterial({
      color: cfg.color,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    }));
    cMesh.add(cEdgeMesh);

    cMesh.userData = {
      baseY: cfg.pos[1],
      rotSpeed: cfg.speed,
      amp: cfg.amp,
      phase: cfg.phase
    };
    masterGroup.add(cMesh);
    floatingShapes.push(cMesh);
  });

  // =========================================================================
  // 5. KINETIC STARDUST SWARM (2,500 Particles with Cursor Gravitational Wave)
  // =========================================================================
  const starCount = 2500;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  const starOrigPos = new Float32Array(starCount * 3);
  const starCols = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    const x = (Math.random() - 0.5) * 190;
    const y = (Math.random() - 0.5) * 140;
    const z = (Math.random() - 0.5) * 160 - 10;

    starPos[i3] = x;
    starPos[i3 + 1] = y;
    starPos[i3 + 2] = z;

    starOrigPos[i3] = x;
    starOrigPos[i3 + 1] = y;
    starOrigPos[i3 + 2] = z;

    const chosenColor = palette[Math.floor(Math.random() * palette.length)];
    starCols[i3] = chosenColor.r;
    starCols[i3 + 1] = chosenColor.g;
    starCols[i3 + 2] = chosenColor.b;
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starCols, 3));

  const starMat = new THREE.PointsMaterial({
    size: 1.45,
    map: particleDiscTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.78,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const starSystem = new THREE.Points(starGeo, starMat);
  scene.add(starSystem);

  // =========================================================================
  // 6. SHOOTING NEON DATA COMETS
  // =========================================================================
  const cometCount = 6;
  const comets = [];
  for (let i = 0; i < cometCount; i++) {
    const cHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.95 })
    );
    const trailGeo = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(15 * 3);
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const cTrail = new THREE.Line(trailGeo, trailMat);

    const cGroup = new THREE.Group();
    cGroup.add(cHead);
    cGroup.add(cTrail);
    scene.add(cGroup);

    comets.push({
      group: cGroup,
      head: cHead,
      trail: cTrail,
      history: [],
      x: -70 - Math.random() * 50,
      y: 35 + Math.random() * 30,
      z: -10 + Math.random() * 30,
      vx: 0.8 + Math.random() * 0.6,
      vy: -(0.4 + Math.random() * 0.35)
    });
  }

  // =========================================================================
  // INTERACTIVE CURSOR & SCROLL TRACKING
  // =========================================================================
  let mouseX = 0;
  let mouseY = 0;
  let targetCamX = 0;
  let targetCamY = 2;
  let scrollY = window.scrollY || 0;
  let isTabVisible = true;

  let normMouseX = 0;
  let normMouseY = 0;

  window.addEventListener('mousemove', (e) => {
    const halfW = window.innerWidth / 2;
    const halfH = window.innerHeight / 2;
    normMouseX = (e.clientX - halfW) / halfW;
    normMouseY = -(e.clientY - halfH) / halfH;

    mouseX = e.clientX - halfW;
    mouseY = e.clientY - halfH;

    targetCamX = (mouseX / halfW) * 4.5;
    targetCamY = -(mouseY / halfH) * 2.5 + 2;

    // Counter-parallax on college building background
    const heroBg = document.getElementById('heroBgParallax');
    if (heroBg) {
      const offsetX = -mouseX * 0.022;
      const offsetY = -mouseY * 0.022;
      heroBg.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
    }
  }, { passive: true });

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY || 0;
  }, { passive: true });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  });

  document.addEventListener('visibilitychange', () => {
    isTabVisible = !document.hidden;
  });

  // =========================================================================
  // ANIMATION LOOP (60 FPS FLUID WEBGL)
  // =========================================================================
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    if (!isTabVisible) return;

    const time = clock.getElapsedTime();

    // 1. Smooth Camera Lerping
    const scrollOffset = scrollY * 0.018;
    camera.position.x += (targetCamX - camera.position.x) * 0.045;
    camera.position.y += ((targetCamY - scrollOffset) - camera.position.y) * 0.045;
    camera.lookAt(targetCamX * 0.25, -scrollOffset * 0.3, 0);

    // Dynamic Point Light Orbiting
    cyanLight.position.x = Math.sin(time * 0.7) * 28;
    cyanLight.position.z = Math.cos(time * 0.7) * 22;
    purpleLight.position.y = 12 + Math.cos(time * 0.6) * 8;
    fuchsiaLight.position.x = Math.cos(time * 0.5) * 24;

    // 2. Centerpiece Animations (Architectural Diamond & Rings)
    // Rotate Geodesic Sphere
    techSphere.rotation.y = time * 0.07;
    techSphere.rotation.x = Math.sin(time * 0.05) * 0.18;
    spherePoints.rotation.y = techSphere.rotation.y;
    spherePoints.rotation.x = techSphere.rotation.x;

    // Rotate Cyber Diamond Monolith (Clean angular rotation, no twisting)
    diamondMesh.rotation.y = time * 0.25;
    diamondMesh.rotation.x = time * 0.15;
    diamondEdgeLines.rotation.y = diamondMesh.rotation.y;
    diamondEdgeLines.rotation.x = diamondMesh.rotation.x;

    // Rotate Inner Prismatic Core
    innerPrism.rotation.y = -time * 0.35;
    innerPrism.rotation.z = time * 0.2;

    // Pulse Central Nucleus
    coreNucleus.rotation.x = time * 0.4;
    coreNucleus.rotation.y = -time * 0.45;
    const nScale = 1.0 + Math.sin(time * 2.5) * 0.18;
    coreNucleus.scale.set(nScale, nScale, nScale);

    // Rotate Concentric Rings
    ring1.rotation.z = time * 0.16;
    ring2.rotation.z = -time * 0.12;
    ring3.rotation.y = time * 0.09;

    // Satellites revolve along Ring 1
    satGroup.rotation.z = time * 0.45;
    satNodes.forEach(sat => {
      sat.rotation.x += 0.02;
      sat.rotation.y += 0.03;
    });

    // Rotate HUD Radar Arc Brackets
    hudArcs.forEach((arc, idx) => {
      arc.rotation.z = (idx % 2 === 0 ? 1 : -1) * time * 0.08;
    });

    // Gentle Vertical Floating of Monolith Center
    monolithCenter.position.y = 5 + Math.sin(time * 0.9) * 1.5;

    // 3. Undulate Cyber Wave Grid
    const gPos = gridGeo.attributes.position;
    for (let i = 0; i < gPos.count; i++) {
      const u = origGridPos[i * 3];
      const v = origGridPos[i * 3 + 1];
      const w1 = Math.sin(u * 0.07 + time * 1.4) * 2.2;
      const w2 = Math.cos(v * 0.07 + time * 1.1) * 1.8;
      gPos.array[i * 3 + 2] = origGridPos[i * 3 + 2] + w1 + w2;
    }
    gPos.needsUpdate = true;

    // Pulse Horizon Monoliths
    monoliths.forEach(m => {
      const ud = m.userData;
      m.position.y = ud.baseY + Math.sin(time * ud.speed + ud.phase) * 2.8;
    });

    // 4. Animate Floating Geometric Crystals
    floatingShapes.forEach(mesh => {
      const ud = mesh.userData;
      mesh.rotation.x += ud.rotSpeed.x;
      mesh.rotation.y += ud.rotSpeed.y;
      mesh.position.y = ud.baseY + Math.sin(time * 1.2 + ud.phase) * ud.amp;
    });

    // 5. Kinetic Stardust Swarm with Cursor Gravitational Wave
    const sPosArr = starGeo.attributes.position.array;
    const mousePlaneX = normMouseX * 50;
    const mousePlaneY = normMouseY * 35;

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const ox = starOrigPos[i3];
      const oy = starOrigPos[i3 + 1];

      const driftX = Math.sin(time * 0.4 + i * 0.1) * 0.8;
      const driftY = Math.cos(time * 0.4 + i * 0.1) * 0.8;

      const dx = (ox + driftX) - mousePlaneX;
      const dy = (oy + driftY) - mousePlaneY;
      const dSq = dx * dx + dy * dy;

      if (dSq < 280) {
        const force = (1 - dSq / 280) * 4.0;
        sPosArr[i3] += (ox + (dx / (Math.sqrt(dSq) + 0.1)) * force - sPosArr[i3]) * 0.12;
        sPosArr[i3 + 1] += (oy + (dy / (Math.sqrt(dSq) + 0.1)) * force - sPosArr[i3 + 1]) * 0.12;
      } else {
        sPosArr[i3] += ((ox + driftX) - sPosArr[i3]) * 0.05;
        sPosArr[i3 + 1] += ((oy + driftY) - sPosArr[i3 + 1]) * 0.05;
      }
    }
    starGeo.attributes.position.needsUpdate = true;
    starSystem.rotation.y = time * 0.012;

    // 6. Shooting Neon Data Comets
    comets.forEach(c => {
      c.x += c.vx;
      c.y += c.vy;
      c.group.position.set(c.x, c.y, c.z);

      c.history.unshift({ x: c.x, y: c.y, z: c.z });
      if (c.history.length > 15) c.history.pop();

      const tPos = c.trail.geometry.attributes.position.array;
      for (let k = 0; k < c.history.length; k++) {
        tPos[k * 3] = c.history[k].x - c.x;
        tPos[k * 3 + 1] = c.history[k].y - c.y;
        tPos[k * 3 + 2] = c.history[k].z - c.z;
      }
      c.trail.geometry.attributes.position.needsUpdate = true;

      if (c.x > 80 || c.y < -40) {
        c.x = -80 - Math.random() * 40;
        c.y = 40 + Math.random() * 25;
        c.z = -15 + Math.random() * 30;
        c.history = [];
      }
    });

    renderer.render(scene, camera);
  }

  animate();
  console.log('CampusConnect Cyber Diamond 3D Background Engine active.');
})();
