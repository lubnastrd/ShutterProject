
import Link from "next/link";
import { Playfair_Display, Courier_Prime, Caveat } from "next/font/google";
import {
  Aperture,
  ArrowUpRight,
  Camera,
  Clock3,
  Film,
  Images,
  ScanLine,
  Sparkles,
  Star,
  Droplets,
  Sun,
  Timer,
} from "lucide-react";

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

const features = [
  {
    number: "01",
    name: "THE CAMERA ROOM",
    title: "Step into the frame.",
    description:
      "Find your angle, get comfortable, and capture the moment with our virtual analog camera.",
    icon: Camera,
    stamp: "LIVE VIEW",
  },
  {
    number: "02",
    name: "THE FILM DEPARTMENT",
    title: "Choose your film.",
    description:
      "From warm nostalgic tones to faded colors. Every film stock tells a different story.",
    icon: Film,
    stamp: "35 MM",
  },
  {
    number: "03",
    name: "THE MEMORY ARCHIVE",
    title: "Keep it forever.",
    description:
      "Collect your photographs, arrange your contact sheet, and take your memories home.",
    icon: Images,
    stamp: "EST. 2026",
  },
];

const darkroomSteps = [
  { icon: Droplets, name: "Developer", time: "02:00", note: "The image appears." },
  { icon: Timer, name: "Stop bath", time: "00:30", note: "Hold that moment." },
  { icon: Sparkles, name: "Fixer", time: "05:00", note: "Make it last." },
  { icon: Sun, name: "Dry & print", time: "∞", note: "Hang it up." },
];

const tones = [
  "linear-gradient(160deg,#c9a977 0%,#8a7352 50%,#3a3328 100%)",
  "linear-gradient(200deg,#d9bf94 0%,#a3825a 45%,#4a3b2c 100%)",
  "linear-gradient(140deg,#a8b09a 0%,#6f7a63 50%,#2f3629 100%)",
  "linear-gradient(180deg,#e0c59a 0%,#b58b5d 40%,#5a4030 100%)",
  "linear-gradient(150deg,#b9a27c 0%,#7d6a4d 55%,#2c2a22 100%)",
  "linear-gradient(210deg,#d8b887 0%,#9b6f4a 50%,#3b2b22 100%)",
];

const filmFrames = ["01", "02", "03", "04", "05", "06"];
const contactFrames = Array.from({ length: 12 }, (_, i) => i + 1);

