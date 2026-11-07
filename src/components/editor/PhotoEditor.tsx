"use client";

import {
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  WandSparkles,
} from "lucide-react";
import {
  Playfair_Display,
  Courier_Prime,
  Caveat,
  Anton,
} from "next/font/google";

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

/* ------------------------------------------------------------------ */
/*  FILM STOCKS                                                        */
/* ------------------------------------------------------------------ */

const display = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

type Blend = "soft-light" | "multiply" | "screen" | "overlay";

type Layer =
  | { kind: "tint"; color: string; alpha: number; blend: Blend }
  | {
      kind: "leak";
      color: string;
      alpha: number;
      side: "left" | "right" | "top" | "bottom";
    };

export type FilmFilter = {
  id: string;
  name: string;
  stock: string;
  /** base color grading (CSS / canvas filter) */
  css: string;
  /** lifted blacks / faded look, 0–1 */
  fade: number;
  /** darkened corners, 0–1 */
  vignette: number;
  /** film grain strength, 0–1 */
  grain: number;
  /** color casts & light leaks */
  layers: Layer[];
};

export const FILM_FILTERS: FilmFilter[] = [
  {
    id: "original",
    name: "Original",
    stock: "No film",
    css: "none",
    fade: 0,
    vignette: 0,
    grain: 0,
    layers: [],
  },
  {
    id: "booth",
    name: "Booth Sepia",
    stock: "Warm mono · dark photobooth",
    css: "grayscale(100%) sepia(60%) contrast(128%) brightness(90%)",
    fade: 0.03,
    vignette: 0.38,
    grain: 0.5,
    layers: [{ kind: "tint", color: "#3b2a1c", alpha: 0.18, blend: "multiply" }],
  },
  {
    id: "portra",
    name: "Portra 400",
    stock: "Warm · soft · natural skin",
    css: "sepia(14%) saturate(86%) contrast(92%) brightness(106%)",
    fade: 0.05,
    vignette: 0.16,
    grain: 0.16,
    layers: [{ kind: "tint", color: "#f4c9a0", alpha: 0.14, blend: "soft-light" }],
  },
  {
    id: "gold",
    name: "Gold 200",
    stock: "Golden · sunny · nostalgic",
    css: "sepia(32%) saturate(128%) contrast(98%) brightness(104%) hue-rotate(-6deg)",
    fade: 0.03,
    vignette: 0.24,
    grain: 0.24,
    layers: [{ kind: "tint", color: "#ffb040", alpha: 0.16, blend: "soft-light" }],
  },
  {
    id: "superia",
    name: "Superia 400",
    stock: "Fresh · green cast · punchy",
    css: "saturate(122%) contrast(108%) hue-rotate(-8deg) brightness(102%)",
    fade: 0,
    vignette: 0.2,
    grain: 0.3,
    layers: [{ kind: "tint", color: "#3fae86", alpha: 0.12, blend: "soft-light" }],
  },
  {
    id: "ektar",
    name: "Ektar 100",
    stock: "Vivid · ultra saturated",
    css: "saturate(155%) contrast(118%) brightness(99%)",
    fade: 0,
    vignette: 0.22,
    grain: 0.1,
    layers: [],
  },
  {
    id: "cinestill",
    name: "CineStill 800T",
    stock: "Teal shadows · red halation",
    css: "saturate(112%) contrast(110%) hue-rotate(-12deg) brightness(97%)",
    fade: 0.02,
    vignette: 0.28,
    grain: 0.3,
    layers: [
      { kind: "tint", color: "#2b6fa6", alpha: 0.2, blend: "soft-light" },
      { kind: "leak", color: "#ff3d2a", alpha: 0.22, side: "right" },
    ],
  },
  {
    id: "polaroid",
    name: "Polaroid 600",
    stock: "Faded · cool blacks · instant",
    css: "saturate(88%) contrast(86%) brightness(110%) hue-rotate(6deg) sepia(10%)",
    fade: 0.09,
    vignette: 0.2,
    grain: 0.2,
    layers: [
      { kind: "tint", color: "#7fc6c0", alpha: 0.14, blend: "soft-light" },
      { kind: "leak", color: "#ffd27a", alpha: 0.3, side: "left" },
    ],
  },
  {
    id: "expired",
    name: "Expired '98",
    stock: "Magenta shift · light leak",
    css: "saturate(92%) contrast(88%) brightness(104%) sepia(26%) hue-rotate(-18deg)",
    fade: 0.08,
    vignette: 0.3,
    grain: 0.34,
    layers: [
      { kind: "tint", color: "#c0508f", alpha: 0.16, blend: "soft-light" },
      { kind: "leak", color: "#ff7a1a", alpha: 0.4, side: "right" },
    ],
  },
  {
    id: "lomo",
    name: "Lomo 800",
    stock: "Hard contrast · heavy vignette",
    css: "saturate(145%) contrast(126%) brightness(98%)",
    fade: 0,
    vignette: 0.55,
    grain: 0.22,
    layers: [{ kind: "tint", color: "#6a1b3a", alpha: 0.12, blend: "multiply" }],
  },
  {
    id: "hp5",
    name: "Ilford HP5",
    stock: "Classic black & white",
    css: "grayscale(100%) contrast(112%) brightness(104%)",
    fade: 0.02,
    vignette: 0.2,
    grain: 0.38,
    layers: [],
  },
  {
    id: "trix",
    name: "Tri-X 400",
    stock: "Gritty · high-contrast B&W",
    css: "grayscale(100%) contrast(138%) brightness(98%)",
    fade: 0,
    vignette: 0.3,
    grain: 0.55,
    layers: [],
  },
];

