/**
 * ComicCraft Art Engine
 * ---------------------
 * Procedurally illustrates every panel as layered SVG comic art. The same
 * descriptors feed the PDF exporter, so what users see on the web is exactly
 * what lands in the exported file. A diffusion backend (Stable Diffusion via
 * Hugging Face) can optionally override panel art with raster images — see
 * diffusion.ts — but this engine guarantees cohesive illustrations with zero
 * external dependencies.
 */
import { escXml } from "../utils";
import { between, hashSeed, intBetween, mulberry32, pick } from "./rand";
import type { Beat, HeroKind, SceneArt } from "./types";

export interface Palette {
  sky: [string, string, string];
  glow: string;
  accent: string;
  ground: string;
  far: string;
  ink: string;
  cream: string;
}

type ToneKey = "dramatic" | "funny" | "poetic" | "light";
type Phase = "day" | "golden" | "night" | "storm" | "dawn";

const TONE_PALETTES: Record<ToneKey, Palette> = {
  dramatic: {
    sky: ["#170f2b", "#3d1440", "#8a1f3d"],
    glow: "#ff5e3a",
    accent: "#ffb02e",
    ground: "#120a1e",
    far: "#2a1740",
    ink: "#0c0912",
    cream: "#f6edd8",
  },
  funny: {
    sky: ["#3fc1ff", "#7b8cff", "#c471ed"],
    glow: "#ffe14d",
    accent: "#ff6b6b",
    ground: "#2c2350",
    far: "#5a4a9e",
    ink: "#141029",
    cream: "#fff6e3",
  },
  poetic: {
    sky: ["#232344", "#5c4a86", "#e08fa3"],
    glow: "#ffd9a0",
    accent: "#f7b267",
    ground: "#17162e",
    far: "#3c3a68",
    ink: "#0f0e20",
    cream: "#f2ead9",
  },
  light: {
    sky: ["#64d2ff", "#9be7c4", "#fff3ad"],
    glow: "#ffdf6b",
    accent: "#ff7847",
    ground: "#27755f",
    far: "#4ea98f",
    ink: "#123a33",
    cream: "#fffbe9",
  },
};

/** Normalise any tone string to a palette key. */
export function toneKey(tone: string): ToneKey {
  const t = tone.toLowerCase();
  if (t.includes("fun") || t.includes("humor") || t.includes("comedy")) return "funny";
  if (t.includes("poet") || t.includes("dream") || t.includes("lyric")) return "poetic";
  if (t.includes("light") || t.includes("happy") || t.includes("whim") || t.includes("heart"))
    return "light";
  return "dramatic";
}

export function paletteFor(tone: string): Palette {
  return TONE_PALETTES[toneKey(tone)];
}

export function settingKey(setting: string): "forest" | "city" | "space" | "school" | "hills" {
  const s = setting.toLowerCase();
  if (/forest|wood|jungle|grove|glade|pine|enchant/.test(s)) return "forest";
  if (/city|town|street|neon|tokyo|metro|urban/.test(s)) return "city";
  if (/space|star|planet|galaxy|mars|moon|orbit|cosmos/.test(s)) return "space";
  if (/school|class|campus|academy/.test(s)) return "school";
  return "hills";
}

export function heroKindFor(character: string, prompt: string): HeroKind {
  const s = `${character} ${prompt}`.toLowerCase();
  if (/fox|kitsune/.test(s)) return "fox";
  if (/robot|android|bot|mech/.test(s)) return "robot";
  if (/cat|kitten|kitty/.test(s)) return "cat";
  if (/owl|bird/.test(s)) return "owl";
  if (/astro|space ?man|cosmonaut/.test(s)) return "astronaut";
  if (/dragon|drake/.test(s)) return "dragon";
  return "hero";
}

const BEAT_ORDER: Beat[] = ["arrival", "journey", "peril", "climax", "legacy"];
const BEAT_PHASE: Record<Beat, Phase> = {
  arrival: "day",
  journey: "golden",
  peril: "night",
  climax: "storm",
  legacy: "dawn",
};

export function beatForPanel(panelNumber: number): Beat {
  return BEAT_ORDER[Math.min(Math.max(panelNumber - 1, 0), BEAT_ORDER.length - 1)];
}

export function makeArt(
  opts: { setting: string; tone: string; style: string; character: string; prompt: string },
  panelNumber: number,
): SceneArt {
  return {
    beat: beatForPanel(panelNumber),
    setting: opts.setting,
    tone: opts.tone,
    style: opts.style,
    seed: hashSeed(`${opts.prompt}|${opts.character}|${opts.setting}|panel-${panelNumber}`),
    hero: heroKindFor(opts.character, opts.prompt),
  };
}

/* -------------------------------------------------------------------------- */
/* SVG builders                                                               */
/* -------------------------------------------------------------------------- */

