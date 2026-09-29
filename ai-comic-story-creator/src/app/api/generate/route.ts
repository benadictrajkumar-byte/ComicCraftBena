import { NextResponse } from "next/server";
import { runPipeline } from "@/lib/comic/pipeline";
import { createComic } from "@/lib/comic/store";
import type { ComicInput } from "@/lib/comic/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/generate
 * JSON equivalent of the original `/generate` + `/generate-comic/json` routes.
 * Body: { prompt, character, setting, tone, style }
 * Runs the full AI pipeline, persists the comic, returns the bound layout.
 */
export async function POST(request: Request) {
  let body: Partial<Record<keyof ComicInput, unknown>>;
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const clean = (value: unknown, max: number, fallback = ""): string =>
    typeof value === "string" ? value.trim().slice(0, max) : fallback;

  const input: ComicInput = {
    prompt: clean(body.prompt, 500),
    character: clean(body.character, 60) || "Our Hero",
    setting: clean(body.setting, 60) || "forest",
    tone: clean(body.tone, 40) || "dramatic",
    style: clean(body.style, 40) || "comic book",
  };

  if (input.prompt.length < 4) {
    return NextResponse.json(
      { error: "Please provide a story prompt (at least 4 characters)." },
      { status: 400 },
    );
  }

  try {
    const result = await runPipeline(input);
    const comic = await createComic(input, result);
    return NextResponse.json(
      {
        comic,
        pdfUrl: `/api/export/${comic.id}`,
        previewUrl: `/comic/${comic.id}`,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[ComicCraft] generation failed:", error);
    return NextResponse.json(
      { error: "Comic generation failed. Please try again." },
      { status: 500 },
    );
  }
}
