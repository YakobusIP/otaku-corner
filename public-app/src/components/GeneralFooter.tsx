import SlideUpInView from "@/components/motion/SlideUpInView";

const footerWhite = "#FFFFFF";
const waveStroke = "#F3C9D6";
const pinkBandFill = "rgba(253, 226, 234, 0.92)";

const wavePink =
  "M0 58 C 160 58 240 30 320 26 C 440 22 520 44 600 48 C 680 50 820 14 960 12 C 1100 10 1260 36 1440 42";

const waveWhite =
  "M0 63 C 220 63 300 42 380 40 C 500 38 560 76 720 78 C 880 76 940 52 1060 50 C 1200 48 1320 62 1440 64";

const pinkBandPath = `${wavePink} L 1440 64 C 1320 62 1200 48 1060 50 C 940 52 880 76 720 78 C 560 76 500 38 380 40 C 300 42 220 63 0 63 Z`;

const whiteBodyPath = `M0 110 L0 63 C 220 63 300 42 380 40 C 500 38 560 76 720 78 C 880 76 940 52 1060 50 C 1200 48 1320 62 1440 64 L 1440 110 Z`;

export default function GeneralFooter() {
  return (
    <SlideUpInView
      as="footer"
      className="relative z-10 -mt-16 w-full leading-0 sm:-mt-20 md:-mt-24"
    >
      <svg
        aria-hidden
        className="pointer-events-none block w-full"
        style={{ height: "clamp(4.5rem, 11vw, 6.25rem)" }}
        viewBox="0 0 1440 110"
        preserveAspectRatio="none"
      >
        <path d={pinkBandPath} fill={pinkBandFill} />
        <path d={whiteBodyPath} fill={footerWhite} />
        <path
          d={waveWhite}
          fill="none"
          stroke={waveStroke}
          strokeWidth={1.25}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="-mt-px bg-white px-4 pb-5 pt-1 text-center text-sm leading-normal text-slate-500">
        &copy; {new Date().getFullYear()} Otaku Corner. All rights reserved.
      </div>
    </SlideUpInView>
  );
}
