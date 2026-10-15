import { motion, useReducedMotion } from "framer-motion";
import { DUR, EASE, pageVariants } from "./tokens.js";

/* Buttery route-level transition: gentle fade + soft rise in, quick settle out.
   Transform/opacity only. Use inside <AnimatePresence mode="wait"> with a key
   per route. Renders a plain div when reduced motion.
   Props: duration (default signature page), y (rise distance, default 12). */
export function PageFade({ children, className, duration = DUR.page, y = 12, ...rest }) {
  const reduce = useReducedMotion() === true;
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={pageVariants(duration, y)}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export default PageFade;
