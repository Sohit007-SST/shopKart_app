import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BURST_DEFAULTS,
  DUR,
  EASE,
  FLY_ARC_PX,
  FLY_DOT_COLOR,
  FLY_DOT_SIZE,
  FLY_DURATION_MS,
  MAGNETIC_SPRING,
  MAGNETIC_STRENGTH,
  pageVariants,
  revealOffset,
  shouldReduceMotion,
  transitionFor,
} from "./tokens.js";
import { Reveal } from "./Reveal.jsx";
import { Stagger, StaggerItem } from "./Stagger.jsx";
import { PageFade } from "./PageFade.jsx";

/* Barrel: single import point, same public API as before.
   import { Reveal, Stagger, StaggerItem, PageFade } from "../components/motion/index.jsx";
   or deep-import "../components/motion/Reveal.jsx" etc. */
export {
  BURST_DEFAULTS,
  DUR,
  DUR_MS,
  EASE,
  FLY_ARC_PX,
  FLY_DOT_COLOR,
  FLY_DOT_SIZE,
  FLY_DURATION_MS,
  MAGNETIC_SPRING,
  MAGNETIC_STRENGTH,
  MOTION_CSS_VARS,
  REDUCED_MOTION_QUERY,
  RISE,
  REVEAL_SCALE_FROM,
  SPRING_BUTTER,
  SPRING_MICRO,
  cardIn,
  fadeSlide,
  pageVariants,
  revealOffset,
  shouldReduceMotion,
  staggerGrid,
  transitionFor,
} from "./tokens.js";
export { Reveal, Stagger, StaggerItem, PageFade };
export { flyToCart, Magnetic, MagneticButton, CelebrationBurst };

export function usePrefersReducedMotion() {
  return useReducedMotion() === true;
}

/* No-JS-animation fallback: IntersectionObserver toggles .reveal-visible. */
export function useReveal(selector = ".reveal") {
  const [ready, setReady] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current ?? document;
    const els = root.querySelectorAll(selector);
    if (!els.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReady(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("reveal-visible");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    setReady(true);
    return () => io.disconnect();
  }, [selector]);
  return [ref, ready];
}

/* ---- Magnetic pointer primitives (transform-only, spring-smoothed) ---- */

function useMagneticOffsets(strength) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, MAGNETIC_SPRING);
  const sy = useSpring(y, MAGNETIC_SPRING);
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };
  return { sx, sy, onMove, onLeave };
}

/* Generic magnetic wrapper: any child drifts toward the cursor, springs back
   on leave. Reduced motion renders a plain div (no handlers). */
