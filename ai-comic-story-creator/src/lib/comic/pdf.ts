/**
 * ComicCraft PDF exporter  (exporters.py)
 * --------------------------------------
 * Compiles a comic into a professionally bound, multi-page PDF:
 *   1. Cover page (title, cast, tone/style chips)
 *   2. One page per panel (header, illustration, scene, caption, narration,
 *      speech bubbles, and the original image prompt for reference)
 *   3. Back cover ("The End")
 * Uses pdf-lib directly on vector drawing primitives — the panels are painted
 * from the same SceneArt descriptors that power the web preview, so the export
 * matches the on-screen comic. When a panel carries a diffusion-generated PNG,
 * the raster art is embedded instead.
 */
import { readFile } from "fs/promises";
import path from "path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { paletteFor, settingKey } from "./art";
import { mulberry32, between } from "./rand";
import type { Comic, ComicPanel, SceneArt } from "./types";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 34;

type RGB = ReturnType<typeof rgb>;

function hex(color: string): RGB {
  const c = color.replace("#", "");
  return rgb(parseInt(c.slice(0, 2), 16) / 255, parseInt(c.slice(2, 4), 16) / 255, parseInt(c.slice(4, 6), 16) / 255);
}

/** pdf-lib standard fonts only encode WinAnsi — normalise typography first. */
function wa(value: string): string {
  return value
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = wa(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function starPath(cx: number, cy: number, r1: number, r2: number, points: number): string {
  const cmds: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? r1 : r2;
    const a = (Math.PI / points) * i - Math.PI / 2;
    cmds.push(`${i === 0 ? "M" : "L"} ${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`);
  }
  return cmds.join(" ") + " Z";
}

interface Fonts {
  bold: PDFFont;
  regular: PDFFont;
  oblique: PDFFont;
}

/* -------------------------------------------------------------------------- */
/* Panel illustration (vector, matching the SVG art engine)                    */
/* -------------------------------------------------------------------------- */

async function drawScene(
  doc: PDFDocument,
  page: PDFPage,
  art: SceneArt,
  x: number,
  y: number,
  w: number,
  h: number,
): Promise<void> {
  // Prefer an embedded diffusion render when one exists.
  if (art.png) {
    try {
      const file = await readFile(path.join(process.cwd(), "public", art.png.replace(/^\//, "")));
      const img = await doc.embedPng(file);
      page.drawImage(img, { x, y, width: w, height: h });
      return;
    } catch {
      // fall through to vector art
    }
  }

  const pal = paletteFor(art.tone);
  const night = art.beat === "peril" || art.beat === "climax";
  const rng = mulberry32(art.seed);

  // sky in three bands (top → horizon)
  page.drawRectangle({ x, y: y + h * 0.5, width: w, height: h * 0.5, color: hex(pal.sky[0]) });
  page.drawRectangle({ x, y: y + h * 0.22, width: w, height: h * 0.28, color: hex(pal.sky[1]) });
  page.drawRectangle({ x, y, width: w, height: h * 0.22, color: hex(pal.sky[2]) });

  // stars on night scenes
  if (night) {
    for (let i = 0; i < 28; i++) {
      page.drawCircle({
        x: x + between(rng, 6, w - 6),
        y: y + h * 0.4 + between(rng, 0, h * 0.55),
        size: between(rng, 0.6, 1.7),
        color: hex(pal.cream),
        opacity: between(rng, 0.35, 0.9),
      });
    }
  }

  // celestial body
  const cx = x + w * (night ? 0.8 : 0.22);
  const cy = y + h * (night ? 0.78 : 0.72);
  if (night) {
    page.drawCircle({ x: cx, y: cy, size: h * 0.16, color: hex(pal.cream) });
    page.drawCircle({ x: cx - 6, y: cy + 5, size: 3.4, color: hex(pal.far), opacity: 0.5 });
    page.drawCircle({ x: cx + 7, y: cy - 4, size: 2.4, color: hex(pal.far), opacity: 0.45 });
  } else {
    page.drawCircle({ x: cx, y: cy, size: h * 0.3, color: hex(pal.glow), opacity: 0.28 });
    page.drawCircle({ x: cx, y: cy, size: h * 0.15, color: hex(pal.glow) });
  }

  // terrain silhouette
  const groundY = y + h * 0.14;
  const setting = settingKey(art.setting);
  if (setting === "forest") {
    for (let tx = x + 8; tx < x + w - 6; tx += 26) {
      const th = between(rng, h * 0.1, h * 0.24);
      page.drawSvgPath(`M ${tx} ${groundY} L ${tx + 10} ${groundY + th} L ${tx + 20} ${groundY} Z`, {
        color: hex(pal.ink),
        opacity: 0.85,
      });
    }
  } else if (setting === "city") {
    let bx = x + 4;
    while (bx < x + w - 10) {
      const bw = between(rng, 18, 40);
      const bh = between(rng, h * 0.12, h * 0.42);
      page.drawRectangle({ x: bx, y: groundY, width: bw, height: bh, color: hex(pal.ink), opacity: 0.9 });
      if (night) {
        for (let wy = groundY + 5; wy < groundY + bh - 5; wy += 9) {
          if (rng() > 0.5) continue;
          page.drawRectangle({ x: bx + 4, y: wy, width: 3, height: 4, color: hex(pal.glow), opacity: 0.85 });
        }
      }
      bx += bw + between(rng, 4, 10);
    }
  } else if (setting === "space") {
    page.drawCircle({ x: x + w * 0.72, y: y + h * 0.66, size: h * 0.17, color: hex(pal.far) });
    page.drawEllipse({ x: x + w * 0.72, y: y + h * 0.66, xScale: h * 0.32, yScale: h * 0.07, borderColor: hex(pal.accent), borderWidth: 2 });
    page.drawSvgPath(
      `M ${x} ${groundY} L ${x + w * 0.16} ${groundY + h * 0.1} L ${x + w * 0.3} ${groundY + h * 0.03} L ${x + w * 0.46} ${groundY + h * 0.14} L ${x + w * 0.6} ${groundY + h * 0.04} L ${x + w * 0.78} ${groundY + h * 0.11} L ${x + w} ${groundY + h * 0.02} L ${x + w} ${groundY} Z`,
      { color: hex(pal.far) },
    );
  } else if (setting === "school") {
    const sw = w * 0.5;
    const sx = x + w * 0.25;
    page.drawRectangle({ x: sx, y: groundY, width: sw, height: h * 0.28, color: hex(pal.far) });
    page.drawSvgPath(`M ${sx - 10} ${groundY + h * 0.28} L ${sx + sw / 2} ${groundY + h * 0.42} L ${sx + sw + 10} ${groundY + h * 0.28} Z`, {
      color: hex(pal.ink),
    });
    page.drawRectangle({ x: sx + sw / 2 - 9, y: groundY, width: 18, height: h * 0.16, color: hex(pal.ink) });
    for (const wx of [0.1, 0.32, 0.6, 0.8]) {
      page.drawRectangle({ x: sx + sw * wx, y: groundY + h * 0.14, width: 10, height: 12, color: night ? hex(pal.glow) : hex(pal.cream), borderColor: hex(pal.ink), borderWidth: 1 });
    }
  } else {
    page.drawEllipse({ x: x + w * 0.3, y: groundY - h * 0.06, xScale: w * 0.42, yScale: h * 0.16, color: hex(pal.far), opacity: 0.8 });
    page.drawEllipse({ x: x + w * 0.78, y: groundY - h * 0.08, xScale: w * 0.4, yScale: h * 0.2, color: hex(pal.ink), opacity: 0.75 });
  }

  // ground
  page.drawRectangle({ x, y, width: w, height: h * 0.14, color: hex(pal.ground) });
  page.drawRectangle({ x, y: y + h * 0.14, width: w, height: 2, color: hex(pal.ink) });

  // hero (head + body, archetype trim)
  const heroX = x + w * (art.beat === "arrival" ? 0.28 : art.beat === "peril" ? 0.34 : 0.5);
  const heroBase = y + h * 0.155;
  const scale = h / 300;
  page.drawEllipse({ x: heroX, y: y + h * 0.145, xScale: 26 * scale, yScale: 5 * scale, color: rgb(0, 0, 0), opacity: 0.3 });
  page.drawRectangle({ x: heroX - 11 * scale, y: heroBase, width: 22 * scale, height: 34 * scale, color: hex(pal.ink) });
  page.drawCircle({ x: heroX, y: heroBase + 46 * scale, size: 12 * scale, color: hex(pal.ink) });
  if (art.hero === "fox") {
    page.drawSvgPath(`M ${heroX - 9 * scale} ${heroBase + 52 * scale} L ${heroX - 14 * scale} ${heroBase + 66 * scale} L ${heroX - 2 * scale} ${heroBase + 56 * scale} Z`, { color: hex(pal.ink) });
    page.drawSvgPath(`M ${heroX + 9 * scale} ${heroBase + 52 * scale} L ${heroX + 14 * scale} ${heroBase + 66 * scale} L ${heroX + 2 * scale} ${heroBase + 56 * scale} Z`, { color: hex(pal.ink) });
  } else if (art.hero === "robot") {
    page.drawLine({ start: { x: heroX, y: heroBase + 58 * scale }, end: { x: heroX, y: heroBase + 68 * scale }, thickness: 2, color: hex(pal.ink) });
    page.drawCircle({ x: heroX, y: heroBase + 71 * scale, size: 3 * scale, color: hex(pal.accent) });
  } else {
    page.drawSvgPath(`M ${heroX - 10 * scale} ${heroBase + 30 * scale} L ${heroX - 26 * scale} ${heroBase + 4 * scale} L ${heroX + 26 * scale} ${heroBase + 4 * scale} L ${heroX + 10 * scale} ${heroBase + 30 * scale} Z`, { color: hex(pal.accent), opacity: 0.55 });
  }
  page.drawCircle({ x: heroX - 4 * scale, y: heroBase + 47 * scale, size: 1.6 * scale, color: hex(pal.glow) });
  page.drawCircle({ x: heroX + 4 * scale, y: heroBase + 47 * scale, size: 1.6 * scale, color: hex(pal.glow) });

  // climax burst
  if (art.beat === "climax") {
    page.drawSvgPath(starPath(heroX, heroBase + 44 * scale, 62 * scale, 30 * scale, 12), {
      borderColor: hex(pal.glow),
      borderWidth: 2.5,
      opacity: 0.9,
    });
  }
  if (art.beat === "legacy") {
    for (let i = 0; i < 18; i++) {
      page.drawRectangle({
        x: x + between(rng, 8, w - 12),
        y: y + h * 0.3 + between(rng, 0, h * 0.55),
        width: 5,
        height: 3,
        color: hex([pal.accent, pal.glow, pal.cream][i % 3]),
        opacity: 0.9,
      });
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Pages                                                                       */
/* -------------------------------------------------------------------------- */

function coverPage(doc: PDFDocument, comic: Comic, fonts: Fonts): void {
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const pal = paletteFor(comic.tone);
  const ink = hex("#0d0b14");
  const paper = hex("#f6edd8");

  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: ink });

  // halftone field
  const rng = mulberry32(42);
  for (let i = 0; i < 22; i++) {
    for (let j = 0; j < 16; j++) {
      const r = 0.8 + (j / 16) * 2.6 + between(rng, -0.2, 0.2);
      page.drawCircle({
        x: 40 + i * 24,
        y: 60 + j * 20,
        size: Math.max(0.5, r),
        color: hex(pal.accent),
        opacity: 0.07 + (j / 16) * 0.12,
      });
    }
  }

  // burst
  const bx = PAGE_W / 2;
  const by = PAGE_H - 240;
  page.drawSvgPath(starPath(bx, by, 190, 92, 16), { color: hex(pal.accent) });
  page.drawSvgPath(starPath(bx, by, 176, 82, 16), { color: ink });
  page.drawSvgPath(starPath(bx, by, 150, 68, 16), { color: paper });

  // title inside burst
  const title = wa(comic.title).toUpperCase();
  const titleLines = wrapText(title, fonts.bold, 30, 250);
  let ty = by + ((titleLines.length - 1) * 36) / 2 - 10;
  for (const line of titleLines) {
    const width = fonts.bold.widthOfTextAtSize(line, 30);
    page.drawText(line, { x: bx - width / 2, y: ty, size: 30, font: fonts.bold, color: ink });
    ty -= 36;
  }

  const kicker = "AN AI-CRAFTED COMIC ADVENTURE";
  const kw = fonts.bold.widthOfTextAtSize(kicker, 10);
  page.drawText(kicker, { x: bx - kw / 2, y: by + 132, size: 10, font: fonts.bold, color: paper, opacity: 0.9 });

  // starring band
  const star = `STARRING  ${wa(comic.character).toUpperCase()}`;
  const starW = Math.min(fonts.bold.widthOfTextAtSize(star, 15) + 44, PAGE_W - 120);
  page.drawRectangle({ x: bx - starW / 2, y: PAGE_H - 470, width: starW, height: 40, color: hex(pal.glow) });
  page.drawRectangle({ x: bx - starW / 2, y: PAGE_H - 470, width: starW, height: 40, borderColor: paper, borderWidth: 1.5 });
  const starTW = fonts.bold.widthOfTextAtSize(star, 15);
  page.drawText(star, { x: bx - starTW / 2, y: PAGE_H - 456, size: 15, font: fonts.bold, color: ink });

  // meta chips
  const metas: Array<[string, string]> = [
    ["SETTING", comic.setting],
    ["TONE", comic.tone],
    ["ART STYLE", comic.style],
    ["PANELS", String(comic.panels.length)],
  ];
  const chipW = 118;
  const startX = bx - ((chipW + 12) * metas.length - 12) / 2;
  metas.forEach(([label, value], i) => {
    const cxp = startX + i * (chipW + 12);
    page.drawRectangle({ x: cxp, y: PAGE_H - 566, width: chipW, height: 56, color: hex("#181226"), borderColor: hex(pal.accent), borderWidth: 1.25 });
    page.drawText(label, { x: cxp + 10, y: PAGE_H - 528, size: 7.5, font: fonts.bold, color: hex(pal.accent) });
    const v = wa(value).length > 16 ? wa(value).slice(0, 15) + "..." : wa(value);
    page.drawText(v, { x: cxp + 10, y: PAGE_H - 548, size: 10, font: fonts.bold, color: paper });
  });

  // footer
  const date = new Date(comic.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const footer = `COMICCRAFT  -  ENGINE: ${wa(comic.engine).toUpperCase()}  -  ${date.toUpperCase()}`;
  const fw = fonts.bold.widthOfTextAtSize(footer, 8);
  page.drawText(footer, { x: bx - fw / 2, y: 66, size: 8, font: fonts.bold, color: paper, opacity: 0.75 });
  page.drawRectangle({ x: bx - fw / 2 - 12, y: 58, width: fw + 24, height: 1, color: hex(pal.accent), opacity: 0.8 });
}

async function panelPage(doc: PDFDocument, comic: Comic, panel: ComicPanel, fonts: Fonts): Promise<void> {
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const pal = paletteFor(comic.tone);
  const ink = hex("#0d0b14");
  const paper = hex("#f6edd8");
  const contentW = PAGE_W - MARGIN * 2;
  let y = PAGE_H;

  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: paper });
  page.drawRectangle({ x: 14, y: 14, width: PAGE_W - 28, height: PAGE_H - 28, borderColor: ink, borderWidth: 2.5 });

  // header band
  y -= MARGIN + 56;
  page.drawRectangle({ x: MARGIN, y, width: contentW, height: 56, color: hex(pal.accent) });
  page.drawRectangle({ x: MARGIN, y, width: contentW, height: 56, borderColor: ink, borderWidth: 2 });
  const tag = `PANEL ${String(panel.panel).padStart(2, "0")}`;
  page.drawText(tag, { x: MARGIN + 14, y: y + 34, size: 9, font: fonts.bold, color: ink, opacity: 0.75 });
  const title = wa(panel.title);
  const titleSize = fonts.bold.widthOfTextAtSize(title, 20) > contentW - 130 ? 15 : 20;
  page.drawText(title, { x: MARGIN + 14, y: y + 12, size: titleSize, font: fonts.bold, color: ink });
  const brand = "COMICCRAFT";
  page.drawText(brand, { x: MARGIN + contentW - fonts.bold.widthOfTextAtSize(brand, 8) - 12, y: y + 40, size: 8, font: fonts.bold, color: ink, opacity: 0.6 });

  // art box
  const artH = 284;
  y -= 14 + artH;
  page.drawRectangle({ x: MARGIN, y, width: contentW, height: artH, color: hex("#141021") });
  await drawScene(doc, page, panel.art, MARGIN + 3, y + 3, contentW - 6, artH - 6);
  page.drawRectangle({ x: MARGIN, y, width: contentW, height: artH, borderColor: ink, borderWidth: 2.5 });

  // scene description (italic)
  y -= 18;
  const sceneLines = wrapText(panel.scene, fonts.oblique, 10, contentW - 8).slice(0, 3);
  for (const line of sceneLines) {
    y -= 13;
    page.drawText(line, { x: MARGIN + 4, y, size: 10, font: fonts.oblique, color: ink, opacity: 0.8 });
  }

  // caption chip
  y -= 12;
  const caption = wa(panel.caption).toUpperCase();
  const capW = Math.min(fonts.bold.widthOfTextAtSize(caption, 8) + 22, contentW);
  page.drawRectangle({ x: MARGIN, y: y - 18, width: capW, height: 20, color: ink });
  page.drawText(caption, { x: MARGIN + 11, y: y - 11.5, size: 8, font: fonts.bold, color: hex(pal.glow) });
  y -= 26;

  // narration
  const narrationLines = wrapText(panel.narration, fonts.regular, 10.5, contentW - 8).slice(0, 9);
  for (const line of narrationLines) {
    y -= 15;
    page.drawText(line, { x: MARGIN + 4, y, size: 10.5, font: fonts.regular, color: ink });
  }

  // dialogue bubbles
  y -= 10;
  panel.dialogue.slice(0, 2).forEach((line, idx) => {
    const bubbleLines = wrapText(line, fonts.regular, 9.5, 300).slice(0, 3);
    const widest = Math.max(...bubbleLines.map((l) => fonts.regular.widthOfTextAtSize(l, 9.5)), 40);
    const bw = widest + 34;
    const bh = bubbleLines.length * 12.5 + 16;
    const cx = idx % 2 === 0 ? MARGIN + 24 + bw / 2 : PAGE_W - MARGIN - 24 - bw / 2;
    const cy = y - bh / 2 - 8;

    // tail
    const tailX = idx % 2 === 0 ? cx - bw * 0.28 : cx + bw * 0.28;
    page.drawSvgPath(`M ${tailX} ${cy - bh / 2 + 4} L ${tailX + (idx % 2 === 0 ? -16 : 16)} ${cy - bh / 2 - 14} L ${tailX + (idx % 2 === 0 ? 12 : -12)} ${cy - bh / 2 + 4} Z`, {
      color: rgb(1, 1, 1),
      borderColor: ink,
      borderWidth: 1.5,
    });
    page.drawEllipse({ x: cx, y: cy, xScale: bw / 2 + 10, yScale: bh / 2 + 6, color: rgb(1, 1, 1), borderColor: ink, borderWidth: 1.75 });

    let ly = cy + ((bubbleLines.length - 1) * 12.5) / 2 - 3.5;
    for (const bl of bubbleLines) {
      const lw = fonts.regular.widthOfTextAtSize(bl, 9.5);
      page.drawText(bl, { x: cx - lw / 2, y: ly, size: 9.5, font: fonts.regular, color: ink });
      ly -= 12.5;
    }
    y = cy - bh / 2 - 22;
  });

  // image prompt reference
  const promptText = `IMAGE PROMPT - ${panel.imagePrompt}`;
  const promptLines = wrapText(promptText, fonts.oblique, 7.5, contentW - 8).slice(0, 3);
  let py = 30 + (promptLines.length - 1) * 10;
  for (const line of promptLines) {
    page.drawText(line, { x: MARGIN + 4, y: py, size: 7.5, font: fonts.oblique, color: ink, opacity: 0.55 });
    py -= 10;
  }
}

function backPage(doc: PDFDocument, comic: Comic, fonts: Fonts): void {
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const pal = paletteFor(comic.tone);
  const ink = hex("#0d0b14");
  const paper = hex("#f6edd8");

  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: ink });
  const bx = PAGE_W / 2;
  const by = PAGE_H / 2 + 40;
  page.drawSvgPath(starPath(bx, by, 220, 104, 16), { color: hex(pal.glow) });
  page.drawSvgPath(starPath(bx, by, 206, 94, 16), { color: ink });
  page.drawSvgPath(starPath(bx, by, 168, 74, 16), { color: paper });

  const end = "THE END";
  const ew = fonts.bold.widthOfTextAtSize(end, 44);
  page.drawText(end, { x: bx - ew / 2, y: by + 8, size: 44, font: fonts.bold, color: ink });
  const sub = wa(comic.title);
  const sw2 = fonts.oblique.widthOfTextAtSize(sub, 13);
  page.drawText(sub, { x: bx - sw2 / 2, y: by - 26, size: 13, font: fonts.oblique, color: ink, opacity: 0.85 });

  const c1 = "CREATED WITH COMICCRAFT - AI COMIC STORY CREATOR";
  page.drawText(c1, { x: bx - fonts.bold.widthOfTextAtSize(c1, 9) / 2, y: 120, size: 9, font: fonts.bold, color: paper, opacity: 0.85 });
  const c2 = "GEMINI STORY ENGINE  X  DIFFUSION ART PIPELINE  X  PDF-LIB EXPORT";
  page.drawText(c2, { x: bx - fonts.regular.widthOfTextAtSize(c2, 7.5) / 2, y: 102, size: 7.5, font: fonts.regular, color: paper, opacity: 0.6 });
}

/* -------------------------------------------------------------------------- */

export async function renderComicPdf(comic: Comic): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(comic.title);
  doc.setCreator("ComicCraft — AI Comic Story Creator");
  doc.setProducer("ComicCraft pdf-lib exporter");
  doc.setCreationDate(new Date());

  const fonts: Fonts = {
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    regular: await doc.embedFont(StandardFonts.Helvetica),
    oblique: await doc.embedFont(StandardFonts.HelveticaOblique),
  };

  coverPage(doc, comic, fonts);
  for (const panel of comic.panels) {
    await panelPage(doc, comic, panel, fonts);
  }
  backPage(doc, comic, fonts);

  return doc.save();
}