/* ------------------------------------------------------------------ */
/*  PHOTOSTRIP FRAMES (exported so the generator can share them)       */
/* ------------------------------------------------------------------ */

export type StripLayout = "strip" | "film" | "grid" | "wide";

export type PhotostripFrame = {
  id: string;
  name: string;
  description: string;
  layout: StripLayout;
  paper: string;
  ink: string;
  accent: string;
  textColor: string;
};

export const PHOTOSTRIP_FRAMES: PhotostripFrame[] = [
  {
    id: "classic",
    name: "Classic Booth",
    description: "1×4 vertical",
    layout: "strip",
    paper: "#eee3cd",
    ink: "#514436",
    accent: "#9b4236",
    textColor: "#3a2f24",
  },
  {
    id: "dark",
    name: "Darkroom",
    description: "1×4 vertical",
    layout: "strip",
    paper: "#29251f",
    ink: "#b99c75",
    accent: "#ff9a3c",
    textColor: "#e8d9b8",
  },
  {
    id: "red",
    name: "Vintage Red",
    description: "1×4 vertical",
    layout: "strip",
    paper: "#9b4236",
    ink: "#eee3cd",
    accent: "#f6e7c8",
    textColor: "#f0e5d0",
  },
  {
    id: "pink",
    name: "Retro Pink",
    description: "1×4 vertical",
    layout: "strip",
    paper: "#e8c5bd",
    ink: "#754e4a",
    accent: "#9b4236",
    textColor: "#5a3a36",
  },
  {
    id: "noir",
    name: "Booth Noir",
    description: "Black strip + big caption",
    layout: "strip",
    paper: "#0c0a09",
    ink: "#0c0a09",
    accent: "#f5efe2",
    textColor: "#f5efe2",
  },
  {
    id: "film",
    name: "35mm Negative",
    description: "Film strip + sprockets",
    layout: "film",
    paper: "#1d1410",
    ink: "#d9c7a0",
    accent: "#ff9a3c",
    textColor: "#ff9a3c",
  },
  {
    id: "polaroid",
    name: "Polaroid Set",
    description: "2×2 instant prints",
    layout: "grid",
    paper: "#cdb99a",
    ink: "#3a2f24",
    accent: "#8c3a2c",
    textColor: "#3a2f24",
  },
  {
    id: "postcard",
    name: "Airmail Postcard",
    description: "2×2 vintage postcard",
    layout: "grid",
    paper: "#efe3c8",
    ink: "#2a3f6a",
    accent: "#b3342a",
    textColor: "#2a3f6a",
  },
  {
    id: "contact",
    name: "Contact Sheet",
    description: "2×2 lab proof",
    layout: "grid",
    paper: "#efe9da",
    ink: "#17100c",
    accent: "#d8402c",
    textColor: "#2a2119",
  },
  {
    id: "cinema",
    name: "Cinema Reel",
    description: "4×1 horizontal reel",
    layout: "wide",
    paper: "#17100c",
    ink: "#d9c7a0",
    accent: "#ff9a3c",
    textColor: "#e8d9b8",
  },
];

// Nominal size (in em at 16px) of each layout, used to scale previews
const LAYOUT_DIM: Record<StripLayout, { w: number; h: number }> = {
  strip: { w: 15, h: 56 },
  film: { w: 17, h: 60 },
  grid: { w: 26, h: 35 },
  wide: { w: 60, h: 20 },
};

export type PhotostripDesign = {
  frame: string;
  /** kept for compatibility with the photostrip generator; no longer used */
  stickers: string[];
  note: string;
  /** id of the film stock already baked into the edited photos */
  filter?: string;
};

export type PhotoEditorResult = {
  photos: string[];
  design: PhotostripDesign;
};

type PhotoEditorProps = {
  photos: string[];
  onBack: () => void;
  onComplete: (result: PhotoEditorResult) => void;
};

const NOTE_IDEAS = [
  "best day ever ♡",
  "us, forever",
  "just a little memory",
  "smile, it's analog",
];

const TONES = [
  "linear-gradient(160deg,#c9a977 0%,#8a7352 50%,#3a3328 100%)",
  "linear-gradient(200deg,#d9bf94 0%,#a3825a 45%,#4a3b2c 100%)",
  "linear-gradient(140deg,#a8b09a 0%,#6f7a63 50%,#2f3629 100%)",
  "linear-gradient(180deg,#e0c59a 0%,#b58b5d 40%,#5a4030 100%)",
];

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

