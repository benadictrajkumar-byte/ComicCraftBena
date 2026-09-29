/**
 * ComicCraft Gemini integration
 * -----------------------------
 * Mirrors the original architecture:
 *  - Gemini Flash  → fast, structured 5-panel outline   (gemini_flash.py)
 *  - Gemini Pro    → rich narration + dialogue          (gemini_pro.py)
 *
 * Calls the Generative Language API directly over HTTPS so no SDK is needed.
 * Every function degrades gracefully: any failure returns `null` and the
 * pipeline falls back to the local story engine.
 */
import type { ComicInput, PanelOutline, PanelStory } from "./types";
import { PANEL_COUNT } from "./types";

const FLASH_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-latest"];
const PRO_MODELS = ["gemini-2.5-pro", "gemini-2.0-flash", "gemini-1.5-pro-latest"];

function apiKey(): string | null {
  const key = process.env.GEMINI_API_KEY;
  return key && key.trim().length > 0 ? key.trim() : null;
}

function endpoint(model: string, key: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
}

interface GeminiTextResult {
  text: string;
  model: string;
}

async function callGemini(models: string[], prompt: string, temperature = 0.9): Promise<GeminiTextResult | null> {
  const key = apiKey();
  if (!key) return null;

  for (const model of models) {
    try {
      const res = await fetch(endpoint(model, key), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(45_000),
        cache: "no-store",
      });
      if (!res.ok) continue;
      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
      if (text) return { text, model };
    } catch {
      // try the next model in the chain
    }
  }
  return null;
}

/** Extract the first JSON array from a model response, fence-tolerant. */
function extractJsonArray(text: string): unknown[] | null {
  const fenced = text.replace(/```(?:json)?/gi, "");
  const start = fenced.indexOf("[");
  const end = fenced.lastIndexOf("]");
  if (start === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(fenced.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

/**
 * Stage 1 — structured 5-panel outline via Gemini Flash.
 * Returns null when Gemini is unavailable or the payload is malformed.
 */
export async function generateOutlineGemini(input: ComicInput): Promise<PanelOutline[] | null> {
  const prompt = [
    "You are the outline engine of ComicCraft, an AI comic book creator.",
    `Write a structured ${PANEL_COUNT}-panel comic outline for this story request.`,
    "",
    `Story prompt: ${input.prompt}`,
    `Main character: ${input.character}`,
    `Setting: ${input.setting}`,
    `Tone: ${input.tone}`,
    `Art style: ${input.style}`,
    "",
    `Return ONLY a JSON array of exactly ${PANEL_COUNT} objects, one per panel, with this shape:`,
    `[{"panel": 1, "title": "short panel title", "scene": "2-3 sentence vivid scene description", "image_prompt": "detailed illustration prompt in ${input.style} style"}]`,
    "The arc must be: 1) arrival/hook 2) journey deeper 3) escalating danger 4) climactic turning point 5) resolution.",
    "Make it cohesive, imaginative and true to the requested tone.",
  ].join("\n");

  const result = await callGemini(FLASH_MODELS, prompt, 0.85);
  if (!result) return null;

  const rows = extractJsonArray(result.text);
  if (!rows || rows.length < PANEL_COUNT) return null;

  const outline: PanelOutline[] = rows.slice(0, PANEL_COUNT).map((row, i) => {
    const r = (row ?? {}) as Record<string, unknown>;
    return {
      panel: i + 1,
      title: asString(r.title, `Panel ${i + 1}`).slice(0, 80),
      scene: asString(r.scene ?? r.scene_description, "…").slice(0, 600),
      imagePrompt: asString(r.image_prompt ?? r.imagePrompt, `${input.style} comic panel ${i + 1}`).slice(0, 800),
    };
  });
  return outline.some((o) => o.scene.length > 12) ? outline : null;
}

/**
 * Stage 2 — captions, narration and dialogue via Gemini Pro.
 */
export async function generateStoryGemini(
  input: ComicInput,
  outline: PanelOutline[],
): Promise<PanelStory[] | null> {
  const prompt = [
    "You are the narration engine of ComicCraft, an AI comic book creator.",
    "Expand this comic outline into full comic storytelling, panel by panel.",
    "",
    `Main character: ${input.character}`,
    `Setting: ${input.setting}`,
    `Tone: ${input.tone} (keep every line true to this tone)`,
    "",
    "OUTLINE:",
    JSON.stringify(outline),
    "",
    `Return ONLY a JSON array of exactly ${PANEL_COUNT} objects with this shape:`,
    `[{"panel": 1, "caption": "short ambient caption in italics style (background sound or environment note)", "narration": "3-5 sentences of engaging comic narration", "dialogue": ["line of spoken dialogue", "another line"]}]`,
    "Dialogue belongs to the characters; 1-3 lines per panel. Never use markdown. Match the panel order of the outline.",
  ].join("\n");

  const result = await callGemini(PRO_MODELS, prompt, 0.95);
  if (!result) return null;

  const rows = extractJsonArray(result.text);
  if (!rows || rows.length < PANEL_COUNT) return null;

  const stories: PanelStory[] = rows.slice(0, PANEL_COUNT).map((row) => {
    const r = (row ?? {}) as Record<string, unknown>;
    const dialogueRaw = Array.isArray(r.dialogue) ? r.dialogue : [];
    return {
      caption: asString(r.caption, "*the story unfolds*").slice(0, 160),
      narration: asString(r.narration, "…").slice(0, 1200),
      dialogue: dialogueRaw
        .filter((d): d is string => typeof d === "string")
        .map((d) => d.slice(0, 220))
        .slice(0, 3),
    };
  });
  return stories.some((s) => s.narration.length > 20) ? stories : null;
}