const W = 720;
const H = 540;
const GROUND = 462;

function starField(rng: () => number, count: number, maxY: number, color: string): string {
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = between(rng, 8, W - 8);
    const y = between(rng, 10, maxY);
    const r = between(rng, 0.7, 2.1);
    const o = between(rng, 0.35, 0.95).toFixed(2);
    parts.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${color}" opacity="${o}"/>`);
  }
  return parts.join("");
}

function conifer(x: number, base: number, h: number, w: number, color: string, opacity: number): string {
  const l1 = h * 0.38;
  const l2 = h * 0.3;
  return (
    `<rect x="${x - w * 0.055}" y="${base - h * 0.18}" width="${w * 0.11}" height="${h * 0.18}" fill="${color}" opacity="${opacity}"/>` +
    `<polygon points="${x - w / 2},${base - h * 0.16} ${x},${base - h * 0.16 - l1} ${x + w / 2},${base - h * 0.16}" fill="${color}" opacity="${opacity}"/>` +
    `<polygon points="${x - w * 0.4},${base - h * 0.16 - l1 * 0.74} ${x},${base - h * 0.16 - l1 * 0.74 - l2} ${x + w * 0.4},${base - h * 0.16 - l1 * 0.74}" fill="${color}" opacity="${opacity}"/>` +
    `<polygon points="${x - w * 0.3},${base - h * 0.16 - (l1 + l2) * 0.8} ${x},${base - h} ${x + w * 0.3},${base - h * 0.16 - (l1 + l2) * 0.8}" fill="${color}" opacity="${opacity}"/>`
  );
}

function buildings(rng: () => number, base: number, color: string, winColor: string, lit: boolean, opacity: number): string {
  const parts: string[] = [];
  let x = -10;
  while (x < W + 20) {
    const bw = between(rng, 46, 92);
    const bh = between(rng, 90, 240);
    parts.push(`<rect x="${x.toFixed(0)}" y="${(base - bh).toFixed(0)}" width="${bw.toFixed(0)}" height="${bh.toFixed(0)}" fill="${color}" opacity="${opacity}"/>`);
    if (rng() > 0.55) {
      parts.push(`<rect x="${(x + bw / 2 - 1.5).toFixed(0)}" y="${(base - bh - 16).toFixed(0)}" width="3" height="16" fill="${color}" opacity="${opacity}"/>`);
    }
    if (lit) {
      for (let wy = base - bh + 12; wy < base - 14; wy += 22) {
        for (let wx = x + 8; wx < x + bw - 10; wx += 18) {
          if (rng() > 0.52) continue;
          parts.push(`<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="7" height="9" fill="${winColor}" opacity="${between(rng, 0.35, 0.95).toFixed(2)}"/>`);
        }
      }
    }
    x += bw + between(rng, 4, 16);
  }
  return parts.join("");
}

function clouds(rng: () => number, color: string, n: number): string {
  const parts: string[] = [];
  for (let i = 0; i < n; i++) {
    const x = between(rng, 40, W - 40);
    const y = between(rng, 40, 170);
    const s = between(rng, 0.7, 1.4);
    parts.push(
      `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${s.toFixed(2)})" opacity="0.85">` +
        `<ellipse cx="0" cy="0" rx="34" ry="13" fill="${color}"/>` +
        `<ellipse cx="-22" cy="4" rx="20" ry="9" fill="${color}"/>` +
        `<ellipse cx="22" cy="4" rx="22" ry="10" fill="${color}"/>` +
        `</g>`,
    );
  }
  return parts.join("");
}

/* -------- terrain per setting --------------------------------------------- */