export default function Home() {
  return (
    <main
      className={`${serif.variable} ${mono.variable} ${hand.variable} relative min-h-screen overflow-hidden bg-[#e4d6b8] text-[#2a2119] selection:bg-[#8c3a2c] selection:text-[#f0e5d0]`}
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

        .paper {
          background-color: #e4d6b8;
          background-image:
            radial-gradient(ellipse at 15% 10%, rgba(170,120,60,0.16), transparent 45%),
            radial-gradient(ellipse at 85% 90%, rgba(120,70,40,0.18), transparent 50%),
            radial-gradient(ellipse at 70% 30%, rgba(255,245,220,0.35), transparent 40%);
        }

        .sprockets {
          height: 12px;
          background-image: linear-gradient(90deg, #e4d6b8 0 14px, transparent 14px 30px);
          background-size: 30px 100%;
          border-radius: 2px;
          opacity: 0.92;
        }

        @keyframes filmroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .filmroll { animation: filmroll 50s linear infinite; }

        @keyframes flicker {
          0%, 100% { opacity: 1; }
          47% { opacity: 1; }
          48% { opacity: 0.55; }
          50% { opacity: 1; }
          72% { opacity: 0.8; }
          74% { opacity: 1; }
        }

        .flicker { animation: flicker 5s infinite; }

        @keyframes safelight {
          0%, 100% { box-shadow: 0 0 8px 2px rgba(220,60,40,0.7); }
          50% { box-shadow: 0 0 16px 5px rgba(220,60,40,0.95); }
        }

        .safelight { animation: safelight 2.4s ease-in-out infinite; }

        .ink-stamp {
          mix-blend-mode: multiply;
          filter: contrast(1.1) blur(0.2px);
        }

        @media (prefers-reduced-motion: reduce) {
          .grain, .filmroll, .flicker, .safelight { animation: none; }
        }
      `}</style>

      {/* Film grain and vignette */}
      <div className="grain pointer-events-none fixed inset-[-50px] z-[60] opacity-[0.22] mix-blend-multiply" />
      <div className="pointer-events-none fixed inset-0 z-[55] bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(60,35,15,0.32)_100%)]" />

      {/* Top announcement */}
      <div className="f-mono flex items-center justify-center gap-3 bg-[#1d1410] px-4 py-2 text-center text-[9px] font-bold uppercase tracking-[0.28em] text-[#e8d9b8]">
        <span className="safelight h-2 w-2 rounded-full bg-[#dc3c28]" />
        <span>A little nostalgia</span>
        <span className="safelight h-2 w-2 rounded-full bg-[#dc3c28]" />
      </div>

      {/* Header */}
      <header className="paper relative z-20 border-b-2 border-double border-[#2a2119]/50">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3.5 md:px-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#2a2119] bg-[#efe3c8]">
              <Aperture size={21} strokeWidth={1.3} />
            </div>

            <div>
              <p className="f-serif text-xl font-bold leading-none tracking-[0.12em]">
                SHUTTER
              </p>
              <p className="f-mono mt-1 text-[8px] uppercase tracking-[0.3em] text-[#5a4430]">
                Analog photo lab · est. 2026
              </p>
            </div>
          </Link>

          <nav className="f-mono hidden items-center gap-7 text-[10px] font-bold uppercase tracking-[0.16em] md:flex">
            <Link href="#studio" className="hover:text-[#8c3a2c]">
              The Studio
            </Link>
            <Link href="#process" className="hover:text-[#8c3a2c]">
              Our Process
            </Link>
            <Link href="#darkroom" className="hover:text-[#8c3a2c]">
              Darkroom
            </Link>
            <Link href="/archive" className="hover:text-[#8c3a2c]">
              Archive
            </Link>
          </nav>

          <Link
            href="/booth"
            className="f-mono flex items-center gap-2 border-2 border-[#2a2119] px-3.5 py-2.5 text-[9px] font-bold uppercase tracking-[0.14em] transition-colors hover:bg-[#2a2119] hover:text-[#f0e5d0]"
          >
            Enter lab <ArrowUpRight size={12} />
          </Link>
        </div>
      </header>

      {/* Hero section - full width background */}
      <div className="paper w-full">
        <section
          id="studio"
          className="relative mx-auto grid max-w-[1200px] gap-8 px-6 pb-16 pt-12 md:grid-cols-[1.05fr_0.95fr] md:items-center md:px-10 md:pb-20 md:pt-16"
        >
          <div className="pointer-events-none absolute left-[48%] top-12 hidden h-28 w-28 rounded-full border border-[#2a2119]/15 lg:block" />

          <div className="f-mono pointer-events-none absolute bottom-8 left-10 hidden text-[9px] tracking-[0.2em] text-[#2a2119]/45 lg:block">
            FIG. 001 — THE BEGINNING
          </div>

          {/* Hero text */}
          <div className="relative z-10">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-9 bg-[#8c3a2c]" />
              <span className="f-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c3a2c]">
                Welcome to the booth!
              </span>
            </div>

            <p className="f-mono mb-3 text-[10px] uppercase tracking-[0.25em] text-[#5a4430]">
              A place for your little memories
            </p>

            <h1 className="f-serif max-w-[600px] text-[clamp(3.5rem,6vw,6rem)] font-medium leading-[0.85] tracking-[-0.05em] [text-shadow:1px_1px_0_rgba(140,58,44,0.18)]">
              Life in
              <br />
              <span className="italic text-[#8c3a2c]">still</span>
              <br />
              frames.
            </h1>

            <div className="ml-2 mt-6 max-w-md border-l-2 border-[#8c3a2c] pl-4">
              <p className="f-serif text-lg leading-relaxed text-[#4a3a2a] md:text-xl">
                Capture the moment.
                <br />
                <span className="italic">Keep the memory.</span>
              </p>

              <p className="f-mono mt-3 text-[12px] leading-6 text-[#5a4430]">
                Step into our little analog-inspired photo lab. Take a picture,
                choose your film, and turn ordinary moments into something
                worth keeping.
              </p>

              <p className="f-hand mt-2 -rotate-2 text-xl text-[#8c3a2c]">
                — handle with care ♡
              </p>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link
                href="/booth"
                className="f-mono group flex items-center gap-4 border-2 border-[#2a2119] bg-[#2a2119] px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f0e5d0] shadow-[4px_4px_0px_#8c3a2c] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                <Camera size={15} />
                Start photobooth
                <ArrowUpRight
                  size={14}
                  className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                />
              </Link>

              <span className="f-mono text-[9px] uppercase tracking-[0.12em] text-[#5a4430]">
                No rush. Just memories.
              </span>
            </div>

            <div className="mt-10 flex items-center gap-4 border-t border-dashed border-[#2a2119]/35 pt-4">
              <Clock3 size={15} strokeWidth={1.4} />
              <p className="f-mono text-[9px] uppercase tracking-[0.16em] text-[#5a4430]">
                Take your time · Enjoy the process
              </p>
            </div>
          </div>

          {/* Analog camera composition */}
          <div className="relative mx-auto w-full max-w-[450px]">
            {/* Red laboratory stamp */}
            <div className="ink-stamp absolute -right-1 -top-7 z-20 rotate-12 rounded-full border-[3px] border-double border-[#8c3a2c] px-3 py-2.5 text-center text-[#8c3a2c] md:-right-5">
              <p className="f-serif text-xs font-bold italic">SHUTTER</p>
              <p className="f-mono text-[7px] font-bold tracking-[0.15em]">
                PHOTO LAB
              </p>
              <p className="f-mono text-[7px] font-bold">NO. 001</p>
            </div>

            {/* Tape */}
            <div className="absolute -top-3 left-7 z-20 h-5 w-20 -rotate-6 border border-[#b79d6a]/50 bg-[#e6d39a]/70 shadow-sm" />

            {/* Photo paper */}
            <div className="relative rotate-2 bg-[#d9c7a0] p-3 shadow-[8px_12px_25px_rgba(41,28,15,0.35)] md:p-4">
              <div className="f-mono flex items-center justify-between border-b border-[#5a4430]/40 pb-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-[#4a3a2a]">
                <span>SHUTTER / CAMERA 01</span>
                <span>35 MM COLOR</span>
              </div>

              {/* Viewfinder */}
              <div className="relative mt-3 aspect-[4/5] overflow-hidden border-[5px] border-[#1d1410] bg-[#514436]">
                <div className="absolute inset-0 [filter:sepia(0.45)_contrast(1.08)_saturate(0.85)]">
                  <div className="absolute inset-0 bg-[linear-gradient(160deg,#c4a97f_0%,#8a7452_36%,#504738_68%,#251f18_100%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(238,230,216,0.42),transparent_45%)]" />

                  {/* Sun */}
                  <div className="absolute right-[18%] top-[17%] h-16 w-16 rounded-full bg-[#e0bf8a]/85 blur-[2px] md:h-24 md:w-24" />

                  {/* Landscape */}
                  <div className="absolute -bottom-8 left-[-10%] h-[45%] w-[120%] rotate-[-8deg] rounded-[50%] bg-[#75634b]" />
                  <div className="absolute -bottom-16 right-[-15%] h-[55%] w-[110%] rotate-[12deg] rounded-[50%] bg-[#3c4435]" />
                  <div className="absolute bottom-0 left-0 h-[27%] w-full bg-[#292e27]/70" />
                </div>

                {/* Light leak */}
                <div className="pointer-events-none absolute inset-y-0 right-0 w-2/5 bg-gradient-to-l from-[#ff7a1a]/55 via-[#e0501f]/20 to-transparent mix-blend-screen" />
                <div className="pointer-events-none absolute -left-10 bottom-0 h-1/2 w-1/3 bg-gradient-to-tr from-[#c8321e]/30 to-transparent mix-blend-screen" />

                {/* Scratches and dust */}
                <div className="pointer-events-none absolute left-[22%] top-0 h-full w-px bg-[#f0e5d0]/25" />
                <div className="pointer-events-none absolute left-[71%] top-0 h-[60%] w-px bg-[#f0e5d0]/20" />
                <div className="pointer-events-none absolute left-[34%] top-[20%] h-1 w-1 rounded-full bg-[#f0e5d0]/50" />
                <div className="pointer-events-none absolute left-[58%] top-[64%] h-1.5 w-1.5 rounded-full bg-[#f0e5d0]/35" />

                {/* Grain texture */}
                <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(#f0e5d0_0.65px,transparent_0.65px)] [background-size:4px_4px]" />

                {/* Inner vignette */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(20,10,0,0.55)_100%)]" />

                {/* Camera overlay */}
                <div className="f-mono absolute left-3 top-3 flex items-center gap-2 text-[#f0e5d0]">
                  <span className="flicker h-2 w-2 rounded-full bg-[#dc3c28]" />
                  <span className="text-[8px] uppercase tracking-[0.2em]">
                    Viewfinder active
                  </span>
                </div>

                {/* Focus corners */}
                <div className="pointer-events-none absolute left-5 top-10 h-4 w-4 border-l-2 border-t-2 border-[#f0e5d0]/70" />
                <div className="pointer-events-none absolute right-5 top-10 h-4 w-4 border-r-2 border-t-2 border-[#f0e5d0]/70" />
                <div className="pointer-events-none absolute bottom-14 left-5 h-4 w-4 border-b-2 border-l-2 border-[#f0e5d0]/70" />
                <div className="pointer-events-none absolute bottom-14 right-5 h-4 w-4 border-b-2 border-r-2 border-[#f0e5d0]/70" />

                {/* Aperture */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative flex h-36 w-36 items-center justify-center rounded-full border border-[#f0e5d0]/60 md:h-48 md:w-48">
                    <div className="absolute h-[75%] w-[75%] rounded-full border border-dashed border-[#f0e5d0]/40" />
                    <div className="absolute h-[55%] w-[55%] rounded-full border border-[#f0e5d0]/30" />
                    <Aperture
                      size={75}
                      strokeWidth={0.65}
                      className="text-[#f0e5d0]/85 md:h-20 md:w-20"
                    />
                    <div className="f-mono absolute -bottom-7 whitespace-nowrap text-[8px] uppercase tracking-[0.2em] text-[#f0e5d0]">
                      Frame your moment
                    </div>
                  </div>
                </div>

                {/* Date stamp */}
                <div className="f-mono absolute bottom-12 right-3 text-xs font-bold tracking-[0.12em] text-[#ff9a3c] [text-shadow:0_0_6px_rgba(255,130,40,0.85)]">
                  &apos;26 11 07
                </div>

                {/* Viewfinder data */}
                <div className="f-mono absolute bottom-3 left-3 right-3 flex items-end justify-between text-[#f0e5d0]">
                  <div>
                    <p className="text-[7px] uppercase tracking-[0.18em] opacity-70">
                      Exposure
                    </p>
                    <p className="mt-1 text-[10px]">1/125 · F/2.8</p>
                  </div>

                  <div className="text-right">
                    <p className="text-[7px] uppercase tracking-[0.18em] opacity-70">
                      Frame count
                    </p>
                    <p className="mt-1 text-lg">00 / 12</p>
                  </div>
                </div>
              </div>

              {/* Photo caption */}
              <div className="flex items-end justify-between pt-3">
                <div>
                  <p className="f-hand text-xl leading-none text-[#4a3a2a]">
                    A moment worth keeping.
                  </p>
                  <p className="f-mono mt-2 text-[7px] uppercase tracking-[0.18em] text-[#5a4430]">
                    Color negative · ISO 400
                  </p>
                </div>
                <span className="f-mono text-[9px] text-[#4a3a2a]">
                  001/012
                </span>
              </div>
            </div>

            {/* Film counter label */}
            <div className="absolute -bottom-7 -left-4 z-20 -rotate-6 bg-[#8c3a2c] px-4 py-3 text-[#f0e5d0] shadow-lg md:-left-7">
              <p className="f-mono text-[8px] uppercase tracking-[0.2em]">
                Developed with love
              </p>
              <p className="f-serif mt-1 text-lg italic">Since always.</p>
            </div>
          </div>
        </section>
      </div>

      {/* Film negative strip */}
      <section className="relative overflow-hidden bg-[#1d1410] py-4 text-[#d9c7a0]">
        <div className="f-mono mb-2 flex justify-between px-6 text-[8px] tracking-[0.3em] text-[#d9c7a0]/70">
          <span>KODAK STYLE · 35 MM NEGATIVE</span>
          <span>ISO 400 · COLOR FILM</span>
        </div>

        <div className="sprockets mb-1.5" />

        <div className="filmroll flex w-max gap-1">
          {[...filmFrames, ...filmFrames, ...filmFrames, ...filmFrames].map(
            (frame, i) => (
              <div
                key={i}
                className="relative flex h-24 w-36 shrink-0 items-center justify-center border border-[#d9c7a0]/20 md:h-28 md:w-44"
                style={{ background: tones[i % tones.length] }}
              >
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,225,170,0.35),transparent_65%)]" />
                <span className="absolute inset-0 opacity-30 [background-image:radial-gradient(#f0e5d0_0.6px,transparent_0.6px)] [background-size:4px_4px]" />
                <span className="f-serif relative text-2xl italic text-[#f0e5d0]/85">
                  {frame}
                </span>
                <span className="f-mono absolute bottom-1 right-2 text-[7px] tracking-[0.2em] text-[#ff9a3c]/90">
                  ▸ {String((i % 6) + 1).padStart(2, "0")}A
                </span>
              </div>
            ),
          )}
        </div>

        <div className="sprockets mt-1.5" />

        <div className="f-mono mt-2 flex justify-between px-6 text-[8px] tracking-[0.3em] text-[#d9c7a0]/70">
          <span>SHUTTER FILM DEPARTMENT</span>
          <span>MADE FOR MEMORIES</span>
        </div>
      </section>

      {/* Process section */}
      <section
        id="process"
        className="paper relative mx-auto max-w-[1200px] px-6 py-16 md:px-10 md:py-20"
      >
        <div className="mb-10 grid gap-6 md:grid-cols-[1fr_0.7fr] md:items-end">
          <div>
            <p className="f-mono mb-3 text-[9px] font-bold uppercase tracking-[0.25em] text-[#8c3a2c]">
              / Inside the laboratory
            </p>

            <h2 className="f-serif text-4xl leading-[0.95] tracking-[-0.04em] md:text-6xl">
              The art of
              <br />
              <span className="italic text-[#8c3a2c]">slowing down.</span>
            </h2>
          </div>

          <p className="f-mono max-w-sm text-[12px] leading-6 text-[#5a4430]">
            Good photographs are not just taken. They are experienced.
            Discover the little rituals behind every frame.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.number}
                className={`group relative border border-[#5a4430]/45 bg-[#efe3c8] p-6 shadow-[5px_6px_0px_rgba(90,68,48,0.18)] transition-transform hover:-translate-y-1 hover:rotate-0 md:p-7 ${
                  i % 2 === 0 ? "-rotate-[0.8deg]" : "rotate-[0.8deg]"
                }`}
              >
                <div className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-3 border border-[#b79d6a]/40 bg-[#e6d39a]/70" />

                <div className="flex items-center justify-between border-b border-dashed border-[#5a4430]/40 pb-4">
                  <span className="f-mono text-[10px] font-bold text-[#8c3a2c]">
                    FRAME {feature.number}
                  </span>
                  <Icon size={20} strokeWidth={1.2} />
                </div>

                <div className="my-6 flex h-14 w-14 items-center justify-center rounded-full border-2 border-double border-[#8c3a2c]/50 text-[#8c3a2c]">
                  <Icon size={27} strokeWidth={1.1} />
                </div>

                <p className="f-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[#8c3a2c]">
                  {feature.name}
                </p>

                <h3 className="f-serif mt-3 text-2xl leading-tight">
                  {feature.title}
                </h3>

                <p className="f-mono mt-3 text-[12px] leading-6 text-[#5a4430]">
                  {feature.description}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-dashed border-[#5a4430]/40 pt-4">
                  <span className="f-mono text-[8px] font-bold uppercase tracking-[0.15em] text-[#5a4430]">
                    {feature.stamp}
                  </span>

                  <ArrowUpRight
                    size={15}
                    className="text-[#8c3a2c] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                  />
                </div>

                <div className="ink-stamp f-mono pointer-events-none absolute right-3 top-3 rotate-12 border-2 border-[#8c3a2c]/60 px-2 py-1 text-[7px] font-bold text-[#8c3a2c]">
                  LAB COPY
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Darkroom */}
      <section
        id="darkroom"
        className="relative overflow-hidden bg-[#1d1410] px-6 py-16 text-[#e8d9b8] md:px-10 md:py-20"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(200,50,30,0.38),transparent_60%)]" />

        <div className="relative mx-auto max-w-[1200px]">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="f-mono mb-3 flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.25em] text-[#ff7a5c]">
                <span className="safelight h-2 w-2 rounded-full bg-[#dc3c28]" />
                The darkroom · safelight on
              </p>

              <h2 className="f-serif text-3xl leading-tight md:text-5xl">
                Good things{" "}
                <span className="italic text-[#ff9a7c]">
                  develop slowly.
                </span>
              </h2>
            </div>

            <p className="f-hand max-w-xs -rotate-1 text-xl text-[#e8d9b8]/80">
              don&apos;t open the door, the picture&apos;s still coming up...
            </p>
          </div>

          <div className="grid gap-px border border-[#e8d9b8]/20 bg-[#e8d9b8]/20 sm:grid-cols-2 lg:grid-cols-4">
            {darkroomSteps.map((step, i) => {
              const Icon = step.icon;

              return (
                <div key={step.name} className="bg-[#1d1410] p-6">
                  <div className="f-mono flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-[#e8d9b8]/60">
                    <span>Tray 0{i + 1}</span>
                    <Icon size={17} strokeWidth={1.3} className="text-[#ff7a5c]" />
                  </div>

                  <p className="f-serif mt-6 text-xl">{step.name}</p>

                  <p className="f-mono mt-2 text-2xl font-bold text-[#ff9a3c] [text-shadow:0_0_10px_rgba(255,130,40,0.6)]">
                    {step.time}
                  </p>

                  <p className="f-hand mt-3 text-lg text-[#e8d9b8]/75">
                    {step.note}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Archive callout */}
      <section
        id="archive"
        className="paper mx-5 my-14 border-2 border-[#2a2119] p-4 md:mx-10 md:p-8"
      >
        <div className="border border-dashed border-[#2a2119]/40 p-5 md:p-9">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="f-mono text-[9px] font-bold uppercase tracking-[0.25em] text-[#8c3a2c]">
                Your memories, carefully developed
              </p>

              <h2 className="f-serif mt-4 max-w-2xl text-3xl leading-tight md:text-5xl">
                Some moments deserve
                <span className="italic text-[#8c3a2c]"> a second look.</span>
              </h2>

              <p className="f-mono mt-4 max-w-lg text-[12px] leading-6 text-[#5a4430]">
                Your photographs become little keepsakes. Collect them,
                revisit them, and remember how it felt.
              </p>
            </div>

            {/* Contact sheet */}
            <div className="relative mx-auto w-full max-w-[280px] rotate-2 bg-[#1d1410] p-3 shadow-xl">
              <div className="sprockets mb-2 opacity-60" />

              <div className="grid grid-cols-4 gap-1.5">
                {contactFrames.map((n) => (
                  <div
                    key={n}
                    className="relative aspect-[3/4] overflow-hidden"
                    style={{ background: tones[n % tones.length] }}
                  >
                    <span className="absolute inset-0 opacity-30 [background-image:radial-gradient(#f0e5d0_0.6px,transparent_0.6px)] [background-size:4px_4px]" />

                    <span className="f-mono absolute bottom-0.5 left-1 text-[7px] text-[#ff9a3c]">
                      {n}
                    </span>
                  </div>
                ))}
              </div>

              <div className="sprockets mt-2 opacity-60" />

              <div className="pointer-events-none absolute left-[27%] top-[39%] h-16 w-14 -rotate-6 rounded-[50%] border-[3px] border-[#d8402c]/90" />

              <p className="f-hand absolute -bottom-8 left-4 -rotate-3 text-xl font-bold text-[#8c3a2c]">
                this one! ↑
              </p>

              <div className="ink-stamp absolute -right-4 -top-4 rotate-12 rounded-full border-[3px] border-double border-[#8c3a2c] bg-[#e4d6b8] p-2.5 text-center text-[8px] font-bold text-[#8c3a2c]">
                <Star size={11} className="mx-auto mb-1" />
                <span className="f-mono">
                  KEEP
                  <br />
                  FOREVER
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1d1410] px-6 py-9 text-[#f0e5d0] md:px-10">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-8 border-b border-[#f0e5d0]/20 pb-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-3">
                <Aperture size={23} />
                <span className="f-serif text-xl font-bold tracking-[0.16em]">
                  SHUTTER
                </span>
              </div>

              <p className="f-serif mt-3 max-w-xs text-base italic text-[#d9c7a0]">
                Capture the moment. Keep the memory.
              </p>
            </div>

            <div>
              <p className="f-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#c0a57d]">
                Laboratory notes
              </p>

              <p className="f-mono mt-3 text-[11px] leading-6 text-[#d9c7a0]/75">
                A digital space inspired by the warmth, imperfections,
                and magic of analog photography.
              </p>
            </div>

            <div>
              <p className="f-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#c0a57d]">
                Find us
              </p>

              <div className="f-mono mt-3 flex items-center gap-3 text-[11px] text-[#d9c7a0]/75">
                <Camera size={15} />
                <span>Made for the love of photography</span>
              </div>

              <div className="f-mono mt-2 flex items-center gap-3 text-[11px] text-[#d9c7a0]/75">
                <ScanLine size={15} />
                <span>Analog inspired · Digitally developed</span>
              </div>
            </div>
          </div>

          <div className="f-mono flex flex-col justify-between gap-3 pt-5 text-[8px] uppercase tracking-[0.17em] text-[#d9c7a0]/55 md:flex-row">
            <span>© 2026 SHUTTER PHOTO LABORATORY</span>
            <span>THANK YOU FOR STOPPING BY.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
