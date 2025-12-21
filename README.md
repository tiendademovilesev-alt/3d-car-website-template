
# 🚗 HIMMAT’s Professionals – Experience & Adventure

A **cinematic 3D car landing page** built with **Three.js**, **GSAP**, and **ScrollTrigger**, featuring smooth scroll-driven animations, a realistic hero intro, animated car lights, rotating wheels, and a modern responsive UI.

This project demonstrates how high-end automotive product websites are built — combining **WebGL**, **motion design**, and **performance-oriented frontend architecture**.

---

## ✨ Features

* 🎬 **Cinematic Hero Intro**

  * Car enters smoothly from the right side
  * Realistic easing and settling motion
  * Scroll locked during intro for premium feel

* 🌀 **Scroll-Driven 3D Animations**

  * Car position, rotation, and camera fully controlled by scroll
  * No snap forcing — partial scroll states are preserved
  * Smooth, jitter-free GSAP scrub behavior

* 🛞 **Wheel Rotation Animation**

  * Wheels rotate during intro (driving effect)
  * Optional scroll-velocity-based wheel rotation

* 💡 **Animated Car Lights**

  * Real emissive red glow (using GLB glass material)
  * Smooth on/off transitions
  * Keyboard toggle for testing

* 🌐 **Modern UI**

  * Transparent navbar
  * Responsive layout
  * Mobile-friendly interactions

* ⚡ **Performance-First**

  * ACES tone mapping
  * Physically correct lighting
  * Optimized render loop (GSAP owns transforms)

---

## 🧱 Tech Stack

| Technology        | Purpose                         |
| ----------------- | ------------------------------- |
| **Three.js**      | 3D rendering & scene management |
| **GSAP**          | High-performance animations     |
| **ScrollTrigger** | Scroll-driven timelines         |
| **Vite**          | Fast dev server & build tool    |
| **GLTF / GLB**    | 3D car model                    |
| **GitHub Pages**  | Deployment                      |

---

## 📁 Project Structure

```
.
├── public/
│   └── assets/
│       └── car.glb
│
├── src/
│   ├── script.js        # Main orchestrator (scene, scroll, lights)
│   ├── intro.js         # Hero intro animation logic
│   └── style.css
│
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## 🚀 Getting Started (Local)

### 1️⃣ Install dependencies

```bash
npm install
```

### 2️⃣ Run development server

```bash
npm run dev
```

Open:

```
http://localhost:5173
```

---

## 🌍 Deployment (GitHub Pages)

This project is configured for **GitHub Pages deployment using GitHub Actions**.

### Build & Deploy

```bash
npm run build
git push origin main
```

Live URL format:

```
https://<your-username>.github.io/<repo-name>/
```

> Make sure `vite.config.js` has:

```js
base: "/<repo-name>/"
```

---

## 🎮 Controls (Testing)

| Key    | Action            |
| ------ | ----------------- |
| **L**  | Toggle car lights |
| Scroll | Drive animation   |

---

## 🧠 Architecture Notes

* **GSAP fully controls transforms**
  → No manual lerp in render loop (prevents jitter)

* **Intro animation runs before ScrollTrigger is initialized**
  → Prevents conflicts and snap-back issues

* **Wheel & light logic is modular**
  → Easy to extend with:

  * Door animation (with proper model)
  * Headlight bloom
  * Color transitions

---

## 🛠️ Customization Guide

### Change hero car position

```js
POSES[0].pos.set(x, y, z);
```

### Slow down scroll animation

```js
scrub: 2.5
```

### Stronger light glow

```js
const ON_INTENSITY = 8.0;
```

### Change wheel rotation axis

```js
w.rotation.x   // try z if incorrect
```

---

## ⚠️ Limitations

* Door animation requires **separate door meshes** (not available in current GLB)
* Glass material includes all windows — for realistic headlights only, separate in Blender

---

## 📌 Future Enhancements

* 🔥 Bloom post-processing for lights
* 🚪 Door opening animation (rigged model)
* 🎨 Dynamic paint color selector
* 🖱️ Mouse-based parallax interaction
* 📱 Touch-optimized gestures

---

## 👤 Author

**HIMMAT’s Professionals**
Experience • Adventure • Engineering

---

## 📜 License

This project is for **educational and portfolio use**.
3D assets belong to their respective creators.