// script.js
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

import { playHeroIntroAnimation } from "./intro.js";

/* ---------------------------
   DOM helpers
---------------------------- */
const threeRoot = document.getElementById("three-root");
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

/* ---------------------------
   Navbar: mobile toggle
---------------------------- */
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------------------------
   Scroll lock helper
---------------------------- */
function lockScroll(lock = true) {
  document.documentElement.classList.toggle("scroll-lock", lock);
  document.body.classList.toggle("scroll-lock", lock);
}

/* ---------------------------
   Poses
---------------------------- */
const POSES = [
  {
    pos: new THREE.Vector3(3.9, -1.65, 0.0),
    rot: new THREE.Euler(0.0, Math.PI * 0.72, 0.0),
    cam: new THREE.Vector3(6.2, 2.2, 12.5),
    label: "hero",
  },
  {
    pos: new THREE.Vector3(7.6, -1.95, -0.4),
    rot: new THREE.Euler(0.0, -Math.PI * 0.55, 0.0),
    cam: new THREE.Vector3(-6.0, 2.4, 12.0),
    label: "services",
  },
  {
    pos: new THREE.Vector3(3.4, -2.85, -1.6),
    rot: new THREE.Euler(0.07, -Math.PI * 0.35, 0.0),
    cam: new THREE.Vector3(6.0, 2.15, 11.4),
    label: "story",
  },
  {
    pos: new THREE.Vector3(3.2, 1.35, -3.2),
    rot: new THREE.Euler(-0.38, Math.PI * 0.52, 0.02),
    cam: new THREE.Vector3(6.2, 4.3, 12.4),
    label: "fleet",
  },
  {
    pos: new THREE.Vector3(-4.0, -5.35, -2.2),
    rot: new THREE.Euler(-0.18, Math.PI * 0.90, 0.0),
    cam: new THREE.Vector3(0.0, 3.8, 12.6),
    label: "end",
  },
];

/* ---------------------------
   Scene / Camera / Renderer
---------------------------- */
const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

threeRoot.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  42,
  window.innerWidth / window.innerHeight,
  0.1,
  120
);
camera.position.copy(POSES[0].cam);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = false;
controls.enabled = false;

/* ---------------------------
   Lights + Environment
---------------------------- */
scene.add(new THREE.AmbientLight(0xffffff, 0.25));

const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
keyLight.position.set(8, 14, 10);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.bias = -0.0006;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xaad7ff, 1.2);
rimLight.position.set(-10, 8, -12);
scene.add(rimLight);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

