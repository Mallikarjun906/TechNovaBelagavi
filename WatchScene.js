import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function initWatchScene() {
  const container = document.getElementById('watch-canvas');
  if (!container) return;

  // SCENE SETUP
  const scene = new THREE.Scene();

  // CAMERA SETUP
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 8);

  // RENDERER SETUP
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  // CONTROLS
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;
  controls.minDistance = 3;
  controls.maxDistance = 15;
  controls.enablePan = false;

  // LIGHTING (Premium look)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0xffffff, 2);
  dirLight1.position.set(5, 5, 5);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x7c3aed, 1.5);
  dirLight2.position.set(-5, -5, -5);
  scene.add(dirLight2);

  const pointLight1 = new THREE.PointLight(0x00d4ff, 1);
  pointLight1.position.set(2, 2, 2);
  scene.add(pointLight1);

  // MATERIALS
  const matTitanium = new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 0.9,
    roughness: 0.3,
  });

  const matGold = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 1.0,
    roughness: 0.2,
  });
  
  const matRoseGold = new THREE.MeshStandardMaterial({
    color: 0xb76e79,
    metalness: 1.0,
    roughness: 0.2,
  });

  const matSteel = new THREE.MeshStandardMaterial({
    color: 0xaaaaaa,
    metalness: 1.0,
    roughness: 0.1,
  });

  const matSapphire = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.9, // glass-like
    thickness: 0.5,
    transparent: true,
    opacity: 1
  });

  const matDarkDial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    metalness: 0.8,
    roughness: 0.5,
  });

  const matRuby = new THREE.MeshPhysicalMaterial({
    color: 0xff0044,
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.8,
    transparent: true
  });

  const matLeather = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    metalness: 0.1,
    roughness: 0.9,
  });

  // WATCH GROUP
  const watchGroup = new THREE.Group();
  // Rotate so gravity/down is along -Y, but face points towards +Z
  watchGroup.rotation.x = -Math.PI / 8; // Slight tilt
  watchGroup.rotation.y = -Math.PI / 6;
  scene.add(watchGroup);

  const parts = [];
  let isExploded = false;

  // HELPER TO CREATE PARTS
  function createPart(geometry, material, partInfo, position, explodedOffset) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    mesh.userData = {
      ...partInfo,
      originalPosition: position.clone(),
      explodedPosition: position.clone().add(explodedOffset),
      isPart: true
    };

    watchGroup.add(mesh);
    parts.push(mesh);
    return mesh;
  }

  // 1. STRAP (Back and Front)
  const strapGeo = new THREE.BoxGeometry(1.2, 5, 0.1);
  createPart(strapGeo, matLeather, {
    name: "Alligator Leather Strap",
    desc: "Hand-stitched premium leather for maximum comfort.",
    mfr: "NEXUS",
    specs: "Material: Leather | Clasp: Titanium"
  }, new THREE.Vector3(0, 0, -0.4), new THREE.Vector3(0, 0, -3.0));

  // 2. CASE BACK (Exhibition)
  const caseBackGeo = new THREE.CylinderGeometry(1.3, 1.3, 0.1, 64);
  caseBackGeo.rotateX(Math.PI / 2);
  createPart(caseBackGeo, matTitanium, {
    name: "Titanium Case Back",
    desc: "Exhibition case back allowing view of the movement.",
    mfr: "NEXUS",
    specs: "Material: Grade 5 Titanium"
  }, new THREE.Vector3(0, 0, -0.3), new THREE.Vector3(0, 0, -2.0));

  // 3. MOVEMENT : ROTOR
  const rotorGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.05, 32, 1, false, 0, Math.PI);
  rotorGeo.rotateX(Math.PI / 2);
  const rotor = createPart(rotorGeo, matGold, {
    name: "Oscillating Weight (Rotor)",
    desc: "Winds the mainspring automatically using wrist motion.",
    mfr: "NEXUS Caliber 7",
    specs: "Material: 18k Gold | Winding: Bidirectional"
  }, new THREE.Vector3(0, 0, -0.2), new THREE.Vector3(0, 0, -1.2));

  // 4. MOVEMENT : MAINSPRING BARREL & GEARS
  const gear1Geo = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 16);
  gear1Geo.rotateX(Math.PI / 2);
  const gear1 = createPart(gear1Geo, matRoseGold, {
    name: "Mainspring Barrel",
    desc: "Stores energy for the watch mechanism.",
    mfr: "NEXUS",
    specs: "Power Reserve: 72 hours"
  }, new THREE.Vector3(-0.4, 0.4, -0.1), new THREE.Vector3(-1.0, 1.0, -0.6));

  const gear2Geo = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16);
  gear2Geo.rotateX(Math.PI / 2);
  const gear2 = createPart(gear2Geo, matSteel, {
    name: "Transmission Gear",
    desc: "Transfers energy from the barrel to the escapement.",
    mfr: "NEXUS",
    specs: "Material: Stainless Steel"
  }, new THREE.Vector3(0.3, -0.2, -0.1), new THREE.Vector3(0.8, -0.5, -0.6));

  // 5. MOVEMENT : TOURBILLON / BALANCE WHEEL
  const tourbillonGeo = new THREE.TorusGeometry(0.3, 0.02, 16, 32);
  const tourbillon = createPart(tourbillonGeo, matGold, {
    name: "Tourbillon Escapement",
    desc: "Counters the effects of gravity to ensure precision timing.",
    mfr: "NEXUS",
    specs: "Beat Rate: 28,800 BPH | Jewels: 25"
  }, new THREE.Vector3(0, -0.5, 0), new THREE.Vector3(0, -1.5, 0.2));

  // Add bridge to tourbillon
  const bridgeGeo = new THREE.BoxGeometry(0.8, 0.05, 0.05);
  const bridge = new THREE.Mesh(bridgeGeo, matTitanium);
  tourbillon.add(bridge);
  
  // Center jewel
  const jewelGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.06, 16);
  jewelGeo.rotateX(Math.PI / 2);
  const jewel = new THREE.Mesh(jewelGeo, matRuby);
  tourbillon.add(jewel);

  // 6. MAIN CASE & BEZEL
  const caseGeo = new THREE.TorusGeometry(1.4, 0.2, 32, 64);
  createPart(caseGeo, matTitanium, {
    name: "Titanium Outer Case",
    desc: "Aerospace-grade main chassis housing all internal components.",
    mfr: "NEXUS",
    specs: "Material: Grade 5 Titanium | Diameter: 42mm"
  }, new THREE.Vector3(0, 0, 0.1), new THREE.Vector3(0, 0, 0.4));

  // 7. CROWN
  const crownGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.2, 16);
  crownGeo.rotateZ(Math.PI / 2);
  createPart(crownGeo, matGold, {
    name: "Winding Crown",
    desc: "Used to set time and manually wind the mainspring.",
    mfr: "NEXUS",
    specs: "Water Resistance: 10 ATM"
  }, new THREE.Vector3(1.6, 0, 0.1), new THREE.Vector3(2.5, 0, 0.4));

  // 8. DIAL (Skeletonized)
  const dialGeo = new THREE.RingGeometry(1.0, 1.3, 64);
  createPart(dialGeo, matDarkDial, {
    name: "Skeleton Dial",
    desc: "Open-worked dial revealing the mechanical heart inside.",
    mfr: "NEXUS",
    specs: "Finish: Brushed Matte"
  }, new THREE.Vector3(0, 0, 0.2), new THREE.Vector3(0, 0, 1.2));

  // 9. HANDS
  const hourHandGeo = new THREE.BoxGeometry(0.06, 0.6, 0.02);
  const minuteHandGeo = new THREE.BoxGeometry(0.04, 0.9, 0.02);
  const secondHandGeo = new THREE.BoxGeometry(0.02, 1.0, 0.02);
  
  // Translate geometry so rotation happens at the base, not center
  hourHandGeo.translate(0, 0.3, 0);
  minuteHandGeo.translate(0, 0.45, 0);
  secondHandGeo.translate(0, 0.5, 0);

  const hourHand = createPart(hourHandGeo, matGold, {
    name: "Hour Hand",
    desc: "Indicates the current hour.",
    mfr: "NEXUS",
    specs: "Material: 18k Rose Gold"
  }, new THREE.Vector3(0, 0, 0.25), new THREE.Vector3(0, 0, 1.6));

  const minuteHand = createPart(minuteHandGeo, matGold, {
    name: "Minute Hand",
    desc: "Indicates the current minute.",
    mfr: "NEXUS",
    specs: "Material: 18k Rose Gold"
  }, new THREE.Vector3(0, 0, 0.28), new THREE.Vector3(0, 0, 1.8));

  const secondHand = createPart(secondHandGeo, matAccent, {
    name: "Sweep Second Hand",
    desc: "Continuously sweeps across the dial.",
    mfr: "NEXUS",
    specs: "Material: Blued Steel"
  }, new THREE.Vector3(0, 0, 0.31), new THREE.Vector3(0, 0, 2.0));

  // 10. SAPPHIRE CRYSTAL
  const glassGeo = new THREE.CylinderGeometry(1.35, 1.35, 0.1, 64);
  glassGeo.rotateX(Math.PI / 2);
  createPart(glassGeo, matSapphire, {
    name: "Sapphire Crystal",
    desc: "Scratch-resistant domed glass protecting the dial.",
    mfr: "NEXUS",
    specs: "Hardness: 9 Mohs | Coating: Anti-reflective"
  }, new THREE.Vector3(0, 0, 0.35), new THREE.Vector3(0, 0, 2.8));

  // RAYCASTING & INTERACTION
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const tooltip = document.getElementById('part-tooltip');

  function onPointerDown(event) {
    if (event.button !== 0) return; // Left click only

    const rect = container.getBoundingClientRect();
    const clientX = event.clientX;
    const clientY = event.clientY;

    mouse.x = ((clientX - rect.left) / container.clientWidth) * 2 - 1;
    mouse.y = -((clientY - rect.top) / container.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(parts, false);

    if (intersects.length > 0) {
      const clickedPart = intersects[0].object;
      const data = clickedPart.userData;

      // Update Tooltip
      if (tooltip) {
        document.getElementById('tooltip-name').textContent = data.name;
        document.getElementById('tooltip-desc').textContent = data.desc;
        document.getElementById('tooltip-mfr').textContent = data.mfr;
        document.getElementById('tooltip-specs').textContent = data.specs;

        tooltip.style.display = 'block';
        tooltip.style.left = (clientX + 15) + 'px';
        tooltip.style.top = (clientY + 15) + 'px';

        setTimeout(() => tooltip.style.display = 'none', 4000);
      }

      // Smooth camera pan to part using GSAP
      // Calculate a target camera position derived from the clicked part
      const partWorldPos = new THREE.Vector3();
      clickedPart.getWorldPosition(partWorldPos);
      
      const camOffset = new THREE.Vector3(0, 0, 4); // desired distance from part
      camOffset.applyQuaternion(camera.quaternion); // orient offset to current camera angle
      
      const targetCamPos = partWorldPos.clone().add(camOffset);

      gsap.to(camera.position, {
        x: targetCamPos.x,
        y: targetCamPos.y,
        z: targetCamPos.z,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => controls.update()
      });
      
      gsap.to(controls.target, {
        x: partWorldPos.x,
        y: partWorldPos.y,
        z: partWorldPos.z,
        duration: 1.5,
        ease: "power2.inOut"
      });

    } else {
      if (tooltip) tooltip.style.display = 'none';
    }
  }

  container.addEventListener('pointerdown', onPointerDown);

  // EXPLODE BUTTON LISTENER
  const explodeBtn = document.getElementById('watch-explode-btn');
  if (explodeBtn) {
    explodeBtn.addEventListener('click', toggleExplode);
  }

  // GSAP Animation toggle
  function toggleExplode() {
    isExploded = !isExploded;
    if (explodeBtn) {
      explodeBtn.textContent = isExploded ? "ASSEMBLE MOVEMENT" : "VIEW MOVEMENT";
    }

    parts.forEach(part => {
      const targetPos = isExploded ? part.userData.explodedPosition : part.userData.originalPosition;

      gsap.to(part.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 2.0,
        ease: "power3.inOut"
      });
      
      // Separate components visually by adjusting rotation occasionally during explosion
      if (part !== rotor && part !== gear1 && part !== gear2 && part !== tourbillon) {
        if (isExploded) {
          gsap.to(part.rotation, {
            z: part.rotation.z + (Math.random() - 0.5) * 0.2, // very slight z tilt
            duration: 2.0,
            ease: "power3.inOut"
          });
        }
      }
    });
    
    // Zoom out slightly when exploding
    if (isExploded) {
      gsap.to(camera.position, {
        z: camera.position.z + 4,
        duration: 2.0,
        ease: "power2.inOut"
      });
    } else {
      gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 2.0, ease: "power2.inOut" });
    }
  }

  // RESIZE HANDLER
  window.addEventListener('resize', () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // ANIMATION LOOP
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    controls.update();

    // LIVE MOVEMENT 
    // Tourbillon rotates fast
    tourbillon.rotation.y += 2.0 * delta; 
    
    // Gears rotate continuously
    gear1.rotation.y -= 0.5 * delta;
    gear2.rotation.y += 1.0 * delta;
    
    // Hands moving based on actual time
    const date = new Date();
    const ms = date.getMilliseconds();
    const sec = date.getSeconds();
    const min = date.getMinutes();
    const hr = date.getHours() % 12;
    
    // Sweeping second hand (smooth continuous motion, not ticking)
    const exactSec = sec + (ms / 1000);
    // Negative because clock hands turn clockwise
    secondHand.rotation.z = -exactSec * (Math.PI * 2 / 60);

    const exactMin = min + (exactSec / 60);
    minuteHand.rotation.z = -exactMin * (Math.PI * 2 / 60);

    const exactHr = hr + (exactMin / 60);
    hourHand.rotation.z = -exactHr * (Math.PI * 2 / 12);
    
    // Hovering subtle effect on the entire watch model if assembled
    if (!isExploded) {
      watchGroup.position.y = Math.sin(time * 1.5) * 0.05;
    } else {
      watchGroup.position.y += (0 - watchGroup.position.y) * 0.05;
    }

    renderer.render(scene, camera);
  }

  animate();
}
