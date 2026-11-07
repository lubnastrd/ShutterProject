"use client";

import { useEffect, useState } from "react";
import { Playfair_Display, Courier_Prime, Caveat } from "next/font/google";

const serif = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "700"],
  variable: "--font-serif",
  display: "swap",
});
const mono = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});
const hand = Caveat({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-hand",
  display: "swap",
});

type DarkroomProps = {
  photos: string[];
  onComplete: () => void;
};

// Timeline (progress 0–100, ~12 seconds total)
const LIFT_AT = 52; // photos are lifted out of the tray
const HANG_AT = 64; // photos are pinned on the line and start drying

const STAGES = [
  {
    label: "Developer bath",
    text: "Soaking the film... watch the images slowly appear.",
  },
  {
    label: "Lifting out",
    text: "Carefully lifting your prints out of the tray.",
  },
  {
    label: "Hang to dry",
    text: "Pinned on the line. Just a little longer...",
  },
  {
    label: "Ready",
    text: "Your photographs are ready.",
  },
];

const BUBBLES = [
  { left: "8%", delay: "0s", size: 6 },
  { left: "17%", delay: "1.1s", size: 4 },
  { left: "29%", delay: "0.5s", size: 8 },
  { left: "41%", delay: "1.8s", size: 5 },
  { left: "53%", delay: "0.2s", size: 7 },
  { left: "64%", delay: "1.4s", size: 4 },
  { left: "76%", delay: "0.8s", size: 6 },
  { left: "88%", delay: "2.1s", size: 5 },
];

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export default function DarkroomDeveloping({
  photos,
  onComplete,
}: DarkroomProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((current) => Math.min(current + 1, 100));
    }, 120);

    return () => window.clearInterval(timer);
  }, []);

  const count = Math.max(photos.length, 1);
  const lifted = progress >= LIFT_AT;
  const hung = progress >= HANG_AT;
  const done = progress >= 100;

  // 1 = soaking wet, 0 = dry
  const wetness = lifted ? clamp(1 - (progress - LIFT_AT) / 40) : 1;

  const stage = progress < LIFT_AT ? 0 : progress < HANG_AT ? 1 : done ? 3 : 2;

  return (
    <main
      className={`${serif.variable} ${mono.variable} ${hand.variable} relative min-h-screen overflow-hidden bg-[#0b0403] px-4 py-10 text-[#ecd2c0] selection:bg-[#c0392b] md:px-8 md:py-14`}
    >
      <style>{`
        .f-serif { font-family: var(--font-serif), Georgia, serif; }
        .f-mono { font-family: var(--font-mono), "Courier New", monospace; }
        .f-hand { font-family: var(--font-hand), cursive; }

        .grain {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
          animation: grainShift 0.9s steps(6) infinite;
        }
        @keyframes grainShift {
          0% { background-position: 0 0; }
          20% { background-position: -40px 25px; }
          40% { background-position: 30px -50px; }
          60% { background-position: -60px -20px; }
          80% { background-position: 45px 40px; }
          100% { background-position: 0 0; }
        }

        @keyframes lampGlow {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; }
        }
        .lamp-glow { animation: lampGlow 3s ease-in-out infinite; }

        @keyframes wave {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .wave-a { animation: wave 6s linear infinite; }
        .wave-b { animation: wave 9s linear infinite reverse; }

        @keyframes bubble {
          0% { transform: translateY(0) scale(0.7); opacity: 0; }
          15% { opacity: 0.8; }
          100% { transform: translateY(-110px) scale(1.1); opacity: 0; }
        }
        .bubble { animation: bubble 3.2s ease-in infinite; }

        @keyframes bob {
          0%, 100% { transform: translateY(0) rotate(-0.6deg); }
          50% { transform: translateY(3px) rotate(0.6deg); }
        }
        .bob { animation: bob 2.6s ease-in-out infinite; }

        @keyframes sway {
          0%, 100% { transform: rotate(-1.6deg); }
          50% { transform: rotate(1.6deg); }
        }
        .sway { transform-origin: 50% 0; animation: sway 3.4s ease-in-out infinite; }

        @keyframes drip {
          0% { transform: translateY(0) scaleY(0.6); opacity: 0; }
          15% { opacity: 0.9; }
          100% { transform: translateY(130px) scaleY(1.3); opacity: 0; }
        }
        .drip { animation: drip 1.7s ease-in infinite; }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
        .blink { animation: blink 1.2s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .grain, .lamp-glow, .wave-a, .wave-b, .bubble, .bob, .sway, .drip, .blink {
            animation: none;
          }
        }
      `}</style>

      {/* Safelight atmosphere */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_50%_-10%,rgba(210,40,25,0.5),rgba(120,20,12,0.18)_45%,transparent_72%)]" />
      <div className="grain pointer-events-none fixed inset-[-50px] z-[60] opacity-[0.14] mix-blend-screen" />
      <div className="pointer-events-none fixed inset-0 z-[55] bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.75)_100%)]" />

      {/* Hanging safelight */}
      <div className="pointer-events-none absolute left-1/2 top-0 z-10 flex -translate-x-1/2 flex-col items-center">
        <div className="h-10 w-px bg-[#3a1a15]" />
        <div className="relative h-7 w-16 rounded-t-full border border-[#5a1c14] bg-gradient-to-b from-[#4a1610] to-[#2a0c08]">
          <div className="lamp-glow absolute -bottom-2 left-1/2 h-3 w-10 -translate-x-1/2 rounded-full bg-[#ff4a33] shadow-[0_0_50px_20px_rgba(255,60,40,0.55)]" />
        </div>
      </div>

      <div className="relative z-20 mx-auto max-w-4xl pt-14 text-center">
        <p className="f-mono flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.35em] text-[#ff8a6e]">
          <span className="blink h-2 w-2 rounded-full bg-[#ff3b2b] shadow-[0_0_10px_3px_rgba(255,60,40,0.7)]" />
          Shutter Analog Lab · Safelight on
        </p>

        <h1 className="f-serif mt-4 text-4xl md:text-5xl">The Darkroom</h1>

        <p className="f-mono mt-3 text-xs text-[#ecd2c0]/55">
          Developing your memories, one frame at a time.
        </p>

        {/* ============ SCENE ============ */}
        <div className="relative isolate mt-10 h-[440px] overflow-hidden border border-[#7a1f14]/60 bg-gradient-to-b from-[#1c0a07] via-[#140706] to-[#0d0403] shadow-[0_0_90px_rgba(190,40,25,0.22),inset_0_0_60px_rgba(0,0,0,0.8)] md:h-[540px]">
          {/* Clothesline */}
          <div className="absolute inset-x-0 top-[11%] z-[5]">
            <div className="h-[2px] bg-gradient-to-r from-[#8a6a4a] via-[#d2b48c] to-[#8a6a4a] shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
            <div className="absolute -left-1 -top-1.5 h-3.5 w-3.5 rounded-full border-2 border-[#8a6a4a] bg-[#1c0a07]" />
            <div className="absolute -right-1 -top-1.5 h-3.5 w-3.5 rounded-full border-2 border-[#8a6a4a] bg-[#1c0a07]" />
          </div>

          <p
            className="f-hand absolute left-4 top-[2.5%] z-[6] -rotate-2 text-2xl text-[#ff9a7c] transition-opacity duration-1000"
            style={{ opacity: hung ? 0.85 : 0 }}
          >
            hang them up to dry ♡
          </p>

          {/* Photos */}
          <div
            className="absolute inset-0 z-20 grid px-3 md:px-6"
            style={{
              gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
            }}
          >
            {photos.map((photo, index) => {
              // each photo develops one after another while soaking
              const stagger =
                count > 1 ? (22 / (count - 1)) * index : 0;
              const level = clamp((progress - 4 - stagger) / 26);

              return (
                <div key={index} className="relative h-full px-1.5 md:px-3">
                  <div
                    className="absolute inset-x-1.5 md:inset-x-3"
                    style={{
                      top: lifted ? "14%" : "67%",
                      transition:
                        "top 2400ms cubic-bezier(0.4, 0, 0.2, 1)",
                      transitionDelay: `${index * 260}ms`,
                    }}
                  >
                    <div
                      className={hung ? "sway" : lifted ? "" : "bob"}
                      style={{ animationDelay: `${index * 0.45}s` }}
                    >
                      {/* Clothespin */}
                      <div
                        className="absolute -top-3.5 left-1/2 z-10 h-7 w-3 -translate-x-1/2 rounded-sm border border-[#3d2812] bg-gradient-to-b from-[#d2a971] to-[#8a6238] shadow-md transition-opacity duration-700"
                        style={{
                          opacity: lifted ? 1 : 0,
                          transitionDelay: `${1400 + index * 260}ms`,
                        }}
                      />

                      {/* Print */}
                      <div className="relative aspect-[4/3] overflow-hidden border-[5px] border-[#e7dcc8] bg-[#2a1410] shadow-[0_6px_16px_rgba(0,0,0,0.65)] md:border-[6px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo}
                          alt={`Developing frame ${index + 1}`}
                          className="h-full w-full object-cover"
                          style={{
                            opacity: 0.08 + 0.92 * level,
                            filter: `brightness(${0.12 + 0.88 * level}) saturate(${level}) blur(${(1 - level) * 5}px)`,
                            transition: "all 400ms linear",
                          }}
                        />

                        {/* Safelight tint (fades once out of the bath) */}
                        <div
                          className="pointer-events-none absolute inset-0 bg-[#a01e14] mix-blend-multiply transition-opacity duration-[1500ms]"
                          style={{ opacity: lifted ? 0.08 : 0.45 }}
                        />

                        {/* Wet gloss */}
                        <div
                          className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.45)_0%,transparent_40%,rgba(255,255,255,0.18)_100%)]"
                          style={{ opacity: lifted ? wetness * 0.8 : 0 }}
                        />

                        {level < 0.15 && (
                          <span className="f-mono absolute inset-0 flex items-center justify-center text-[10px] tracking-widest text-white/40">
                            FRAME {index + 1}
                          </span>
                        )}
                      </div>

                      {/* Drips */}
                      {lifted && wetness > 0.1 && (
                        <>
                          <span
                            className="drip absolute left-[30%] top-full h-2.5 w-1.5 rounded-full bg-[#c85a48]/80"
                            style={{ animationDelay: `${index * 0.35}s` }}
                          />
                          <span
                            className="drip absolute left-[68%] top-full h-2 w-1 rounded-full bg-[#c85a48]/80"
                            style={{ animationDelay: `${0.8 + index * 0.3}s` }}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ===== Developer tray ===== */}
          <div className="absolute inset-x-1 bottom-0 h-[34%] md:inset-x-3">
            {/* Back wall of the tray */}
            <div className="absolute inset-0 z-10 rounded-b-md border-x-2 border-t border-[#5a1c14] bg-gradient-to-b from-[#1d0a07] to-[#100504]" />

            {/* Liquid in front of the photos */}
            <div className="absolute inset-x-[2px] bottom-1.5 top-[22%] z-30 overflow-hidden">
              {/* Surface waves */}
              <div className="absolute inset-x-0 top-0 h-3.5 overflow-hidden">
                <svg
                  className="wave-a absolute left-0 top-0 h-3.5 w-[200%]"
                  viewBox="0 0 1200 20"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 10 Q 75 0 150 10 T 300 10 T 450 10 T 600 10 T 750 10 T 900 10 T 1050 10 T 1200 10 L1200 20 L0 20 Z"
                    fill="rgba(160,40,28,0.75)"
                  />
                </svg>
                <svg
                  className="wave-b absolute left-0 top-0 h-3.5 w-[200%]"
                  viewBox="0 0 1200 20"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 12 Q 75 20 150 12 T 300 12 T 450 12 T 600 12 T 750 12 T 900 12 T 1050 12 T 1200 12 L1200 20 L0 20 Z"
                    fill="rgba(110,24,16,0.6)"
                  />
                </svg>
              </div>

              {/* Liquid body */}
              <div className="absolute inset-x-0 bottom-0 top-3 bg-gradient-to-b from-[rgba(150,36,26,0.62)] to-[rgba(70,12,9,0.88)] backdrop-blur-[2px]" />

              {/* Bubbles */}
              <div
                className="absolute inset-0 transition-opacity duration-1000"
                style={{ opacity: lifted ? 0 : 1 }}
              >
                {BUBBLES.map((bubble, i) => (
                  <span
                    key={i}
                    className="bubble absolute bottom-2 rounded-full border border-[#ffb4a0]/50 bg-[#ffb4a0]/15"
                    style={{
                      left: bubble.left,
                      width: bubble.size,
                      height: bubble.size,
                      animationDelay: bubble.delay,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Front lip + label */}
            <div className="absolute inset-x-0 bottom-0 z-40 flex h-7 items-center justify-center rounded-b-md border border-[#6a241a] bg-gradient-to-b from-[#3a1510] to-[#1a0806] shadow-[0_6px_16px_rgba(0,0,0,0.7)]">
              <span className="f-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[#ff9a7c]/80">
                Developer · 20°C · Tray 01
              </span>
            </div>
          </div>
        </div>

        {/* ============ STAGES ============ */}
        <div className="mt-6 grid grid-cols-2 gap-px border border-[#7a1f14]/40 bg-[#7a1f14]/30 md:grid-cols-4">
          {STAGES.map((item, i) => {
            const active = i === stage;
            const passed = i < stage;

            return (
              <div
                key={item.label}
                className={`px-3 py-3 text-left transition-colors ${
                  active ? "bg-[#2a0d09]" : "bg-[#120504]"
                }`}
              >
                <div className="f-mono flex items-center gap-2 text-[9px] uppercase tracking-[0.2em]">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      active
                        ? "blink bg-[#ff3b2b] shadow-[0_0_8px_2px_rgba(255,60,40,0.7)]"
                        : passed
                          ? "bg-[#ff8a6e]"
                          : "bg-[#ecd2c0]/20"
                    }`}
                  />
                  <span
                    className={
                      active || passed ? "text-[#ff9a7c]" : "text-[#ecd2c0]/35"
                    }
                  >
                    0{i + 1}
                  </span>
                </div>
                <p
                  className={`f-serif mt-1 text-sm ${
                    active ? "text-[#ecd2c0]" : "text-[#ecd2c0]/40"
                  }`}
                >
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Progress */}
        <div className="mx-auto mt-8 max-w-md">
          <div className="f-mono mb-3 flex justify-between text-xs text-[#ecd2c0]/70">
            <span>
              {done ? "DEVELOPMENT COMPLETE" : STAGES[stage].label.toUpperCase() + "..."}
            </span>
            <span>{progress}%</span>
          </div>

          <div className="h-1.5 overflow-hidden bg-[#3a1510]">
            <div
              className="h-full bg-[#e0452f] shadow-[0_0_10px_rgba(255,70,50,0.8)] transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <p className="f-serif mt-6 italic text-[#ff9a7c]/90">
          {STAGES[stage].text}
        </p>

        <button
          onClick={onComplete}
          disabled={!done}
          className="f-mono mt-8 border border-[#ecd2c0]/40 px-8 py-4 text-xs uppercase tracking-[0.2em] transition hover:bg-[#9b2a1c] disabled:cursor-not-allowed disabled:opacity-30"
        >
          View Developed Photos →
        </button>
      </div>
    </main>
  );
}