/**
 * ComicCraft generation pipeline
 * ------------------------------
 * Orchestrates the full workflow described in the project docs:
 *   1. Gemini Flash → structured 5-panel outline      (fallback: story engine)
 *   2. Gemini Pro   → narration, caption, dialogue    (fallback: story engine)
 *   3. Art engine   → panel-by-panel illustrations    (SVG, or Stable Diffusion
 *                                                     when HF_API_KEY is set)
 *   4. Layout       → bound panel list for preview + PDF export.
 */
import { randomUUID } from "crypto";
import { generateDiffusionImage, diffusionEnabled } from "./diffusion";
import { generateOutlineGemini, generateStoryGemini } from "./gemini";
import { buildComicLayout } from "./layout";
import { forgeOutline, forgeStory, forgeTitle } from "./storyforge";
import type { ComicInput, ComicPanel } from "./types";

export interface PipelineResult {
  title: string;
  engine: string;
  panels: ComicPanel[];
}

export async function runPipeline(input: ComicInput): Promise<PipelineResult> {
  // Stage 1 — outline
  const geminiOutline = await generateOutlineGemini(input).catch(() => null);
  const outline = geminiOutline ?? forgeOutline(input);

  // Stage 2 — story
  const geminiStory = await generateStoryGemini(input, outline).catch(() => null);
  const stories = geminiStory ?? forgeStory(input, outline);

  // Stage 3+4 — illustrations + layout binding
  const panels = buildComicLayout(input, outline, stories);

  let usedDiffusion = false;
  if (diffusionEnabled()) {
    const stem = randomUUID().slice(0, 8);
    for (const panel of panels) {
      const png = await generateDiffusionImage(panel.imagePrompt, `${stem}-p${panel.panel}`).catch(() => null);
      if (png) {
        panel.art.png = png;
        usedDiffusion = true;
      }
    }
  }

  const textEngine = geminiOutline && geminiStory ? "gemini" : geminiOutline || geminiStory ? "gemini+storyforge" : "storyforge";
  const engine = usedDiffusion ? `${textEngine}+diffusion` : textEngine;

  return { title: forgeTitle(input), engine, panels };
}