const rgba = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
};

const GRAIN_URI = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

const LEAK_DIRECTION = {
  left: "to right",
  right: "to left",
  top: "to bottom",
  bottom: "to top",
} as const;

const vignetteAlpha = (filter: FilmFilter) =>
  Math.min(0.9, filter.vignette * 1.5);

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Gagal memuat salah satu foto."));
    image.src = src;
  });

const makeNoisePattern = (ctx: CanvasRenderingContext2D) => {
  const tile = document.createElement("canvas");
  tile.width = 256;
  tile.height = 256;

  const tileCtx = tile.getContext("2d");
  if (!tileCtx) return null;

  const data = tileCtx.createImageData(256, 256);
  for (let i = 0; i < data.data.length; i += 4) {
    const value = Math.random() * 255;
    data.data[i] = value;
    data.data[i + 1] = value;
    data.data[i + 2] = value;
    data.data[i + 3] = 255;
  }
  tileCtx.putImageData(data, 0, 0);

  return ctx.createPattern(tile, "repeat");
};

// Renders the final photo: color grade + fade + casts/leaks + vignette + grain
async function renderFilm(src: string, filter: FilmFilter): Promise<string> {
  const image = await loadImage(src);

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Gagal memproses foto.");

  const w = canvas.width;
  const h = canvas.height;

  ctx.filter = filter.css;
  ctx.drawImage(image, 0, 0, w, h);
  ctx.filter = "none";

  if (filter.id !== "original") {
    // Faded / lifted blacks
    if (filter.fade > 0) {
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = filter.fade;
      ctx.fillStyle = "rgb(236,226,208)";
      ctx.fillRect(0, 0, w, h);
    }

    // Color casts & light leaks
    for (const layer of filter.layers) {
      if (layer.kind === "tint") {
        ctx.globalCompositeOperation = layer.blend;
        ctx.globalAlpha = layer.alpha;
        ctx.fillStyle = layer.color;
        ctx.fillRect(0, 0, w, h);
      } else {
        const [x0, y0, x1, y1] =
          layer.side === "right"
            ? [w, 0, w * 0.45, 0]
            : layer.side === "left"
              ? [0, 0, w * 0.55, 0]
              : layer.side === "top"
                ? [0, 0, 0, h * 0.55]
                : [0, h, 0, h * 0.45];

        const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
        gradient.addColorStop(0, rgba(layer.color, layer.alpha));
        gradient.addColorStop(1, rgba(layer.color, 0));

        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = 1;
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      }
    }

    // Vignette
    if (filter.vignette > 0) {
      const radius = Math.hypot(w, h) / 2;
      const gradient = ctx.createRadialGradient(
        w / 2,
        h / 2,
        radius * 0.5,
        w / 2,
        h / 2,
        radius
      );
      gradient.addColorStop(0, "rgba(20,10,0,0)");
      gradient.addColorStop(1, `rgba(20,10,0,${vignetteAlpha(filter)})`);

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }

    // Film grain
    if (filter.grain > 0) {
      const pattern = makeNoisePattern(ctx);

      if (pattern) {
        ctx.globalCompositeOperation = "overlay";
        ctx.globalAlpha = filter.grain * 0.6;
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, w, h);
      }
    }

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  }

  return canvas.toDataURL("image/jpeg", 0.95);
}

/* ------------------------------------------------------------------ */
/*  PREVIEW COMPONENTS                                                 */
/* ------------------------------------------------------------------ */

