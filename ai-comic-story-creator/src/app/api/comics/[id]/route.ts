import { NextResponse } from "next/server";
import { getComic } from "@/lib/comic/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/comics/:id — full comic layout JSON. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const comic = await getComic(id);
    if (!comic) {
      return NextResponse.json({ error: "Comic not found." }, { status: 404 });
    }
    return NextResponse.json({ comic });
  } catch (error) {
    console.error("[ComicCraft] fetch failed:", error);
    return NextResponse.json({ error: "Failed to load comic." }, { status: 500 });
  }
}
