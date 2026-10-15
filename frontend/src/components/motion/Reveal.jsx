import { motion, useReducedMotion } from "framer-motion";
import { DUR, EASE, REVEAL_SCALE_FROM, revealOffset } from "./tokens.js";

/* Max stagger delay on a single reveal — keeps entrances restrained. */
const MAX_DELAY = 0.3;

/* Signature scroll reveal: fade + directional rise + a whisper of scale.
   Transform/opacity only; renders a plain div when reduced motion.
   Props (all optional, backward compatible):
     delay     seconds, clamped to [0, 0.3]
     y         rise distance in px (default signature RISE via tokens)
     direction "up" | "down" | "left" | "right" (default "up")
     scale    envelope whisper of scale on/off (default true)
     once      replay when re-entering viewport (default true)
     amount    fraction of element visible before triggering (default 0.4) */
export function Reveal({
  children,
  delay = 0,
  y = 14,
  direction = "up",
  scale = true,
  className,
  once = true,
  amount = 0.4,
  ...rest
}) {
  const reduce = useReducedMotion() === true;
  if (reduce) return <div className={className}>{children}</div>;
  const safeDelay = Math.min(Math.max(delay, 0), MAX_DELAY);
  const offset = revealOffset(direction, y);
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: scale ? REVEAL_SCALE_FROM : 1, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once, margin: "-40px", amount }}
      transition={{ duration: DUR.card, delay: safeDelay, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export default Reveal;