function terrain(setting: string, pal: Palette, phase: Phase, rng: () => number): string {
  const parts: string[] = [];
  const night = phase === "night" || phase === "storm";

  if (setting === "forest") {
    // distant ridge
    parts.push(
      `<path d="M0 ${GROUND - 132} Q 120 ${GROUND - 176} 260 ${GROUND - 138} T 520 ${GROUND - 158} T 760 ${GROUND - 128} V ${GROUND} H 0 Z" fill="${pal.far}" opacity="0.55"/>`,
    );
    // far tree line
    let x = 12;
    while (x < W) {
      parts.push(conifer(x, GROUND - 96, between(rng, 74, 118), between(rng, 44, 62), pal.ink, 0.38));
      x += between(rng, 30, 52);
    }
    // near trees
    for (let i = 0; i < 6; i++) {
      const tx = between(rng, 26, W - 26);
      parts.push(conifer(tx, GROUND + 4, between(rng, 120, 200), between(rng, 64, 96), pal.ink, 0.95));
    }
    // foreground bushes
    parts.push(
      `<path d="M0 ${GROUND + 22} q 22 -26 44 0 q 20 -20 40 0 q 24 -28 48 0 Z" fill="${pal.ink}" opacity="0.9" transform="translate(560 26)"/>`,
      `<path d="M0 ${GROUND + 22} q 24 -30 48 0 q 20 -20 40 0 Z" fill="${pal.ink}" opacity="0.9" transform="translate(6 18)"/>`,
    );
    // mushrooms & fireflies
    for (let i = 0; i < 3; i++) {
      const mx = between(rng, 40, W - 40);
      parts.push(
        `<rect x="${mx - 2}" y="${GROUND + 34}" width="5" height="10" rx="2" fill="${pal.cream}" opacity="0.9"/>` +
          `<path d="M ${mx - 8} ${GROUND + 36} a 9 7 0 0 1 18 0 Z" fill="${pal.accent}"/>`,
      );
    }
    if (night || phase === "golden") {
      for (let i = 0; i < 9; i++) {
        parts.push(
          `<circle cx="${between(rng, 30, W - 30).toFixed(0)}" cy="${between(rng, GROUND - 150, GROUND - 20).toFixed(0)}" r="${between(rng, 1.4, 2.6).toFixed(1)}" fill="${pal.glow}" opacity="0.85"/>`,
        );
      }
    }
    if (night) {
      parts.push(`<polygon points="430,0 520,0 380,${GROUND} 280,${GROUND}" fill="#ffffff" opacity="0.06"/>`);
    }
  } else if (setting === "city") {
    parts.push(buildings(rng, GROUND - 120, pal.far, pal.glow, false, 0.6));
    parts.push(`<rect x="0" y="${GROUND - 126}" width="${W}" height="10" fill="${pal.far}" opacity="0.6"/>`);
    parts.push(buildings(rng, GROUND + 6, pal.ink, night ? pal.glow : pal.cream, true, 0.96));
    // street lamps
    for (const lx of [90, 610]) {
      parts.push(
        `<rect x="${lx}" y="${GROUND - 66}" width="5" height="70" fill="${pal.ink}"/>` +
          `<circle cx="${lx + 2.5}" cy="${GROUND - 72}" r="9" fill="${pal.glow}"/>` +
          `<circle cx="${lx + 2.5}" cy="${GROUND - 72}" r="22" fill="${pal.glow}" opacity="0.16"/>`,
      );
    }
  } else if (setting === "space") {
    // planet with ring
    parts.push(
      `<g transform="translate(545 120)">` +
        `<circle r="64" fill="${pal.far}"/>` +
        `<path d="M -64 0 a 64 20 0 0 0 128 0" fill="none" stroke="${pal.accent}" stroke-width="6" opacity="0.85" transform="rotate(-18)"/>` +
        `<ellipse cx="-22" cy="-16" rx="16" ry="10" fill="${pal.ink}" opacity="0.35"/>` +
        `<ellipse cx="18" cy="20" rx="11" ry="7" fill="${pal.ink}" opacity="0.3"/>` +
        `</g>`,
    );
    // small moon
    parts.push(`<circle cx="120" cy="90" r="26" fill="${pal.cream}" opacity="0.9"/><circle cx="112" cy="84" r="6" fill="${pal.far}" opacity="0.5"/><circle cx="128" cy="98" r="4" fill="${pal.far}" opacity="0.5"/>`);
    // rocky horizon
    parts.push(
      `<path d="M0 ${GROUND - 40} L 70 ${GROUND - 78} L 130 ${GROUND - 44} L 210 ${GROUND - 96} L 300 ${GROUND - 52} L 400 ${GROUND - 88} L 480 ${GROUND - 46} L 560 ${GROUND - 82} L 650 ${GROUND - 50} L 720 ${GROUND - 74} V ${GROUND} H 0 Z" fill="${pal.far}" opacity="0.9"/>`,
    );
    for (let i = 0; i < 8; i++) {
      const rx = between(rng, 20, W - 20);
      parts.push(
        `<ellipse cx="${rx.toFixed(0)}" cy="${(GROUND - between(rng, 2, 26)).toFixed(0)}" rx="${between(rng, 8, 22).toFixed(0)}" ry="${between(rng, 4, 9).toFixed(0)}" fill="${pal.ink}" opacity="0.6"/>`,
      );
    }
  } else if (setting === "school") {
    // schoolhouse
    parts.push(
      `<g transform="translate(180 ${GROUND - 210})">` +
        `<rect x="0" y="60" width="360" height="160" fill="${pal.far}"/>` +
        `<polygon points="-24,60 180,0 384,60" fill="${pal.ink}"/>` +
        `<rect x="150" y="120" width="60" height="100" fill="${pal.ink}"/>` +
        `<circle cx="180" cy="44" r="20" fill="${pal.cream}" stroke="${pal.ink}" stroke-width="5"/>` +
        // windows
        [30, 80, 250, 300]
          .map(
            (wx) =>
              `<rect x="${wx}" y="96" width="34" height="40" fill="${night ? pal.glow : pal.cream}" opacity="0.85" stroke="${pal.ink}" stroke-width="4"/>`,
          )
          .join("") +
        // flag
        `<rect x="177" y="-34" width="4" height="40" fill="${pal.ink}"/>` +
        `<polygon points="181,-34 221,-26 181,-16" fill="${pal.accent}"/>` +
        `</g>`,
    );
    // bushes + fence
    let fx = 8;
    while (fx < W) {
      parts.push(`<rect x="${fx}" y="${GROUND - 26}" width="6" height="30" fill="${pal.ink}" opacity="0.8"/>`);
      fx += 26;
    }
    parts.push(`<rect x="0" y="${GROUND - 20}" width="${W}" height="5" fill="${pal.ink}" opacity="0.8"/>`);
    parts.push(
      `<path d="M40 ${GROUND + 10} q 20 -26 40 0 q 18 -20 36 0 Z" fill="${pal.ink}" transform="translate(-8 10)"/>`,
      `<path d="M40 ${GROUND + 10} q 22 -28 44 0 Z" fill="${pal.ink}" transform="translate(560 8)"/>`,
    );
  } else {
    // rolling hills (default)
    parts.push(
      `<path d="M0 ${GROUND - 96} Q 180 ${GROUND - 170} 380 ${GROUND - 100} T 760 ${GROUND - 130} V ${GROUND} H 0 Z" fill="${pal.far}" opacity="0.65"/>`,
      `<path d="M0 ${GROUND - 40} Q 220 ${GROUND - 110} 460 ${GROUND - 44} T 760 ${GROUND - 60} V ${GROUND} H 0 Z" fill="${pal.ink}" opacity="0.55"/>`,
      clouds(rng, pal.cream, 3),
    );
  }

  return parts.join("");
}

