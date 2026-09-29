import { NextResponse } from "next/server";
import { listComics } from "@/lib/comic/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/comics — most recent comics (library feed). */
export async function GET() {
  try {
    const comics = await listComics(48);
    return NextResponse.json({ comics });
  } catch (error) {
    console.error("[ComicCraft] list failed:", error);
    return NextResponse.json({ comics: [] });
  }
}