/* ---------------------------
   Ground
---------------------------- */
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.ShadowMaterial({ opacity: 0.22 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1.85;
ground.receiveShadow = true;
scene.add(ground);

/* ---------------------------
   Car rig + state
---------------------------- */
const carRig = new THREE.Group();
carRig.visible = false; // hide until model is loaded
scene.add(carRig);

let car = null;
let lampMaterials = []; // will be filled after load

/* ---------------------------
   Lights control (red glow)
---------------------------- */
function setCarLights(on) {
  if (!lampMaterials.length) return;

  const RED = 0xff1500ff;
  const ON_INTENSITY = 100.0;  // increase if you want stronger glow
  const OFF_INTENSITY = 0.0;

  lampMaterials.forEach((m) => {
    if (m.emissive) m.emissive.setHex(RED);

    if (window.gsap && m.emissive) {
      window.gsap.to(m, {
        emissiveIntensity: on ? ON_INTENSITY : OFF_INTENSITY,
        duration: 0.5,
        ease: "power2.out",
      });
    } else {
      // fallback: tint + opacity
      if (m.color) m.color.setHex(on ? RED : 0xffffff);
      if (typeof m.opacity === "number") m.opacity = on ? 1 : 0.35;
    }

    m.needsUpdate = true;
  });
}

/* ---------------------------
   Scroll animation (GSAP owns transforms)
---------------------------- */
function setupScrollAnimations() {
  if (!window.gsap || !window.ScrollTrigger) {
    console.warn("GSAP/ScrollTrigger not available. Animations disabled.");
    return;
  }

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  gsap.registerPlugin(ScrollTrigger);

  const sections = Array.from(document.querySelectorAll(".section"));
  if (!sections.length) return;

  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true,
  });

  // Kill old triggers/timelines if any (hot reload safety)
  ScrollTrigger.getAll().forEach((t) => t.kill());

  const tl = gsap.timeline({
    defaults: { ease: "none", duration: 1 },
    scrollTrigger: {
      trigger: "main",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.7,
      fastScrollEnd: true,
      preventOverlaps: true,
    },
  });

  sections.forEach((_, idx) => {
    const pose = POSES[idx] || POSES[POSES.length - 1];

    tl.to(carRig.position, { x: pose.pos.x, y: pose.pos.y, z: pose.pos.z }, idx);
    tl.to(carRig.rotation, { x: pose.rot.x, y: pose.rot.y, z: pose.rot.z }, idx);
    tl.to(camera.position, { x: pose.cam.x, y: pose.cam.y, z: pose.cam.z }, idx);
  });

  // Optional micro-motion (very subtle). Comment out if not needed.
  if (window.__carFloatTween) window.__carFloatTween.kill();
  window.__carFloatTween = gsap.to(carRig.rotation, {
    z: "+=0.012",
    yoyo: true,
    repeat: -1,
    duration: 3.2,
    ease: "sine.inOut",
    paused: false,
  });

  ScrollTrigger.addEventListener("scrollStart", () => window.__carFloatTween?.pause());
  ScrollTrigger.addEventListener("scrollEnd", () => window.__carFloatTween?.resume());
}

/* ---------------------------
   Load car GLB (only after load: intro + scroll + lights)
---------------------------- */
const loader = new GLTFLoader();

loader.load(
  "/assets/car.glb",
  (gltf) => {
    car = gltf.scene;
    car.scale.set(1, 1, 1);

    // Premium-ish material tuning (safe adjustments)
    car.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.castShadow = true;
      obj.receiveShadow = true;

      const m = obj.material;
      if (m) {
        if ("metalness" in m) m.metalness = Math.min(0.85, m.metalness + 0.2);
        if ("roughness" in m) m.roughness = Math.max(0.08, m.roughness * 0.75);
      }
    });

    // Detect lamp material by exact mesh name you verified:
    lampMaterials = [];
    car.traverse((obj) => {
      if (!obj.isMesh) return;

      if ((obj.name || "").toLowerCase() === "car_glassss_0") {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => {
          if (!m) return;
          // Prepare emissive
          if (m.emissive) {
            m.emissive.setHex(0x000000);
            m.emissiveIntensity = 0;
          }
          m.transparent = true;
          m.depthWrite = false; // often helps glow read through glass
          m.needsUpdate = true;
          lampMaterials.push(m);
        });
      }
    });

    console.log("Lamp materials found:", lampMaterials.length);

    
    // Add to rig and reveal
    carRig.add(car);
    carRig.visible = true;

    // Play intro (in intro.js). After intro completes:
    // - setupScrollAnimations() will run
    // - lights can be turned on
    playHeroIntroAnimation({
      carRig,
      camera,
      controls,
      heroPose: POSES[0],
      lockScroll,
      setupScrollAnimations,
      onComplete: () => {
        // Turn lights on after intro (testing)
        setCarLights(true);
      },
    });
  },
  undefined,
  (err) => console.error("Error loading ./assets/car.glb", err)
);

/* ---------------------------
   Render loop
---------------------------- */
function animate() {
  requestAnimationFrame(animate);
  camera.lookAt(0, -1.9, 0);
  controls.update();
  renderer.render(scene, camera);
}
animate();

/* ---------------------------
   Resize
---------------------------- */
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

/* ---------------------------
   Quick manual test: press "L" to toggle lights
---------------------------- */
let __lightsOn = false;
window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "l") {
    __lightsOn = !__lightsOn;
    setCarLights(__lightsOn);
    console.log("Lights:", __lightsOn ? "ON" : "OFF");
  }
});
