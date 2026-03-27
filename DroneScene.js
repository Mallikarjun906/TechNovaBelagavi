import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function initDroneScene() {
  const container = document.getElementById('drone-canvas');
  if (!container) return;

  // SCENE SETUP
  const scene = new THREE.Scene();

  // CAMERA SETUP
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(4, 3, 5);

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
  controls.autoRotateSpeed = 1.0;
  controls.minDistance = 3;
  controls.maxDistance = 10;
  controls.enablePan = false;

  // LIGHTING (Premium look)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0x00d4ff, 2);
  dirLight1.position.set(5, 5, 5);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xff6b00, 1.5);
  dirLight2.position.set(-5, 3, -5);
  scene.add(dirLight2);

  const fillLight = new THREE.PointLight(0xffffff, 1);
  fillLight.position.set(0, -2, 2);
  scene.add(fillLight);

  // MATERIALS
  const matDarkMetal = new THREE.MeshStandardMaterial({
    color: 0x111111,
    metalness: 0.9,
    roughness: 0.2,
  });

  const matAccent = new THREE.MeshStandardMaterial({
    color: 0x00d4ff,
    metalness: 0.8,
    roughness: 0.1,
    emissive: 0x002233
  });

  const matGold = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 1.0,
    roughness: 0.3,
  });

  const matCarbon = new THREE.MeshStandardMaterial({
    color: 0x050505,
    metalness: 0.6,
    roughness: 0.8,
  });

  // DRONE GROUP (Holds everything)
  const droneGroup = new THREE.Group();
  scene.add(droneGroup);

  const parts = []; // Store interactive parts
  const propellers = []; // Store props to animate rotation
  let isExploded = false;

  // HELPER TO CREATE PARTS
  function createPart(geometry, material, partInfo, position, explodedOffset) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Store original and exploded positions
    mesh.userData = {
      ...partInfo,
      originalPosition: position.clone(),
      explodedPosition: position.clone().add(explodedOffset),
      isPart: true
    };

    droneGroup.add(mesh);
    parts.push(mesh);
    return mesh;
  }

  // 1. FRAME (Central body)
  const frameGeo = new THREE.BoxGeometry(1.2, 0.4, 2);
  createPart(frameGeo, matDarkMetal, {
    name: "AeroFrame X1",
    desc: "Central chassis built from aerospace-grade carbon fiber.",
    mfr: "NEXUS Aerospace",
    specs: "Weight: 450g | Material: Carbon Fiber"
  }, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.5, 0));

  // 2. BATTERY
  const batteryGeo = new THREE.BoxGeometry(0.8, 0.3, 1.4);
  createPart(batteryGeo, matCarbon, {
    name: "Graphene Power Cell",
    desc: "High-density graphene battery for maximum flight time.",
    mfr: "VoltX",
    specs: "Cap: 6000mAh | Weight: 300g"
  }, new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1.5, 0));

  // 3. CAMERA
  const camBaseGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 16);
  camBaseGeo.rotateZ(Math.PI / 2);
  const cameraBase = createPart(camBaseGeo, matDarkMetal, {
    name: "OmniVision 8K Gimbal",
    desc: "3-axis stabilized gimbal with 8K recording capability.",
    mfr: "Optica",
    specs: "Res: 8K@60fps | Sensor: 1-inch CMOS"
  }, new THREE.Vector3(0, -0.3, 0.8), new THREE.Vector3(0, -1.2, 1.5));

  const lensGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16);
  lensGeo.rotateX(Math.PI / 2);
  const lens = new THREE.Mesh(lensGeo, matAccent);
  lens.position.set(0, 0, 0.2);
  cameraBase.add(lens);

  // 4. SENSORS (GPS / LiDAR)
  const sensorGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16);
  createPart(sensorGeo, matAccent, {
    name: "LiDAR Array Alpha",
    desc: "360-degree obstacle avoidance and mapping sensor.",
    mfr: "ScanTech",
    specs: "Range: 30m | Freq: 10Hz"
  }, new THREE.Vector3(0, 0.25, -0.6), new THREE.Vector3(0, 1.0, -1.2));

  // 5. ARMS & MOTORS & PROPELLERS
  const armPositions = [
    { x: 1, z: 1, rot: Math.PI / 4 },    // Front Right
    { x: -1, z: 1, rot: -Math.PI / 4 },  // Front Left
    { x: 1, z: -1, rot: 3 * Math.PI / 4 }, // Back Right
    { x: -1, z: -1, rot: -3 * Math.PI / 4 } // Back Left
  ];

  const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.5, 16);
  armGeo.rotateX(Math.PI / 2);
  const motorGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 16);
  const propGeo = new THREE.BoxGeometry(1.6, 0.02, 0.1);

  armPositions.forEach((pos, i) => {
    // Arm
    const arm = createPart(armGeo, matCarbon, {
      name: `Carbon Arm ${i + 1}`,
      desc: "Lightweight tubular arm connecting motor to frame.",
      mfr: "NEXUS Composite",
      specs: "Length: 15cm | Weight: 45g"
    }, new THREE.Vector3(pos.x * 0.5, 0, pos.z * 0.5), new THREE.Vector3(pos.x, 0, pos.z));
    arm.rotation.y = pos.rot;

    // Motor
    const motor = createPart(motorGeo, matGold, {
      name: `Brushless Motor V${i + 1}`,
      desc: "High-torque brushless motor for rapid acceleration.",
      mfr: "ThrustCorp",
      specs: "RPM: 12000 | Thrust: 1.2kg"
    }, new THREE.Vector3(pos.x * 1.1, 0.1, pos.z * 1.1), new THREE.Vector3(pos.x * 2.2, 0.5, pos.z * 2.2));

    // Propeller
    const prop = createPart(propGeo, matDarkMetal, {
      name: `AeroBlade ${i + 1}`,
      desc: "Low-noise aerodynamic propeller blade.",
      mfr: "NEXUS Aero",
      specs: "Diameter: 8in | Pitch: 4.5"
    }, new THREE.Vector3(pos.x * 1.1, 0.28, pos.z * 1.1), new THREE.Vector3(pos.x * 2.2, 1.5, pos.z * 2.2));

    propellers.push(prop);
  });

  // RAYCASTING & INTERACTION
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const tooltip = document.getElementById('part-tooltip');

  if (!tooltip) console.warn("Tooltip element not found");

  function onPointerDown(event) {
    if (event.button !== 0) return; // Left click only

    const rect = container.getBoundingClientRect();
    const clientX = event.clientX;
    const clientY = event.clientY;

    // Calculate mouse position relative to canvas
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

        // Hide tooltip after some time or if clicked elsewhere
        setTimeout(() => tooltip.style.display = 'none', 4000);
      }

      // If clicked frame, toggle explosion. Otherwise just clicked a part.
      // We can also just toggle explosion on any part click since it's cool.
      toggleExplode();
    } else {
      // Clicked empty space
      if (tooltip) tooltip.style.display = 'none';
      toggleExplode();
    }
  }

  container.addEventListener('pointerdown', onPointerDown);

  // GSAP Animation toggle
  function toggleExplode() {
    isExploded = !isExploded;

    parts.forEach(part => {
      const targetPos = isExploded ? part.userData.explodedPosition : part.userData.originalPosition;

      gsap.to(part.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 1.5,
        ease: "power3.inOut"
      });

      // Add a little random rotation when exploded
      if (isExploded && part.geometry.type !== "BoxGeometry") { // Keep main boxes mostly straight
        gsap.to(part.rotation, {
          x: part.rotation.x + (Math.random() - 0.5) * 0.5,
          y: part.rotation.y + (Math.random() - 0.5) * 0.5,
          z: part.rotation.z + (Math.random() - 0.5) * 0.5,
          duration: 1.5,
          ease: "power3.inOut"
        });
      } else if (!isExploded) {
        // Reset rotation carefully (except for props and arms, they have specific initial rotations handled elsewhere, but actually we didn't store originalRotation, let's just leave it or reset carefully. Actually we only rotate props in render loop, so it's fine)
      }
    });
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

    // Spin propellers
    propellers.forEach(prop => {
      // Faster when assembled, slower when exploded
      const speed = isExploded ? 5 : 25;
      prop.rotation.y += speed * delta;
    });

    // Gentle hovering effect on the whole drone
    if (!isExploded) {
      droneGroup.position.y = Math.sin(time * 2) * 0.1;
      droneGroup.rotation.z = Math.sin(time * 1.5) * 0.02;
    } else {
      // Reset hover when exploded
      droneGroup.position.y += (0 - droneGroup.position.y) * 0.05;
      droneGroup.rotation.z += (0 - droneGroup.rotation.z) * 0.05;
    }

    renderer.render(scene, camera);
  }

  animate();
}
