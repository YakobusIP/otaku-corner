"use client";

import { motion, useReducedMotion } from "framer-motion";

type SlideUpInViewProps = {
  as?: "div" | "section" | "footer";
  children: React.ReactNode;
  className?: string;
};

const transition = {
  duration: 0.96,
  ease: [0.22, 1, 0.36, 1] as const
};

const viewport = {
  once: true,
  amount: 0.45
} as const;

export default function SlideUpInView(props: SlideUpInViewProps) {
  const { as = "div", children, className } = props;
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const motionProps = {
    className,
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport,
    transition
  };

  if (as === "section") {
    return <motion.section {...motionProps}>{children}</motion.section>;
  }
  if (as === "footer") {
    return <motion.footer {...motionProps}>{children}</motion.footer>;
  }
  return <motion.div {...motionProps}>{children}</motion.div>;
}
