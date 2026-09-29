import { NextResponse } from "next/server";
import { makeArt, renderPanelSVG } from "@/lib/comic/art";
import { diffusionEnabled, generateDiffusionImage } from "@/lib/comic/diffusion";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/test-image — developer utility to test the image generation stage in
 * isolation (direct equivalent of the original FastAPI route).
 * GET  /api/test-image?prompt=...&setting=forest&tone=dramatic&style=comic%20book
 * POST { "prompt": "...", ... } — returns SVG markup (or a PNG when the
 * diffusion backend is enabled).
 */
async function handler(input: {
  prompt: string;
  setting: string;
  tone: string;
  style: string;
  character: string;
}) {
  if (diffusionEnabled()) {
    const png = await generateDiffusionImage(input.prompt, `test-${randomUUID().slice(0, 8)}`);
    if (png) {
      return NextResponse.json({ ok: true, backend: "diffusion", image: png });
    }
  }

  const art = makeArt(
    {
      setting: input.setting,
      tone: input.tone,
      style: input.style,
      character: input.character,
      prompt: input.prompt,
    },
    1,
  );
  const svg = renderPanelSVG(art);
  return new Response(svg, {
    status: 200,
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" },
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  return handler({
    prompt: url.searchParams.get("prompt") ?? "a brave fox exploring an enchanted forest",
    setting: url.searchParams.get("setting") ?? "forest",
    tone: url.searchParams.get("tone") ?? "dramatic",
    style: url.searchParams.get("style") ?? "comic book",
    character: url.searchParams.get("character") ?? "Fable",
  });
}

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    // fall back to defaults
  }
  const str = (v: unknown, d: string) => (typeof v === "string" && v.trim() ? v.trim().slice(0, 500) : d);
  return handler({
    prompt: str(body.prompt, "a brave fox exploring an enchanted forest"),
    setting: str(body.setting, "forest"),
    tone: str(body.tone, "dramatic"),
    style: str(body.style, "comic book"),
    character: str(body.character, "Fable"),
  });
}
