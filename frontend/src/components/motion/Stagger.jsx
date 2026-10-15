import { motion, useReducedMotion } from "framer-motion";
import { DUR, EASE, REVEAL_SCALE_FROM } from "./tokens.js";

const gridVariants = {
  hidden: {},
  show: ({ stagger, delayChildren }) => ({
    transition: { staggerChildren: stagger, delayChildren },
  }),
};

const makeItemVariants = (y) => ({
  hidden: { opacity: 0, y, scale: REVEAL_SCALE_FROM },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: DUR.card, ease: EASE },
  },
});

/* Stagger container: wrap grid; each <StaggerItem> animates in sequence.
   Renders a plain div when reduced motion. */
export function Stagger({
  children,
  className,
  stagger = DUR.stagger,
  delayChildren = 0,
  once = true,
  amount = 0.4,
  ...rest
}) {
  const reduce = useReducedMotion() === true;
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={gridVariants}
      custom={{ stagger, delayChildren }}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-40px", amount }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, y = 14, ...rest }) {
  const reduce = useReducedMotion() === true;
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={makeItemVariants(y)} {...rest}>
      {children}
    </motion.div>
  );
}

export default Stagger;
