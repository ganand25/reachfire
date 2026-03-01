"use client";

import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

interface AnimProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function FadeUp({ children, className, delay = 0 }: AnimProps): React.JSX.Element {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

export function FadeIn({ children, className, delay = 0 }: AnimProps): React.JSX.Element {
  return (
    <motion.div
      className={className}
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({ children, className }: Omit<AnimProps, "delay">): React.JSX.Element {
  return (
    <motion.div
      className={className}
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
    >
      {children}
    </motion.div>
  );
}

/** Item to use inside StaggerContainer */
export function StaggerItem({ children, className }: Omit<AnimProps, "delay">): React.JSX.Element {
  return (
    <motion.div className={className} variants={fadeUp} transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}>
      {children}
    </motion.div>
  );
}

/** Wraps a page with a subtle fade+slide-up entrance */
export function PageEnter({ children, className }: Omit<AnimProps, "delay">): React.JSX.Element {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Hover lift effect — wrap around any card */
export function HoverCard({ children, className }: Omit<AnimProps, "delay">): React.JSX.Element {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
    >
      {children}
    </motion.div>
  );
}