// A photo with the film look applied (CSS version of renderFilm)
function FilmImage({
  src,
  filter,
  className = "",
  style,
  alt = "",
}: {
  src: string;
  filter: FilmFilter;
  className?: string;
  style?: CSSProperties;
  alt?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: filter.css }}
      />

      {filter.fade > 0 && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "rgb(236,226,208)",
            opacity: filter.fade,
            mixBlendMode: "screen",
          }}
        />
      )}

      {filter.layers.map((layer, i) =>
        layer.kind === "tint" ? (
          <div
            key={i}
            className="pointer-events-none absolute inset-0"
            style={{
              background: layer.color,
              opacity: layer.alpha,
              mixBlendMode: layer.blend,
            }}
          />
        ) : (
          <div
            key={i}
            className="pointer-events-none absolute inset-0"
            style={{
              background: `linear-gradient(${LEAK_DIRECTION[layer.side]}, ${rgba(layer.color, layer.alpha)}, ${rgba(layer.color, 0)} 55%)`,
              mixBlendMode: "screen",
            }}
          />
        )
      )}

      {filter.vignette > 0 && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle farthest-corner at 50% 50%, transparent 50%, rgba(20,10,0,${vignetteAlpha(filter)}) 100%)`,
          }}
        />
      )}

      {filter.grain > 0 && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: GRAIN_URI,
            backgroundSize: "180px 180px",
            opacity: filter.grain * 0.6,
            mixBlendMode: "overlay",
          }}
        />
      )}
    </div>
  );
}

function Shot({
  src,
  filter,
  index,
  className = "",
  style,
}: {
  src?: string;
  filter: FilmFilter;
  index: number;
  className?: string;
  style?: CSSProperties;
}) {
  if (src) {
    return (
      <FilmImage
        src={src}
        filter={filter}
        className={className}
        style={style}
        alt={`Frame ${index + 1}`}
      />
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: TONES[index % TONES.length], ...style }}
    >
      <span
        className="f-mono absolute inset-0 flex items-center justify-center"
        style={{ fontSize: "0.9em", color: "rgba(255,245,225,0.45)" }}
      >
        {index + 1}
      </span>
    </div>
  );
}

// The strip itself. Everything is sized in em so it scales cleanly.
function StripPreview({
  frame: f,
  photos,
  filter,
  note,
}: {
  frame: PhotostripFrame;
  photos?: string[];
  filter: FilmFilter;
  note: string;
}) {
  const caption = note.trim();
  const shot = (
    i: number,
    className: string,
    style?: CSSProperties
  ) => (
    <Shot
      key={i}
      index={i}
      src={photos?.[i]}
      filter={filter}
      className={className}
      style={style}
    />
  );

  const root: CSSProperties = { fontSize: 16, color: f.textColor };
  const shadow = "0.4em 0.8em 1.6em rgba(0,0,0,0.45)";

  /* ---------- Black photobooth strip with big caption ---------- */
  if (f.id === "noir") {
    return (
      <div
        style={{
          ...root,
          width: "15em",
          background: f.paper,
          padding: "0.7em 0.7em 1em",
          boxShadow: shadow,
        }}
      >
        <div className="flex flex-col" style={{ gap: "0.5em" }}>
          {[0, 1, 2, 3].map((i) => shot(i, "w-full", { aspectRatio: "6/5" }))}
        </div>

        <div style={{ padding: "1.5em 0.4em 0.3em", textAlign: "center" }}>
          <p
            className="f-display"
            style={{
              fontSize: "2.1em",
              lineHeight: 0.98,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              color: f.textColor,
              opacity: caption ? 1 : 0.9,
            }}
          >
            {caption || "Life in still frames"}
          </p>
          <p
            className="f-display"
            style={{
              fontSize: "0.95em",
              letterSpacing: "0.28em",
              marginTop: "0.8em",
              textTransform: "uppercase",
              color: f.textColor,
              opacity: 0.85,
            }}
          >
            Shutter Photo Lab
          </p>
          <p
            className="f-mono"
            style={{
              fontSize: "0.45em",
              letterSpacing: "0.3em",
              marginTop: "0.9em",
              color: f.textColor,
              opacity: 0.45,
            }}
          >
            NO. 001 · 2026
          </p>
        </div>
      </div>
    );
  }

  /* ---------- Vertical photobooth strip ---------- */
  if (f.layout === "strip") {
    return (
      <div
        className="flex flex-col items-center"
        style={{
          ...root,
          width: "15em",
          background: f.paper,
          padding: "1.1em 1em 1em",
          boxShadow: shadow,
        }}
      >
        <p
          className="f-serif font-bold"
          style={{ fontSize: "1.15em", letterSpacing: "0.28em", color: f.textColor }}
        >
          SHUTTER
        </p>
        <p
          className="f-mono"
          style={{
            fontSize: "0.5em",
            letterSpacing: "0.3em",
            opacity: 0.7,
            margin: "0.2em 0 0.9em",
          }}
        >
          PHOTO LAB · 35MM
        </p>

        <div className="flex w-full flex-col" style={{ gap: "0.7em" }}>
          {[0, 1, 2, 3].map((i) =>
            shot(i, "w-full", {
              aspectRatio: "6/5",
              border: `0.3em solid ${f.ink}`,
            })
          )}
        </div>

        <div style={{ marginTop: "0.9em", minHeight: "3em", textAlign: "center" }}>
          <p
            className="f-hand"
            style={{
              fontSize: "1.5em",
              lineHeight: 1.05,
              color: f.accent,
              opacity: caption ? 1 : 0.55,
            }}
          >
            {caption || "little memories"}
          </p>
          <p
            className="f-mono"
            style={{ fontSize: "0.45em", letterSpacing: "0.25em", opacity: 0.6, marginTop: "0.6em" }}
          >
            NO. 001 · 2026
          </p>
        </div>
      </div>
    );
  }

  /* ---------- Vertical 35mm negative ---------- */
  if (f.layout === "film") {
    const sprocket: CSSProperties = {
      width: "0.75em",
      margin: "0 0.5em",
      borderRadius: "0.15em",
      backgroundImage: "linear-gradient(180deg,#e9dfcb 0 0.9em,transparent 0.9em 1.8em)",
      backgroundSize: "100% 1.8em",
      opacity: 0.9,
    };

    return (
      <div
        className="flex"
        style={{
          ...root,
          width: "17em",
          background: f.paper,
          padding: "0.9em 0",
          boxShadow: shadow,
        }}
      >
        <div style={sprocket} />

        <div className="flex flex-1 flex-col" style={{ gap: "0.7em" }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <div
                className="f-mono flex justify-between"
                style={{
                  fontSize: "0.45em",
                  letterSpacing: "0.2em",
                  color: f.accent,
                  marginBottom: "0.4em",
                }}
              >
                <span>▸ {i + 1}</span>
                <span>KODAK 400</span>
                <span>{i + 1}A</span>
              </div>
              {shot(i, "w-full", {
                aspectRatio: "4/3",
                border: "0.12em solid rgba(217,199,160,0.3)",
              })}
            </div>
          ))}

          <div style={{ textAlign: "center", minHeight: "2.4em" }}>
            <p
              className="f-hand"
              style={{
                fontSize: "1.45em",
                lineHeight: 1.05,
                color: f.accent,
                opacity: caption ? 1 : 0.55,
              }}
            >
              {caption || "little memories"}
            </p>
            <p
              className="f-mono"
              style={{ fontSize: "0.42em", letterSpacing: "0.3em", color: f.ink, opacity: 0.6, marginTop: "0.5em" }}
            >
              SHUTTER FILM LAB
            </p>
          </div>
        </div>

        <div style={sprocket} />
      </div>
    );
  }

  /* ---------- Horizontal cinema reel ---------- */
  if (f.layout === "wide") {
    const row: CSSProperties = {
      height: "0.8em",
      backgroundImage: "linear-gradient(90deg,#d9c7a0 0 1em,transparent 1em 2em)",
      backgroundSize: "2em 100%",
      opacity: 0.85,
      borderRadius: "0.15em",
    };

    return (
      <div
        style={{
          ...root,
          width: "60em",
          background: f.paper,
          padding: "0.8em",
          boxShadow: shadow,
        }}
      >
        <div style={row} />

        <div
          className="grid grid-cols-4"
          style={{ gap: "0.5em", margin: "0.5em 0" }}
        >
          {[0, 1, 2, 3].map((i) =>
            shot(i, "w-full", {
              aspectRatio: "4/3",
              border: "0.15em solid rgba(217,199,160,0.35)",
            })
          )}
        </div>

        <div style={row} />

        <div className="flex items-center justify-between" style={{ marginTop: "0.6em" }}>
          <span
            className="f-mono"
            style={{ fontSize: "0.5em", letterSpacing: "0.25em", opacity: 0.6 }}
          >
            SHUTTER CINEMA · 35MM
          </span>
          <span
            className="f-hand"
            style={{
              fontSize: "1.6em",
              lineHeight: 1,
              color: f.accent,
              opacity: caption ? 1 : 0.55,
            }}
          >
            {caption || "little memories"}
          </span>
          <span
            className="f-mono"
            style={{ fontSize: "0.5em", letterSpacing: "0.25em", opacity: 0.6 }}
          >
            ISO 400 · 4 FRAMES
          </span>
        </div>
      </div>
    );
  }

  /* ---------- 2×2 layouts ---------- */
  if (f.id === "polaroid") {
    const tilt = ["-2deg", "1.6deg", "1.2deg", "-1.8deg"];

    return (
      <div
        style={{
          ...root,
          width: "26em",
          background: f.paper,
          backgroundImage:
            "radial-gradient(ellipse at 20% 10%, rgba(255,240,210,0.35), transparent 50%)",
          padding: "1.4em",
          boxShadow: shadow,
        }}
      >
        <p
          className="f-mono text-center"
          style={{ fontSize: "0.5em", letterSpacing: "0.35em", opacity: 0.65, marginBottom: "1em" }}
        >
          SHUTTER INSTANT · 600
        </p>

        <div className="grid grid-cols-2" style={{ gap: "1.2em" }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="relative"
              style={{
                background: "#f6efe0",
                padding: "0.6em 0.6em 2.4em",
                boxShadow: "0.15em 0.3em 0.6em rgba(40,25,10,0.35)",
                transform: `rotate(${tilt[i]})`,
              }}
            >
              <div
                className="absolute left-1/2"
                style={{
                  top: "-0.6em",
                  width: "3em",
                  height: "1.1em",
                  background: "rgba(230,211,154,0.78)",
                  transform: "translateX(-50%) rotate(-4deg)",
                }}
              />
              {shot(i, "w-full", { aspectRatio: "1/1" })}
              <p
                className="f-hand absolute inset-x-0 text-center"
                style={{ bottom: "0.55em", fontSize: "1.05em", color: f.ink, opacity: 0.8 }}
              >
                frame {i + 1}
              </p>
            </div>
          ))}
        </div>

        <p
          className="f-hand text-center"
          style={{
            fontSize: "1.6em",
            lineHeight: 1.05,
            marginTop: "1em",
            color: f.accent,
            opacity: caption ? 1 : 0.55,
          }}
        >
          {caption || "little memories"}
        </p>
      </div>
    );
  }

  if (f.id === "postcard") {
    return (
      <div
        style={{
          ...root,
          width: "26em",
          padding: "0.8em",
          background:
            "repeating-linear-gradient(135deg,#b3342a 0 0.9em,#f6efe0 0.9em 1.8em,#2a3f6a 1.8em 2.7em,#f6efe0 2.7em 3.6em)",
          boxShadow: shadow,
        }}
      >
        <div style={{ background: f.paper, padding: "1em" }}>
          <div className="flex items-start justify-between" style={{ marginBottom: "0.8em" }}>
            <div>
              <p
                className="f-serif italic"
                style={{ fontSize: "1.25em", lineHeight: 1.05, color: f.accent }}
              >
                Greetings from
                <br />
                the photo booth!
              </p>
              <p
                className="f-mono"
                style={{ fontSize: "0.45em", letterSpacing: "0.3em", marginTop: "0.5em", opacity: 0.7 }}
              >
                POST CARD · AIR MAIL
              </p>
            </div>

            <div
              className="f-mono flex items-center justify-center text-center"
              style={{
                width: "3.2em",
                height: "3.8em",
                padding: "0.25em",
                border: `0.22em dotted ${f.ink}`,
                background: "rgba(179,52,42,0.12)",
                fontSize: "0.5em",
                lineHeight: 1.3,
                transform: "rotate(4deg)",
              }}
            >
              SHUTTER
              <br />
              ¢ 1
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ gap: "0.5em" }}>
            {[0, 1, 2, 3].map((i) =>
              shot(i, "w-full", {
                aspectRatio: "4/3",
                border: `0.2em solid ${f.ink}`,
              })
            )}
          </div>

          <div style={{ marginTop: "0.9em", borderTop: `0.1em dotted ${f.ink}`, paddingTop: "0.5em" }}>
            <p
              className="f-hand"
              style={{
                fontSize: "1.45em",
                lineHeight: 1.05,
                color: f.ink,
                opacity: caption ? 1 : 0.5,
              }}
            >
              {caption || "wish you were here ♡"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // contact sheet
  return (
    <div
      style={{
        ...root,
        width: "26em",
        background: f.paper,
        backgroundImage:
          "radial-gradient(ellipse at 80% 90%, rgba(170,130,70,0.18), transparent 55%)",
        padding: "1em",
        boxShadow: shadow,
      }}
    >
      <div
        className="f-mono flex justify-between"
        style={{ fontSize: "0.5em", letterSpacing: "0.3em", marginBottom: "0.8em", opacity: 0.75 }}
      >
        <span>SHUTTER 400 · CONTACT SHEET</span>
        <span>ROLL 001</span>
      </div>

      <div className="grid grid-cols-2" style={{ gap: "0.6em" }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="relative"
            style={{ background: "#17100c", padding: "0.3em 0.3em 0.2em" }}
          >
            {shot(i, "w-full", { aspectRatio: "4/3" })}
            <div
              className="f-mono flex justify-between"
              style={{ fontSize: "0.42em", letterSpacing: "0.2em", color: "#ff9a3c", marginTop: "0.35em" }}
            >
              <span>▸ {i + 1}A</span>
              <span>KODAK 400</span>
            </div>

            {i === 1 && (
              <>
                <div
                  className="pointer-events-none absolute"
                  style={{
                    inset: "-0.4em",
                    border: `0.22em solid ${f.accent}`,
                    borderRadius: "50%",
                    transform: "rotate(-4deg)",
                    opacity: 0.9,
                  }}
                />
                <p
                  className="f-hand absolute"
                  style={{
                    right: "0.2em",
                    bottom: "-1.5em",
                    fontSize: "1.1em",
                    color: f.accent,
                    transform: "rotate(-4deg)",
                  }}
                >
                  this one!
                </p>
              </>
            )}
          </div>
        ))}
      </div>

      <p
        className="f-hand"
        style={{
          fontSize: "1.5em",
          lineHeight: 1.05,
          marginTop: "1.6em",
          color: f.textColor,
          opacity: caption ? 1 : 0.5,
        }}
      >
        {caption || "little memories"}
      </p>
    </div>
  );
}

// Scales a StripPreview to fit inside a box (keeps text readable at any size)
function ScaledStrip({
  frame,
  photos,
  filter,
  note,
  boxW,
  boxH,
}: {
  frame: PhotostripFrame;
  photos?: string[];
  filter: FilmFilter;
  note: string;
  boxW: number;
  boxH: number;
}) {
  const dim =
    frame.id === "noir" ? { w: 15, h: 62 } : LAYOUT_DIM[frame.layout];
  const scale = Math.min(boxW / (dim.w * 16), boxH / (dim.h * 16));

  return (
    <div
      className="relative"
      style={{ width: dim.w * 16 * scale, height: dim.h * 16 * scale }}
    >
      <div
        style={{
          width: dim.w * 16,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <StripPreview
          frame={frame}
          photos={photos}
          filter={filter}
          note={note}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  EDITOR                                                             */
/* ------------------------------------------------------------------ */

// Horizontal, swipeable row with arrow buttons for mouse users
function ScrollRow({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollByPage = (direction: number) =>
    ref.current?.scrollBy({ left: direction * 320, behavior: "smooth" });

  const arrow =
    "absolute top-[38%] z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#d9c7a0]/40 bg-[#17100c]/85 text-[#f0e5d0] shadow-lg backdrop-blur hover:bg-[#9b4236] md:flex";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scrollByPage(-1)}
        aria-label="Scroll left"
        className={`${arrow} left-1`}
      >
        <ChevronLeft size={18} />
      </button>

      <button
        type="button"
        onClick={() => scrollByPage(1)}
        aria-label="Scroll right"
        className={`${arrow} right-1`}
      >
        <ChevronRight size={18} />
      </button>

      <div
        ref={ref}
        className="scroll-row flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4"
      >
        {children}
      </div>
    </div>
  );
}

export default function PhotoEditor({
  photos,
  onBack,
  onComplete,
}: PhotoEditorProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilmFilter>(
    FILM_FILTERS[0]
  );
  const [selectedFrame, setSelectedFrame] = useState<PhotostripFrame>(
    PHOTOSTRIP_FRAMES[0]
  );
  const [note, setNote] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState("");

  const applyEditor = async () => {
    if (photos.length !== 4 || isApplying) return;

    setIsApplying(true);
    setError("");

    try {
      const editedPhotos = await Promise.all(
        photos.map((photo) => renderFilm(photo, selectedFilter))
      );

      onComplete({
        photos: editedPhotos,
        design: {
          frame: selectedFrame.id,
          filter: selectedFilter.id,
          stickers: [],
          note: note.trim(),
        },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menerapkan editing."
      );
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <main
      className={`${serif.variable} ${mono.variable} ${hand.variable} ${display.variable} relative min-h-screen overflow-hidden bg-[#17100c] px-4 py-8 text-[#f0e5d0] selection:bg-[#8c3a2c] md:px-8 md:py-12`}
    >
      <style>{`
        .f-serif { font-family: var(--font-serif), Georgia, serif; }
        .f-mono { font-family: var(--font-mono), "Courier New", monospace; }
        .f-hand { font-family: var(--font-hand), cursive; }
        .f-display { font-family: var(--font-display), Impact, "Arial Narrow", sans-serif; }

        .scroll-row { scrollbar-width: thin; scrollbar-color: #5a4430 transparent; }
        .scroll-row::-webkit-scrollbar { height: 6px; }
        .scroll-row::-webkit-scrollbar-thumb { background: #5a4430; border-radius: 3px; }
        .scroll-row::-webkit-scrollbar-track { background: transparent; }

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
        @media (prefers-reduced-motion: reduce) { .grain { animation: none; } }
      `}</style>

      <div className="grain pointer-events-none fixed inset-[-50px] z-[60] opacity-[0.14] mix-blend-screen" />
      <div className="pointer-events-none fixed inset-0 z-[55] bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.55)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_50%_-20%,rgba(200,90,40,0.2),transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-10 border-b border-dashed border-[#d9c7a0]/25 pb-6">
          <button
            onClick={onBack}
            disabled={isApplying}
            className="f-mono flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#d9c7a0]/70 hover:text-white disabled:opacity-40"
          >
            <ArrowLeft size={14} /> Back to Darkroom
          </button>

          <div className="mt-6 text-center">
            <p className="f-mono text-[10px] uppercase tracking-[0.3em] text-[#c0a57d]">
              Shutter Analog Lab
            </p>
            <h1 className="f-serif mt-3 text-4xl">Photo Editor</h1>
            <p className="f-mono mt-3 text-xs text-[#d9c7a0]/60">
              Pick a film stock, choose a frame, and write a little note.
            </p>
          </div>
        </header>

        <div className="grid gap-10 lg:grid-cols-[400px_minmax(0,1fr)] lg:items-start">
          {/* ============ CONTROLS (RIGHT) ============ */}
          <div className="order-2 min-w-0">
            {/* 01 — Film stock */}
            <section className="mb-12">
              <div className="mb-4">
                <p className="f-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#c0a57d]">
                  01 — Film Stock
                </p>
                <h2 className="f-serif mt-1 text-2xl">Choose Your Film</h2>
                <p className="f-mono mt-2 text-[11px] text-[#d9c7a0]/50">
                  Color grade, faded blacks, light leaks, vignette and grain,
                  applied to all 4 photos.
                </p>
              </div>

              <ScrollRow>
                {FILM_FILTERS.map((filter) => {
                  const selected = selectedFilter.id === filter.id;

                  return (
                    <button
                      key={filter.id}
                      onClick={() => setSelectedFilter(filter)}
                      className={`w-[150px] shrink-0 snap-start border p-2 text-left transition ${
                        selected
                          ? "border-[#d9c7a0] bg-[#3a2c22]"
                          : "border-[#d9c7a0]/20 hover:bg-[#2a2019]"
                      }`}
                    >
                      <Shot
                        index={0}
                        src={photos[0]}
                        filter={filter}
                        className="aspect-[4/3] w-full"
                      />
                      <span className="f-serif mt-2 block text-base leading-tight">
                        {filter.name}
                      </span>
                      <span className="f-mono mt-1 block text-[9px] uppercase leading-snug tracking-[0.12em] text-[#d9c7a0]/55">
                        {filter.stock}
                      </span>
                      {selected && (
                        <span className="f-mono mt-2 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-[#ff9a3c]">
                          <Check size={11} /> Selected
                        </span>
                      )}
                    </button>
                  );
                })}
              </ScrollRow>
            </section>

            {/* 02 — Frame */}
            <section className="mb-12">
              <div className="mb-4">
                <p className="f-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#c0a57d]">
                  02 — Photostrip
                </p>
                <h2 className="f-serif mt-1 text-2xl">Choose Your Frame</h2>
              </div>

              <ScrollRow>
                {PHOTOSTRIP_FRAMES.map((frame) => {
                  const selected = selectedFrame.id === frame.id;

                  return (
                    <button
                      key={frame.id}
                      onClick={() => setSelectedFrame(frame)}
                      className={`w-[160px] shrink-0 snap-start border p-3 text-left transition ${
                        selected
                          ? "border-[#d9c7a0] bg-[#3a2c22]"
                          : "border-[#d9c7a0]/20 hover:bg-[#2a2019]"
                      }`}
                    >
                      <div className="flex h-[140px] items-center justify-center bg-[#0d0907]/60">
                        <ScaledStrip
                          frame={frame}
                          filter={FILM_FILTERS[0]}
                          note=""
                          boxW={104}
                          boxH={124}
                        />
                      </div>
                      <span className="f-serif mt-3 block text-base leading-tight">
                        {frame.name}
                      </span>
                      <span className="f-mono mt-1 block text-[9px] uppercase tracking-[0.12em] text-[#d9c7a0]/55">
                        {frame.description}
                      </span>
                      {selected && (
                        <span className="f-mono mt-2 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-[#ff9a3c]">
                          <Check size={11} /> Selected
                        </span>
                      )}
                    </button>
                  );
                })}
              </ScrollRow>
            </section>

            {/* 03 — Note */}
            <section>
              <p className="f-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#c0a57d]">
                03 — Personal Note
              </p>
              <h2 className="f-serif mt-1 text-2xl">Write a Little Note</h2>

              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value.slice(0, 80))}
                placeholder="A little memory worth keeping..."
                rows={3}
                className="f-hand mt-4 w-full resize-none border border-[#d9c7a0]/30 bg-[#2a2019]/60 p-4 text-2xl leading-tight text-[#f0e5d0] outline-none placeholder:text-[#d9c7a0]/30 focus:border-[#d9c7a0]"
              />

              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {NOTE_IDEAS.map((idea) => (
                    <button
                      key={idea}
                      onClick={() => setNote(idea)}
                      className="f-hand border border-[#d9c7a0]/25 px-3 py-1 text-lg text-[#d9c7a0]/80 hover:bg-[#9b4236]"
                    >
                      {idea}
                    </button>
                  ))}
                </div>

                <span className="f-mono text-xs text-[#d9c7a0]/40">
                  {note.length}/80
                </span>
              </div>
            </section>
          </div>

          {/* ============ PREVIEW (LEFT) ============ */}
          <aside className="order-1 lg:sticky lg:top-6">
            <div className="mb-3 flex items-end justify-between gap-3">
              <h2 className="f-serif text-2xl">Live Preview</h2>
              <span className="f-mono text-right text-[10px] uppercase tracking-[0.15em] text-[#d9c7a0]/55">
                {selectedFilter.name} · {selectedFrame.name}
              </span>
            </div>

            {/* Light table */}
            <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden border-2 border-[#5a4430] bg-[radial-gradient(ellipse_at_center,#f4ecd9_0%,#dccdaa_100%)] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.55),inset_0_0_60px_rgba(120,80,30,0.25)]">
              <span className="f-mono absolute left-3 top-2 text-[8px] uppercase tracking-[0.3em] text-[#5a4430]/55">
                Light table
              </span>
              <span className="f-mono absolute bottom-2 right-3 text-[8px] uppercase tracking-[0.3em] text-[#5a4430]/55">
                Shutter lab © 2026
              </span>

              <ScaledStrip
                frame={selectedFrame}
                photos={photos}
                filter={selectedFilter}
                note={note}
                boxW={330}
                boxH={540}
              />
            </div>

            {error && (
              <p className="f-mono mt-4 border border-red-400/30 bg-red-900/25 p-3 text-center text-sm text-red-200">
                {error}
              </p>
            )}

            <button
              onClick={applyEditor}
              disabled={isApplying || photos.length !== 4}
              className="f-mono mt-5 flex w-full items-center justify-center gap-2 border-2 border-[#d9c7a0]/60 bg-[#9b4236] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] shadow-[5px_5px_0_#000] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-50"
            >
              <WandSparkles size={17} />
              {isApplying
                ? "Developing your edit..."
                : "Apply & Generate Photostrip"}
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}