function Magnetic({ children, strength = MAGNETIC_STRENGTH, className, ...rest }) {
  const reduce = useReducedMotion() === true;
  const { sx, sy, onMove, onLeave } = useMagneticOffsets(strength);
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* Signature magnetic button: pull + tactile press. Reduced motion renders a
   native <button> with identical props/children. */
function MagneticButton({
  children,
  strength = MAGNETIC_STRENGTH,
  className,
  type = "button",
  ...rest
}) {
  const reduce = useReducedMotion() === true;
  const { sx, sy, onMove, onLeave } = useMagneticOffsets(strength);
  if (reduce)
    return (
      <button type={type} className={className} {...rest}>
        {children}
      </button>
    );
  return (
    <motion.button
      type={type}
      className={className}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: DUR.micro, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

/* ---- Cart-fly micro-interaction (WAAPI dot, no React state needed) ----
   Animates a dot from `fromEl` to `toEl` along a soft arc, then removes it.
   Returns a Promise<boolean> resolving true when done OR skipped.
   Reduced motion / missing elements / SSR: resolves immediately, no DOM. */
function flyToCart(fromEl, toEl, opts = {}) {
  const {
    color = FLY_DOT_COLOR,
    size = FLY_DOT_SIZE,
    durationMs = FLY_DURATION_MS,
    arc = FLY_ARC_PX,
    onDone,
  } = opts;
  return new Promise((resolve) => {
    const finish = (ok) => {
      try {
        onDone?.();
      } catch {
        /* caller callback must never break the flight promise */
      }
      resolve(ok);
    };
    try {
      if (
        typeof document === "undefined" ||
        typeof window === "undefined" ||
        shouldReduceMotion() ||
        !fromEl?.getBoundingClientRect ||
        !toEl?.getBoundingClientRect
      ) {
        finish(true);
        return;
      }
      const a = fromEl.getBoundingClientRect();
      const b = toEl.getBoundingClientRect();
      if (!a.width && !a.height) {
        finish(true);
        return;
      }
      const dot = document.createElement("div");
      const half = size / 2;
      dot.setAttribute("aria-hidden", "true");
      dot.style.cssText =
        `position:fixed;left:${a.left + a.width / 2 - half}px;` +
        `top:${a.top + a.height / 2 - half}px;width:${size}px;height:${size}px;` +
        `border-radius:9999px;background:${color};pointer-events:none;z-index:9999;margin:0;`;
      document.body.appendChild(dot);
      const dx = b.left + b.width / 2 - (a.left + a.width / 2);
      const dy = b.top + b.height / 2 - (a.top + a.height / 2);
      const anim = dot.animate(
        [
          { transform: "translate(0, 0) scale(1)", opacity: 1 },
          {
            transform: `translate(${dx * 0.5}px, ${dy * 0.5 - arc}px) scale(0.85)`,
            opacity: 1,
            offset: 0.55,
          },
          { transform: `translate(${dx}px, ${dy}px) scale(0.35)`, opacity: 0.6 },
        ],
        { duration: durationMs, easing: "cubic-bezier(0.22, 0.61, 0.21, 1)" }
      );
      anim.onfinish = () => {
        dot.remove();
        finish(true);
      };
    } catch {
      finish(true);
    }
  });
}

/* ---- Success celebration burst ----
   Conditionally rendered confetti burst (e.g. after order success):
     {justOrdered && <CelebrationBurst burstKey={orderId} onDone={...} />}
   Particles fly outward and fade; onDone fires after the flight.
   Reduced motion renders null and calls onDone on mount. */
function CelebrationBurst({
  burstKey = 0,
  count = BURST_DEFAULTS.count,
  colors = BURST_DEFAULTS.colors,
  minDistance = BURST_DEFAULTS.minDistance,
  maxDistance = BURST_DEFAULTS.maxDistance,
  duration = BURST_DEFAULTS.duration,
  size = BURST_DEFAULTS.size,
  className,
  style,
  onDone,
  ...rest
}) {
  const reduce = useReducedMotion() === true;
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const palette = colors?.length ? colors : BURST_DEFAULTS.colors;
  const seed =
    typeof burstKey === "number"
      ? burstKey
      : String(burstKey)
          .split("")
          .reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);
  const particles = useMemo(() => {
    const span = Math.max(maxDistance - minDistance, 1);
    const n = Math.max(count, 0);
    return Array.from({ length: n }, (_, i) => {
      const angle = (i / Math.max(n, 1)) * Math.PI * 2 + ((seed % 7) + 7) * 0.13;
      const dist = minDistance + (((i * 37) % 1000) / 1000) * span;
      return {
        id: `${burstKey}-${i}`,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist - 12,
        color: palette[i % palette.length],
        r: (i * 53) % 180,
      };
    });
  }, [burstKey, count, palette, minDistance, maxDistance, seed]);
  useEffect(() => {
    if (!particles.length) {
      doneRef.current?.();
      return;
    }
    const t = setTimeout(() => doneRef.current?.(), duration * 1000 + 80);
    return () => clearTimeout(t);
  }, [particles, duration]);
  if (reduce) return null;
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "visible",
        ...style,
      }}
      {...rest}
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
          animate={{ x: p.dx, y: p.dy, opacity: 0, scale: 0.4, rotate: p.r }}
          transition={{ duration, ease: EASE }}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: size,
            height: size,
            borderRadius: 9999,
            background: p.color,
          }}
        />
      ))}
    </div>
  );
}

export default {
  Reveal,
  Stagger,
  StaggerItem,
  PageFade,
  Magnetic,
  MagneticButton,
  flyToCart,
  CelebrationBurst,
  useReveal,
  usePrefersReducedMotion,
  EASE,
  DUR,
};
