"use client";

import { ReactNode } from "react";

import { MOBILE_MEDIA_QUERY, useMediaQuery } from "@/hooks/useMediaQuery";

import {
  type TargetAndTransition,
  type Transition,
  motion,
  useReducedMotion
} from "framer-motion";

type SlideUpInViewProps = {
  as?: "div" | "section" | "footer";
  children: ReactNode;
  className?: string;
  eager?: boolean;
};

const transition: Transition = {
  duration: 0.96,
  ease: [0.22, 1, 0.36, 1]
};

const getViewport = (isMobile: boolean, eager: boolean) => {
  if (eager) {
    return {
      once: true,
      amount: 0.05,
      margin: "0px 0px 20% 0px"
    } as const;
  }

  if (isMobile) {
    return {
      once: true,
      amount: 0.12,
      margin: "0px 0px 12% 0px"
    } as const;
  }

  return {
    once: false,
    amount: 0.45,
    margin: "0px 0px 0px 0px"
  } as const;
};

const getInitial = (isMobile: boolean): TargetAndTransition => ({
  opacity: 0,
  y: isMobile ? 16 : 28
});

export default function SlideUpInView(props: SlideUpInViewProps) {
  const { as = "div", children, className, eager = false } = props;
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const viewport = getViewport(isMobile, eager);

  if (prefersReducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const motionProps = {
    className,
    initial: getInitial(isMobile),
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
