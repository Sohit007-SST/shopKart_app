/* Track A motion tokens (single source of truth for durations + easing).
   Micro <300ms, page 300-500ms, transform/opacity only.
   No scroll-linked values here by design (taste ban: no scroll-jacking).
   Signature: one ease, one rise distance, one whisper of scale — same feel everywhere. */

export const EASE = [0.22, 0.61, 0.21, 1];

/* Seconds for framer-motion `transition.duration`. Micro stays < 0.3. */
export const DUR = { micro: 0.18, card: 0.28, page: 0.38, stagger: 0.05 };

/* Millisecond mirror for setTimeout / CSS-in-JS arithmetic. */
export const DUR_MS = { micro: 180, card: 280, page: 380, stagger: 50 };

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export const MOTION_CSS_VARS = {
  "--motion-micro": `${DUR_MS.micro}ms`,
  "--motion-card": `${DUR_MS.card}ms`,
  "--motion-page": `${DUR_MS.page}ms`,
  "--motion-ease": "cubic-bezier(0.22, 0.61, 0.21, 1)",
};

export const fadeSlide = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.card, ease: EASE } },
};

export const staggerGrid = {
  hidden: {},
  show: { transition: { staggerChildren: DUR.stagger } },
};

export const cardIn = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.card, ease: EASE } },
};

/* ---- Signature language (additive; nothing above changed) ---- */

/* Signature rise distance (px) — one number so every reveal feels related. */
export const RISE = 14;

/* Whisper of scale on reveals — character without wobble. Transform-only. */
export const REVEAL_SCALE_FROM = 0.985;

/* Buttery springs for pointer-driven motion (magnetic buttons). */
export const SPRING_BUTTER = { type: "spring", stiffness: 210, damping: 26, mass: 0.9 };
export const SPRING_MICRO = { type: "spring", stiffness: 500, damping: 32 };

/* Magnetic pull: fraction of cursor offset from center applied to the target.
   0.35 = noticeable but restrained; stays transform-only. */
export const MAGNETIC_STRENGTH = 0.35;
export const MAGNETIC_SPRING = SPRING_BUTTER;

/* Cart-fly micro-interaction: single source for the flight duration. */
export const FLY_DURATION_MS = 650;
export const FLY_ARC_PX = 64;
export const FLY_DOT_COLOR = "#10b981";
export const FLY_DOT_SIZE = 14;

/* Success celebration burst defaults. Colors are overridable via props. */
export const BURST_DEFAULTS = {
  count: 14,
  minDistance: 44,
  maxDistance: 96,
  duration: 0.7,
  size: 8,
  colors: ["#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#38bdf8"],
};

/* Buttery route transition: gentle rise in, quick settle out.
   Exit is capped short so <AnimatePresence mode="wait"> never feels laggy. */
export const pageVariants = (duration = DUR.page, y = 12) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0, transition: { duration, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: Math.min(duration, 0.25), ease: EASE } },
});

/* Directional reveal offsets. `distance` defaults to the signature RISE. */
export function revealOffset(direction = "up", distance = RISE) {
  switch (direction) {
    case "down":
      return { x: 0, y: -distance };
    case "left":
      return { x: distance, y: 0 };
    case "right":
      return { x: -distance, y: 0 };
    case "up":
    default:
      return { x: 0, y: distance };
  }
}

/* Shorthand transitions so callers never hand-roll durations. */
export function transitionFor(kind = "card", delay = 0) {
  const duration = DUR[kind] ?? DUR.card;
  return { duration, delay, ease: EASE };
}

/* Imperative reduced-motion check (matchMedia). SSR-safe: defaults to false
   (motion on) when window/matchMedia is unavailable. */
export function shouldReduceMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches === true;
}
