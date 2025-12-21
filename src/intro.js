// intro.js
/**
 * Hero intro animation module
 * - Car enters from RIGHT side and stops at hero pose
 * - Smooth and editable tuning knobs
 *
 * REQUIREMENTS:
 * - GSAP available globally (window.gsap)
 * - You pass in carRig, camera, controls, heroPose, lockScroll, setupScrollAnimations
 */

export function playHeroIntroAnimation({
  carRig,
  camera,
  controls,
  heroPose,
  lockScroll,
  setupScrollAnimations,
  onComplete, // optional callback (ex: turn lights on)
}) {
  if (!window.gsap) {
    console.warn("GSAP not found. Skipping intro animation.");
    // Fallback: set hero pose immediately
    carRig.position.copy(heroPose.pos);
    carRig.rotation.copy(heroPose.rot);
    camera.position.copy(heroPose.cam);
    setupScrollAnimations?.();
    onComplete?.();
    return;
  }

  const gsap = window.gsap;

  // -----------------------------
  // TUNING KNOBS (edit freely)
  // -----------------------------
  const START_X_OFFSET = -9.5;     // start from RIGHT (increase => more off-screen right)
  const START_Z_OFFSET = 12.0;    // start from BACK  (increase => farther away)
  const DRIVE_DURATION = 2.2;     // approach duration (increase => slower)
  const SETTLE_DURATION = 0.45;  // stop/settle duration
  const EASE_IN = "power2.out";  // approach ease
  const EASE_SETTLE = "power2.out";

  // Optional “stop” feel (overshoot then settle)
  const SETTLE_OVERSHOOT_X = -0.25; // negative => slightly past final X
  const SETTLE_OVERSHOOT_Z = 0.25;  // positive => slightly behind final Z

  // Optional subtle pitch while arriving (braking feel)
  const MOVE_PITCH = -0.04;       // set 0 to disable
  const PITCH_DURATION = 0.9;

  // Camera: keep subtle so it feels like car moves, not camera
  const CAM_START_Z_OFFSET = 2.2;
  const CAM_DURATION = 1.6;

  // -----------------------------
  // Lock scrolling so user input doesn't fight intro
  // -----------------------------
  lockScroll(true);
  if (controls) controls.enabled = false;

  // -----------------------------
  // START pose: right + back
  // -----------------------------
  carRig.position.set(
    heroPose.pos.x + START_X_OFFSET,
    heroPose.pos.y,
    heroPose.pos.z - START_Z_OFFSET
  );

  carRig.rotation.set(heroPose.rot.x, heroPose.rot.y, heroPose.rot.z);

  camera.position.set(
    heroPose.cam.x,
    heroPose.cam.y,
    heroPose.cam.z + CAM_START_Z_OFFSET
  );
  camera.lookAt(0, -1.9, 0);

  // Kill old intro if any (hot reload / repeated loads)
  if (window.__INTRO_TL__) window.__INTRO_TL__.kill();

  const tl = gsap.timeline({
    defaults: { ease: EASE_IN },
    onComplete: () => {
      // Snap to exact final hero pose to prevent drift
      carRig.position.copy(heroPose.pos);
      carRig.rotation.copy(heroPose.rot);
      camera.position.copy(heroPose.cam);

      // Unlock scrolling
      lockScroll(false);

      // Build scroll animations AFTER intro so nothing conflicts
      setupScrollAnimations?.();

      // Refresh triggers after transforms
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();

      // Optional callback (ex: turn lights on)
      onComplete?.();
    },
  });

  window.__INTRO_TL__ = tl;

  // 1) Main glide to a slight overshoot
  tl.to(carRig.position, {
    x: heroPose.pos.x + SETTLE_OVERSHOOT_X,
    z: heroPose.pos.z + SETTLE_OVERSHOOT_Z,
    duration: DRIVE_DURATION,
    ease: EASE_IN,
  }, 0);

  // Optional pitch (braking)
  if (MOVE_PITCH !== 0) {
    tl.to(carRig.rotation, {
      x: heroPose.rot.x + MOVE_PITCH,
      duration: PITCH_DURATION,
      ease: "power2.out",
    }, 0.15);
  }

  // Camera slide (subtle)
  tl.to(camera.position, {
    x: heroPose.cam.x,
    y: heroPose.cam.y,
    z: heroPose.cam.z,
    duration: CAM_DURATION,
    ease: "power2.out",
  }, 0);

  // 2) Settle to exact hero pose
  tl.to(carRig.position, {
    x: heroPose.pos.x,
    z: heroPose.pos.z,
    duration: SETTLE_DURATION,
    ease: EASE_SETTLE,
  }, DRIVE_DURATION);

  tl.to(carRig.rotation, {
    x: heroPose.rot.x,
    duration: SETTLE_DURATION,
    ease: EASE_SETTLE,
  }, DRIVE_DURATION);

  return tl;
}