/* -------- hero glyphs ------------------------------------------------------ */

function heroGlyph(kind: HeroKind, pal: Palette): string {
  const ink = pal.ink;
  const fur = "#ff8c4a";
  switch (kind) {
    case "fox":
      return (
        // tail
        `<path d="M -6 -14 Q -46 -22 -44 -52 Q -20 -44 -8 -30 Z" fill="${fur}"/><circle cx="-40" cy="-50" r="6" fill="${pal.cream}"/>` +
        // body
        `<ellipse cx="0" cy="-22" rx="17" ry="21" fill="${fur}"/>` +
        `<ellipse cx="2" cy="-14" rx="9" ry="12" fill="${pal.cream}" opacity="0.9"/>` +
        // legs
        `<rect x="-11" y="-8" width="7" height="10" rx="3" fill="${ink}"/><rect x="5" y="-8" width="7" height="10" rx="3" fill="${ink}"/>` +
        // head + ears
        `<polygon points="-11,-52 -17,-72 -3,-60" fill="${fur}"/><polygon points="11,-52 19,-72 5,-60" fill="${fur}"/>` +
        `<polygon points="-11,-58 -14,-68 -5,-61" fill="${ink}"/><polygon points="11,-58 15,-68 6,-61" fill="${ink}"/>` +
        `<circle cx="1" cy="-50" r="13.5" fill="${fur}"/>` +
        `<polygon points="-4,-46 8,-46 2,-35" fill="${pal.cream}"/>` +
        `<circle cx="1.8" cy="-37.5" r="2.2" fill="${ink}"/>` +
        `<circle cx="-4.5" cy="-53" r="1.9" fill="${ink}"/><circle cx="7.5" cy="-53" r="1.9" fill="${ink}"/>` +
        // explorer scarf
        `<path d="M -10 -40 Q 1 -33 12 -40 L 12 -34 Q 1 -27 -10 -34 Z" fill="${pal.accent}"/>`
      );
    case "robot":
      return (
        `<rect x="-2.5" y="-86" width="5" height="14" fill="${ink}"/><circle cx="0" cy="-90" r="4" fill="${pal.accent}"/>` +
        `<rect x="-15" y="-72" width="30" height="26" rx="6" fill="${pal.cream}" stroke="${ink}" stroke-width="4"/>` +
        `<rect x="-9" y="-63" width="7" height="5" rx="2" fill="${pal.accent}"/><rect x="3" y="-63" width="7" height="5" rx="2" fill="${pal.accent}"/>` +
        `<rect x="-12" y="-42" width="24" height="28" rx="5" fill="${ink}"/>` +
        `<circle cx="0" cy="-30" r="5" fill="${pal.glow}"/>` +
        `<rect x="-19" y="-40" width="6" height="18" rx="3" fill="${ink}"/><rect x="13" y="-40" width="6" height="18" rx="3" fill="${ink}"/>` +
        `<rect x="-9" y="-14" width="7" height="14" rx="3" fill="${ink}"/><rect x="2" y="-14" width="7" height="14" rx="3" fill="${ink}"/>`
      );
    case "cat":
      return (
        `<path d="M -8 -12 Q -30 -16 -28 -38" stroke="${ink}" stroke-width="7" fill="none" stroke-linecap="round"/>` +
        `<ellipse cx="0" cy="-20" rx="14" ry="19" fill="${ink}"/>` +
        `<polygon points="-9,-50 -14,-66 -2,-56" fill="${ink}"/><polygon points="9,-50 14,-66 2,-56" fill="${ink}"/>` +
        `<circle cx="0" cy="-46" r="12" fill="${ink}"/>` +
        `<circle cx="-4" cy="-48" r="1.8" fill="${pal.glow}"/><circle cx="5" cy="-48" r="1.8" fill="${pal.glow}"/>` +
        `<path d="M -3 -41 q 3 3 6 0" stroke="${pal.cream}" stroke-width="1.6" fill="none"/>`
      );
    case "owl":
      return (
        `<polygon points="-10,-58 -14,-70 -4,-60" fill="${ink}"/><polygon points="10,-58 14,-70 4,-60" fill="${ink}"/>` +
        `<ellipse cx="0" cy="-32" rx="16" ry="24" fill="${ink}"/>` +
        `<path d="M -14 -34 q -8 10 -2 22" stroke="${pal.far}" stroke-width="5" fill="none"/>` +
        `<path d="M 14 -34 q 8 10 2 22" stroke="${pal.far}" stroke-width="5" fill="none"/>` +
        `<circle cx="-6" cy="-42" r="6.5" fill="${pal.cream}"/><circle cx="6" cy="-42" r="6.5" fill="${pal.cream}"/>` +
        `<circle cx="-6" cy="-42" r="2.6" fill="${ink}"/><circle cx="6" cy="-42" r="2.6" fill="${ink}"/>` +
        `<polygon points="-2,-36 2,-36 0,-32" fill="${pal.accent}"/>` +
        `<rect x="-8" y="-9" width="5" height="9" fill="${pal.accent}"/><rect x="3" y="-9" width="5" height="9" fill="${pal.accent}"/>`
      );
    case "astronaut":
      return (
        `<rect x="-13" y="-44" width="26" height="30" rx="8" fill="${pal.cream}" stroke="${ink}" stroke-width="3.5"/>` +
        `<rect x="9" y="-36" width="10" height="16" rx="3" fill="${pal.accent}"/>` +
        `<rect x="-20" y="-40" width="6" height="20" rx="3" fill="${pal.cream}" stroke="${ink}" stroke-width="3"/>` +
        `<circle cx="0" cy="-58" r="16" fill="${pal.cream}" stroke="${ink}" stroke-width="3.5"/>` +
        `<path d="M -11 -60 a 12 12 0 0 1 22 -2 q -11 8 -22 2 Z" fill="${pal.far}"/>` +
        `<circle cx="4" cy="-64" r="2.2" fill="${pal.glow}"/>` +
        `<circle cx="0" cy="-30" r="4" fill="${pal.accent}"/>` +
        `<rect x="-10" y="-14" width="8" height="14" rx="3.5" fill="${pal.cream}" stroke="${ink}" stroke-width="3"/>` +
        `<rect x="2" y="-14" width="8" height="14" rx="3.5" fill="${pal.cream}" stroke="${ink}" stroke-width="3"/>`
      );
    case "dragon":
      return (
        `<polygon points="-6,-40 -34,-64 -18,-30" fill="${pal.accent}" opacity="0.9"/>` +
        `<polygon points="6,-42 30,-70 20,-32" fill="${pal.accent}" opacity="0.9"/>` +
        `<ellipse cx="0" cy="-24" rx="16" ry="22" fill="#4fae62"/>` +
        `<ellipse cx="2" cy="-18" rx="8" ry="13" fill="${pal.cream}" opacity="0.9"/>` +
        `<circle cx="2" cy="-52" r="12" fill="#4fae62"/>` +
        `<polygon points="6,-54 22,-50 8,-46" fill="#4fae62"/>` +
        `<circle cx="-1" cy="-55" r="2" fill="${ink}"/>` +
        `<polygon points="-6,-62 -2,-70 2,-62" fill="${pal.accent}"/>` +
        `<path d="M 22 -48 q 8 -6 6 -14 q 8 4 6 12 q -2 8 -12 6 Z" fill="${pal.glow}"/>` +
        `<rect x="-9" y="-8" width="7" height="10" rx="3" fill="${ink}"/><rect x="5" y="-8" width="7" height="10" rx="3" fill="${ink}"/>`
      );
    default:
      return (
        // cape
        `<path d="M -8 -50 Q -34 -34 -26 0 L 26 0 Q 32 -32 8 -50 Z" fill="${pal.accent}" opacity="0.92"/>` +
        `<path d="M -8 -50 Q -34 -34 -26 0 L -10 0 Q -14 -28 -2 -46 Z" fill="${ink}" opacity="0.35"/>` +
        // body
        `<rect x="-10" y="-48" width="20" height="36" rx="9" fill="${ink}"/>` +
        // head + hood
        `<circle cx="0" cy="-58" r="11.5" fill="${ink}"/>` +
        `<path d="M -11 -58 a 11.5 11.5 0 0 1 23 -1 l -4 -6 Z" fill="${pal.accent}" opacity="0.9"/>` +
        `<circle cx="-3.5" cy="-58.5" r="1.8" fill="${pal.glow}"/><circle cx="4" cy="-58.5" r="1.8" fill="${pal.glow}"/>` +
        // arms + legs
        `<rect x="-15" y="-42" width="6" height="20" rx="3" fill="${ink}"/><rect x="9" y="-42" width="6" height="20" rx="3" fill="${ink}"/>` +
        `<rect x="-8" y="-13" width="7" height="13" rx="3" fill="${ink}"/><rect x="2" y="-13" width="7" height="13" rx="3" fill="${ink}"/>`
      );
  }
}

