/**
 * CampusConnect — Advanced 3D Login Gateway Engine
 * Holographic Quantum Campus Core & Interactive 3D Spatial Environment
 * Powered by Three.js
 */

(function () {
  'use strict';

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', initLogin3DExperience);

  function initLogin3DExperience() {
    const canvas = document.getElementById('login3dCanvas');
    if (!canvas || typeof THREE === 'undefined') {
      console.warn('Three.js or login3dCanvas not found. 3D engine disabled.');
      return;
    }

    // -------------------------------------------------------------------------
    // 1. SCENE, CAMERA & RENDERER
    // -------------------------------------------------------------------------
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050814, 0.011);

    const camera = new THREE.PerspectiveCamera(
      48,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 48);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // -------------------------------------------------------------------------
    // 2. DYNAMIC LIGHTING
    // -------------------------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0x1e1b4b, 2.2);
    scene.add(ambientLight);

    const keyCyanLight = new THREE.PointLight(0x00f5ff, 4.5, 120);
    keyCyanLight.position.set(-20, 15, 30);
    scene.add(keyCyanLight);

    const purpleLight = new THREE.PointLight(0x8b5cf6, 4.0, 120);
    purpleLight.position.set(22, -12, 28);
    scene.add(purpleLight);

    const centerPulseLight = new THREE.PointLight(0x38bdf8, 3.0, 60);
    centerPulseLight.position.set(0, 0, 0);
    scene.add(centerPulseLight);

    // -------------------------------------------------------------------------
    // 3. THE 3D HOLOGRAPHIC CAMPUS CORE (Quantum Nexus)
    // -------------------------------------------------------------------------
    const nexusGroup = new THREE.Group();
    // Offset slightly toward the left on desktop for balanced composition
    if (window.innerWidth >= 992) {
      nexusGroup.position.set(-8, 0, 0);
    } else {
      nexusGroup.position.set(0, 3, 0);
    }
    scene.add(nexusGroup);

    // Inner glowing faceted icosahedron
    const innerIcosaGeo = new THREE.IcosahedronGeometry(6.2, 1);
    const innerIcosaMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.65,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.82,
      wireframe: false
    });
    const innerIcosaMesh = new THREE.Mesh(innerIcosaGeo, innerIcosaMat);
    nexusGroup.add(innerIcosaMesh);

    // Wireframe overlay on the icosahedron
    const wireIcosaMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const wireIcosaMesh = new THREE.Mesh(innerIcosaGeo, wireIcosaMat);
    nexusGroup.add(wireIcosaMesh);

    // Outer cybernetic Dodecahedron cage
    const dodecaGeo = new THREE.DodecahedronGeometry(9.2, 0);
    const dodecaEdges = new THREE.EdgesGeometry(dodecaGeo);
    const dodecaLineMat = new THREE.LineBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.65,
      linewidth: 1.5
    });
    const dodecaLines = new THREE.LineSegments(dodecaEdges, dodecaLineMat);
    nexusGroup.add(dodecaLines);

    // Glowing beacons on Dodecahedron vertices
    const dodecaVerts = dodecaGeo.attributes.position;
    const vertexPointsGeo = new THREE.BufferGeometry();
    vertexPointsGeo.setAttribute('position', dodecaVerts);

    const pointTexture = createGlowTexture();
    const vertexPointsMat = new THREE.PointsMaterial({
      size: 1.6,
      map: pointTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      color: 0x00f5ff,
      depthWrite: false
    });
    const vertexPointsMesh = new THREE.Points(vertexPointsGeo, vertexPointsMat);
    nexusGroup.add(vertexPointsMesh);

    // Central pulsing energy nucleus
    const coreSphereGeo = new THREE.SphereGeometry(2.8, 32, 32);
    const coreSphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const coreSphere = new THREE.Mesh(coreSphereGeo, coreSphereMat);
    nexusGroup.add(coreSphere);

    // -------------------------------------------------------------------------
    // 4. CONCENTRIC ORBITAL CYBER RINGS
    // -------------------------------------------------------------------------
    const ringGroup = new THREE.Group();
    nexusGroup.add(ringGroup);

    // Ring 1 (Inner Fast Cyan Ring)
    const ring1Geo = new THREE.TorusGeometry(12.5, 0.08, 16, 120);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.75
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1Mesh.rotation.x = Math.PI / 3;
    ringGroup.add(ring1Mesh);

    // Satellite beacons on Ring 1
    const satellitesGroup = new THREE.Group();
    ringGroup.add(satellitesGroup);

    const satGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const satMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      blending: THREE.AdditiveBlending
    });
    const satellites = [];
    const numSats = 4;
    for (let i = 0; i < numSats; i++) {
      const sat = new THREE.Mesh(satGeo, satMat);
      satellitesGroup.add(sat);
      satellites.push({
        mesh: sat,
        orbitRadius: 12.5,
        speed: 0.02 + i * 0.005,
        angle: (i * (Math.PI * 2)) / numSats,
        tiltX: Math.PI / 3
      });
    }

    // Ring 2 (Middle Indigo Ring, counter-rotating)
    const ring2Geo = new THREE.TorusGeometry(16.5, 0.07, 16, 140);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.55
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.x = -Math.PI / 4;
    ring2Mesh.rotation.y = Math.PI / 6;
    ringGroup.add(ring2Mesh);

    // Ring 3 (Outer Radar Spatial Ring with Segmented Brackets)
    const ring3Geo = new THREE.RingGeometry(20.5, 20.7, 64);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const ring3Mesh = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3Mesh.rotation.x = Math.PI / 2.5;
    ringGroup.add(ring3Mesh);

    // -------------------------------------------------------------------------
    // 5. FLOATING GEOMETRIC DATA SHARDS (Drifting Polyhedra)
    // -------------------------------------------------------------------------
    const shardsGroup = new THREE.Group();
    nexusGroup.add(shardsGroup);

    const shardMaterials = [
      new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.3,
        metalness: 0.8,
        wireframe: true,
        transparent: true,
        opacity: 0.5
      }),
      new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        roughness: 0.3,
        metalness: 0.8,
        wireframe: true,
        transparent: true,
        opacity: 0.5
      })
    ];

    const shards = [];
    for (let i = 0; i < 14; i++) {
      const isOcta = i % 2 === 0;
      const shardGeo = isOcta
        ? new THREE.OctahedronGeometry(1.2 + Math.random() * 0.8, 0)
        : new THREE.TetrahedronGeometry(1.3 + Math.random() * 0.7, 0);

      const shardMesh = new THREE.Mesh(
        shardGeo,
        shardMaterials[i % shardMaterials.length]
      );

      const distance = 16 + Math.random() * 18;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 24;

      shardMesh.position.set(
        Math.cos(angle) * distance,
        height,
        Math.sin(angle) * distance
      );

      shardsGroup.add(shardMesh);
      shards.push({
        mesh: shardMesh,
        rotSpeedX: (Math.random() - 0.5) * 0.02,
        rotSpeedY: (Math.random() - 0.5) * 0.025,
        rotSpeedZ: (Math.random() - 0.5) * 0.015,
        orbitSpeed: (Math.random() * 0.004 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
        angle: angle,
        distance: distance,
        baseY: height,
        floatPhase: Math.random() * Math.PI * 2
      });
    }

    // -------------------------------------------------------------------------
    // 6. KINETIC PARTICLE NEBULA & CONSTELLATION FIELD (1,200 Nodes)
    // -------------------------------------------------------------------------
    const particleCount = 1200;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      const pIndex = i * 3;
      particlePositions[pIndex] = (Math.random() - 0.5) * 110;
      particlePositions[pIndex + 1] = (Math.random() - 0.5) * 90;
      particlePositions[pIndex + 2] = (Math.random() - 0.5) * 70;

      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
      });
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(particlePositions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      size: 1.4,
      map: pointTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      color: 0x38bdf8,
      depthWrite: false,
      opacity: 0.75
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // -------------------------------------------------------------------------
    // 7. INTERACTIVE MOUSE PARALLAX & FORM SENSORS
    // -------------------------------------------------------------------------
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 0;
    let targetCameraZ = 48;
    let currentCameraZ = 48;

    let targetRotNexusX = 0;
    let targetRotNexusY = 0;

    // Interaction states
    let isEmailFocused = false;
    let isPasswordFocused = false;
    let pulseWaveIntensity = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      mouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

      targetCameraX = mouseX * 4;
      targetCameraY = -mouseY * 3;

      targetRotNexusX = mouseY * 0.35;
      targetRotNexusY = mouseX * 0.45;
    });

    // Form inputs reaction hooks
    const emailInput = document.querySelector('input[name="email"]');
    const pwdInput = document.querySelector('input[name="password"]');

    if (emailInput) {
      emailInput.addEventListener('focus', () => {
        isEmailFocused = true;
        targetCameraZ = 42; // Zoom in slightly
      });
      emailInput.addEventListener('blur', () => {
        isEmailFocused = false;
        targetCameraZ = 48;
      });
    }

    if (pwdInput) {
      pwdInput.addEventListener('focus', () => {
        isPasswordFocused = true;
        targetCameraZ = 44;
      });
      pwdInput.addEventListener('blur', () => {
        isPasswordFocused = false;
        targetCameraZ = 48;
      });
    }

    // Global pulse trigger (e.g. on demo login button click or typing)
    window.trigger3DGatewayPulse = function () {
      pulseWaveIntensity = 1.0;
    };

    // Card 3D tilt tracking
    initCard3DTilt();

    // -------------------------------------------------------------------------
    // 8. ANIMATION LOOP (60 FPS with Battery Saving)
    // -------------------------------------------------------------------------
    let isTabVisible = true;
    document.addEventListener('visibilitychange', () => {
      isTabVisible = !document.hidden;
    });

    let clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      if (!isTabVisible) return;

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Camera lerp tracking
      camera.position.x += (targetCameraX - camera.position.x) * 0.05;
      camera.position.y += (targetCameraY - camera.position.y) * 0.05;
      currentCameraZ += (targetCameraZ - currentCameraZ) * 0.05;
      camera.position.z = currentCameraZ;
      camera.lookAt(nexusGroup.position.x * 0.3, 0, 0);

      // Core rotation
      const speedMultiplier = isEmailFocused ? 1.8 : 1.0;
      innerIcosaMesh.rotation.y += 0.008 * speedMultiplier;
      innerIcosaMesh.rotation.x += 0.004 * speedMultiplier;

      wireIcosaMesh.rotation.y = innerIcosaMesh.rotation.y;
      wireIcosaMesh.rotation.x = innerIcosaMesh.rotation.x;

      dodecaLines.rotation.y -= 0.005 * speedMultiplier;
      dodecaLines.rotation.z += 0.003 * speedMultiplier;
      vertexPointsMesh.rotation.copy(dodecaLines.rotation);

      // Pulse nucleus breathing animation
      const pulseScale = 1.0 + Math.sin(time * 3) * 0.12 + pulseWaveIntensity * 0.4;
      coreSphere.scale.set(pulseScale, pulseScale, pulseScale);

      if (pulseWaveIntensity > 0) {
        pulseWaveIntensity -= 0.02;
        if (pulseWaveIntensity < 0) pulseWaveIntensity = 0;
        centerPulseLight.intensity = 3.0 + pulseWaveIntensity * 5.0;
      }

      // Security Shield mode when Password is focused
      if (isPasswordFocused) {
        ring1Mesh.rotation.z += 0.04;
        ring2Mesh.rotation.z -= 0.035;
        ring3Mesh.rotation.z += 0.02;
        purpleLight.intensity = 5.5;
        keyCyanLight.intensity = 2.5;
      } else {
        ring1Mesh.rotation.z += 0.012;
        ring2Mesh.rotation.z -= 0.009;
        ring3Mesh.rotation.z += 0.004;
        purpleLight.intensity = 4.0;
        keyCyanLight.intensity = 4.5;
      }

      // Update Satellites along Ring 1
      satellites.forEach((sat) => {
        sat.angle += sat.speed * speedMultiplier;
        const x = Math.cos(sat.angle) * sat.orbitRadius;
        const y = Math.sin(sat.angle) * sat.orbitRadius * Math.cos(sat.tiltX);
        const z = Math.sin(sat.angle) * sat.orbitRadius * Math.sin(sat.tiltX);
        sat.mesh.position.set(x, y, z);
      });

      // Update Shards
      shards.forEach((shard) => {
        shard.angle += shard.orbitSpeed;
        shard.mesh.position.x = Math.cos(shard.angle) * shard.distance;
        shard.mesh.position.z = Math.sin(shard.angle) * shard.distance;
        shard.mesh.position.y =
          shard.baseY + Math.sin(time * 1.5 + shard.floatPhase) * 1.5;

        shard.mesh.rotation.x += shard.rotSpeedX;
        shard.mesh.rotation.y += shard.rotSpeedY;
        shard.mesh.rotation.z += shard.rotSpeedZ;
      });

      // Update Constellation Particles
      const positions = particleGeometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] += particleVelocities[i].x;
        positions[i3 + 1] += particleVelocities[i].y;
        positions[i3 + 2] += particleVelocities[i].z;

        // Boundary wrap-around
        if (positions[i3] > 60) positions[i3] = -60;
        if (positions[i3] < -60) positions[i3] = 60;
        if (positions[i3 + 1] > 50) positions[i3 + 1] = -50;
        if (positions[i3 + 1] < -50) positions[i3 + 1] = 50;
      }
      particleGeometry.attributes.position.needsUpdate = true;

      // Group subtle sway
      nexusGroup.rotation.x += (targetRotNexusX - nexusGroup.rotation.x) * 0.03;
      nexusGroup.rotation.y += (targetRotNexusY - nexusGroup.rotation.y) * 0.03;

      renderer.render(scene, camera);
    }

    animate();

    // -------------------------------------------------------------------------
    // 9. WINDOW RESIZE HANDLING
    // -------------------------------------------------------------------------
    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Adjust position for desktop vs mobile
      if (width >= 992) {
        nexusGroup.position.set(-8, 0, 0);
      } else {
        nexusGroup.position.set(0, 3, 0);
      }
    });

    // Helper: Create circular radial glow particle texture
    function createGlowTexture() {
      const size = 64;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      const gradient = ctx.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.3, 'rgba(56, 189, 248, 0.85)');
      gradient.addColorStop(0.6, 'rgba(99, 102, 241, 0.4)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    }
  }

  // ---------------------------------------------------------------------------
  // 10. INTERACTIVE 3D PERSPECTIVE CARD TILT
  // ---------------------------------------------------------------------------
  function initCard3DTilt() {
    const card = document.querySelector('.login-3d-card');
    const wrapper = document.querySelector('.login-card-perspective-wrapper');
    if (!card || !wrapper) return;

    let bounds = wrapper.getBoundingClientRect();

    window.addEventListener('resize', () => {
      bounds = wrapper.getBoundingClientRect();
    });

    wrapper.addEventListener('mousemove', (e) => {
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;

      const xPct = (mouseX / bounds.width - 0.5) * 2;
      const yPct = (mouseY / bounds.height - 0.5) * 2;

      const rotX = -yPct * 8; // Max 8 degrees tilt
      const rotY = xPct * 8;

      card.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(10px)`;
      card.style.boxShadow = `
        ${-xPct * 15}px ${-yPct * 15 + 25}px 70px -15px rgba(0, 0, 0, 0.85),
        0 0 50px rgba(56, 189, 248, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.2)
      `;
    });

    wrapper.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
      card.style.boxShadow = `
        0 25px 70px -15px rgba(0, 0, 0, 0.85),
        0 0 40px rgba(56, 189, 248, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.15)
      `;
    });
  }
})();
