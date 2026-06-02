"use client";

import { Fragment, useEffect, useRef, useState } from "react";

import { useInView, useReducedMotion } from "framer-motion";

const QUOTE_LINES = [
  "My personal curated selections.",
  "And this is where I keep track of them."
] as const;

const FULL_TEXT = QUOTE_LINES.join("\n");
const CHAR_DELAY_MS = 48;
const LINE_BREAK_DELAY_MS = 520;

export default function HomeQuoteTypewriter() {
  const blockquoteRef = useRef<HTMLQuoteElement>(null);
  const inView = useInView(blockquoteRef, { amount: 0.45 });
  const prefersReducedMotion = useReducedMotion();
  const [visibleLength, setVisibleLength] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setVisibleLength(FULL_TEXT.length);
      return;
    }

    if (!inView) {
      setVisibleLength(0);
      return;
    }

    if (visibleLength >= FULL_TEXT.length) {
      return;
    }

    const nextCharacter = FULL_TEXT[visibleLength];
    const delay = nextCharacter === "\n" ? LINE_BREAK_DELAY_MS : CHAR_DELAY_MS;

    const timer = window.setTimeout(() => {
      setVisibleLength((current) => current + 1);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [inView, prefersReducedMotion, visibleLength]);

  const visibleText = FULL_TEXT.slice(0, visibleLength);
  const visibleLines = visibleText.split("\n");

  return (
    <blockquote
      ref={blockquoteRef}
      className="text-pretty text-2xl font-medium leading-relaxed text-[#4a2a46] drop-shadow-[0_2px_18px_rgba(255,255,255,0.9)] sm:text-3xl"
      aria-live={prefersReducedMotion ? undefined : "polite"}
    >
      {visibleLines.map((line, lineIndex) => {
        return (
          <Fragment key={lineIndex}>
            {lineIndex > 0 ? <br /> : null}
            {line}
          </Fragment>
        );
      })}
      <span
        aria-hidden
        className="ml-0.5 inline-block h-[0.9em] w-0.5 translate-y-px align-middle bg-[#4a2a46] animate-caret-blink"
      />
    </blockquote>
  );
}