/** Many-pointed burst star path centred on (cx, cy). */
function burstStar(cx: number, cy: number, r1: number, r2: number, points: number): string {
  const coords: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? r1 : r2;
    const a = (Math.PI / points) * i - Math.PI / 2;
    coords.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M ${coords.join(" L ")} Z`;
}

const SFX: Record<Beat, Partial<Record<ToneKey, string>> | string> = {
  arrival: "",
  journey: "",
  peril: { dramatic: "RUMBLE", funny: "UH-OH!", poetic: "the hush…", light: "wobble!" },
  climax: { dramatic: "WHAM!", funny: "BONK!", poetic: "GLIMMER", light: "TA-DAA!" },
  legacy: { dramatic: "AT LAST", funny: "NAP TIME", poetic: "ever after", light: "HOORAY!" },
};

/* -------------------------------------------------------------------------- */
/* Main renderer                                                              */
/* -------------------------------------------------------------------------- */

export function renderPanelSVG(art: SceneArt, opts?: { idPrefix?: string }): string {
  const rng = mulberry32(art.seed);
  const pal = paletteFor(art.tone);
  const tk = toneKey(art.tone);
  const setting = settingKey(art.setting);
  const phase = BEAT_PHASE[art.beat];
  const style = art.style.toLowerCase();
  const uid = opts?.idPrefix ?? `a${art.seed.toString(36)}`;

  const night = phase === "night" || phase === "storm";
  const parts: string[] = [];

  /* defs */
  parts.push(
    `<defs>` +
      `<linearGradient id="${uid}-sky" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="${pal.sky[0]}"/><stop offset="0.55" stop-color="${pal.sky[1]}"/><stop offset="1" stop-color="${pal.sky[2]}"/>` +
      `</linearGradient>` +
      `<radialGradient id="${uid}-glow" cx="0.5" cy="0.5" r="0.5">` +
      `<stop offset="0" stop-color="${pal.glow}" stop-opacity="0.9"/><stop offset="1" stop-color="${pal.glow}" stop-opacity="0"/>` +
      `</radialGradient>` +
      `<radialGradient id="${uid}-vig" cx="0.5" cy="0.45" r="0.75">` +
      `<stop offset="0.62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.42"/>` +
      `</radialGradient>` +
      `<pattern id="${uid}-dots" width="9" height="9" patternUnits="userSpaceOnUse">` +
      `<circle cx="4.5" cy="4.5" r="1.5" fill="${pal.ink}" opacity="0.16"/>` +
      `</pattern>` +
      `<pattern id="${uid}-px" width="16" height="16" patternUnits="userSpaceOnUse">` +
      `<rect width="16" height="16" fill="none" stroke="#000" stroke-opacity="0.10" stroke-width="1"/>` +
      `</pattern>` +
      `</defs>`,
  );

  /* sky */
  parts.push(`<rect width="${W}" height="${H}" fill="url(#${uid}-sky)"/>`);

  /* aurora for poetic / space nights */
  if (tk === "poetic" || setting === "space") {
    parts.push(
      `<path d="M -20 90 Q 160 30 360 80 T 760 60" stroke="${pal.accent}" stroke-width="26" fill="none" opacity="0.14" stroke-linecap="round"/>`,
      `<path d="M -20 130 Q 200 70 420 120 T 760 96" stroke="${pal.glow}" stroke-width="14" fill="none" opacity="0.10" stroke-linecap="round"/>`,
    );
  }

  /* stars */
  if (night || setting === "space" || phase === "dawn") {
    parts.push(starField(rng, setting === "space" ? 42 : 26, setting === "space" ? 420 : 300, pal.cream));
    // twinkles
    for (let i = 0; i < 5; i++) {
      const x = between(rng, 30, W - 30);
      const y = between(rng, 24, 220);
      parts.push(
        `<path d="M ${x} ${y - 7} L ${x + 2} ${y - 2} L ${x + 7} ${y} L ${x + 2} ${y + 2} L ${x} ${y + 7} L ${x - 2} ${y + 2} L ${x - 7} ${y} L ${x - 2} ${y - 2} Z" fill="${pal.cream}" opacity="0.9"/>`,
      );
    }
  }

  /* celestial body */
  if (phase === "day" || phase === "golden" || phase === "dawn") {
    const cx = phase === "dawn" ? 600 : phase === "golden" ? 560 : 150;
    const cy = phase === "day" ? 96 : phase === "dawn" ? 250 : 190;
    parts.push(
      `<circle cx="${cx}" cy="${cy}" r="120" fill="url(#${uid}-glow)"/>`,
      `<circle cx="${cx}" cy="${cy}" r="42" fill="${pal.glow}"/>`,
      `<circle cx="${cx}" cy="${cy}" r="52" fill="none" stroke="${pal.cream}" stroke-width="2" opacity="0.4"/>`,
    );
  } else {
    // moon
    parts.push(
      `<circle cx="584" cy="96" r="86" fill="url(#${uid}-glow)" opacity="0.7"/>`,
      `<circle cx="584" cy="96" r="34" fill="${pal.cream}"/>`,
      `<circle cx="574" cy="88" r="7" fill="${pal.far}" opacity="0.45"/>`,
      `<circle cx="593" cy="105" r="5" fill="${pal.far}" opacity="0.4"/>`,
    );
    if (phase === "storm") {
      parts.push(
        `<path d="M 120 90 q 90 -34 190 0 q -60 26 -190 0 Z" fill="${pal.ink}" opacity="0.5"/>`,
        `<path d="M 330 60 L 306 108 L 332 106 L 312 158" stroke="${pal.glow}" stroke-width="6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`,
      );
    }
  }

  /* terrain */
  parts.push(terrain(setting, pal, phase, rng));

  /* ground plane */
  parts.push(
    `<rect x="0" y="${GROUND}" width="${W}" height="${H - GROUND}" fill="${pal.ground}"/>`,
    `<rect x="0" y="${GROUND}" width="${W}" height="5" fill="${pal.ink}" opacity="0.85"/>`,
  );

  /* beat-specific scene dressing + hero placement */
  let heroX = 200;
  let heroScale = 1;
  const heroY = GROUND + 2;

  if (art.beat === "arrival") {
    heroX = 170;
    parts.push(
      `<path d="M 40 ${H} Q 150 ${GROUND + 10} 320 ${GROUND - 30}" stroke="${pal.cream}" stroke-width="18" fill="none" opacity="0.28" stroke-linecap="round" stroke-dasharray="2 26"/>`,
    );
  } else if (art.beat === "journey") {
    heroX = 330;
    for (let i = 0; i < 7; i++) {
      const mx = heroX - 40 + i * 44;
      parts.push(
        `<rect x="${mx}" y="${GROUND - between(rng, 60, 190)}" width="7" height="7" fill="${pal.accent}" opacity="0.85" transform="rotate(45 ${mx + 3} 120)"/>`,
      );
    }
  } else if (art.beat === "peril") {
    heroX = 235;
    heroScale = 0.86;
    // looming shadow
    parts.push(
      `<g opacity="0.9">` +
        `<path d="M 470 ${GROUND} q -14 -150 60 -190 q 90 -34 130 20 q 30 44 6 190 Z" fill="${pal.ink}"/>` +
        `<circle cx="545" cy="${GROUND - 170}" r="7" fill="${pal.glow}"/><circle cx="586" cy="${GROUND - 168}" r="7" fill="${pal.glow}"/>` +
        `<path d="M 500 ${GROUND - 120} q 60 26 110 -6" stroke="${pal.glow}" stroke-width="4" fill="none" opacity="0.7"/>` +
        `</g>`,
      // ground cracks
      `<path d="M 320 ${GROUND + 18} l 40 14 l -26 12 l 44 12" stroke="${pal.ink}" stroke-width="4" fill="none" opacity="0.7"/>`,
    );
  } else if (art.beat === "climax") {
    heroX = 360;
    heroScale = 1.06;
    parts.push(
      `<path d="${burstStar(heroX, GROUND - 90, 150, 74, 14)}" fill="${pal.glow}" opacity="0.9" stroke="${pal.ink}" stroke-width="5"/>`,
      `<path d="${burstStar(heroX, GROUND - 90, 96, 46, 14)}" fill="${pal.accent}" opacity="0.85"/>`,
    );
    for (let i = 0; i < 10; i++) {
      const ang = (Math.PI * 2 * i) / 10;
      const x1 = heroX + Math.cos(ang) * 150;
      const y1 = GROUND - 90 + Math.sin(ang) * 150;
      parts.push(
        `<line x1="${heroX + Math.cos(ang) * 160}" y1="${GROUND - 90 + Math.sin(ang) * 160}" x2="${x1 + Math.cos(ang) * 30}" y2="${y1 + Math.sin(ang) * 30}" stroke="${pal.cream}" stroke-width="5" stroke-linecap="round" opacity="0.8"/>`,
      );
    }
  } else {
    heroX = 360;
    heroScale = 1.02;
    // victory mound + flag
    parts.push(
      `<path d="M 210 ${GROUND + 8} Q 360 ${GROUND - 66} 510 ${GROUND + 8} Z" fill="${pal.far}"/>`,
      `<rect x="${heroX + 52}" y="${GROUND - 148}" width="5" height="120" fill="${pal.ink}"/>`,
      `<polygon points="${heroX + 57},${GROUND - 148} ${heroX + 104},${GROUND - 136} ${heroX + 57},${GROUND - 122}" fill="${pal.accent}" stroke="${pal.ink}" stroke-width="3"/>`,
    );
    for (let i = 0; i < 26; i++) {
      parts.push(
        `<rect x="${between(rng, 30, W - 40).toFixed(0)}" y="${between(rng, 30, GROUND - 60).toFixed(0)}" width="8" height="5" fill="${pick(rng, [pal.accent, pal.glow, pal.cream])}" opacity="0.9" transform="rotate(${intBetween(rng, 0, 90)} ${between(rng, 30, W - 40).toFixed(0)} 200)"/>`,
      );
    }
  }

  /* hero */
  parts.push(
    `<ellipse cx="${heroX}" cy="${GROUND + 6}" rx="${34 * heroScale}" ry="7" fill="#000" opacity="0.30"/>`,
    `<g transform="translate(${heroX} ${heroY}) scale(${heroScale})">${heroGlyph(art.hero, pal)}</g>`,
  );

  /* SFX lettering */
  const sfxEntry = SFX[art.beat];
  const sfx = typeof sfxEntry === "string" ? sfxEntry : (sfxEntry[tk] ?? "");
  if (sfx) {
    const big = art.beat === "climax";
    parts.push(
      `<g transform="translate(${art.beat === "peril" || art.beat === "legacy" ? 560 : 150} ${big ? 120 : 96}) rotate(${art.beat === "peril" ? 6 : -8})">` +
        `<text x="0" y="0" font-family="'Arial Black', 'Anton', sans-serif" font-size="${big ? 58 : 40}" font-weight="900" fill="${pal.accent}" stroke="${pal.ink}" stroke-width="${big ? 9 : 7}" paint-order="stroke" letter-spacing="1">${escXml(sfx)}</text>` +
        `</g>`,
    );
  }

  /* style overlays */
  if (style.includes("comic")) {
    parts.push(`<rect width="${W}" height="${H}" fill="url(#${uid}-dots)"/>`);
    parts.push(`<rect x="5" y="5" width="${W - 10}" height="${H - 10}" fill="none" stroke="${pal.ink}" stroke-width="10"/>`);
  } else if (style.includes("anime")) {
    for (let i = 0; i < 9; i++) {
      const ly = between(rng, 10, H - 60);
      const lw = between(rng, 60, 220);
      parts.push(
        `<rect x="${W - lw - between(rng, 0, 60)}" y="${ly}" width="${lw}" height="3" fill="#fff" opacity="0.16" transform="rotate(-9 ${W} ${ly})"/>`,
      );
    }
    parts.push(
      `<circle cx="${pick(rng, [120, 600])}" cy="${between(rng, 60, 140).toFixed(0)}" r="90" fill="url(#${uid}-glow)" opacity="0.5"/>`,
    );
  } else if (style.includes("pixel")) {
    parts.push(`<rect width="${W}" height="${H}" fill="url(#${uid}-px)"/>`);
  }
  if (style.includes("real")) {
    parts.push(`<rect width="${W}" height="${H}" fill="${pal.ink}" opacity="0.10"/>`);
    parts.push(`<rect width="${W}" height="${H}" fill="url(#${uid}-vig)"/>`);
  } else {
    parts.push(`<rect width="${W}" height="${H}" fill="url(#${uid}-vig)" opacity="0.55"/>`);
  }

  const crisp = style.includes("pixel") ? ` shape-rendering="crispEdges"` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img"${crisp} preserveAspectRatio="xMidYMid slice">` +
    parts.join("") +
    `</svg>`
  );
}
