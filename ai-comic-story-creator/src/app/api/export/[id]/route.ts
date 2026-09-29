import { NextResponse } from "next/server";
import { renderComicPdf } from "@/lib/comic/pdf";
import { getComic } from "@/lib/comic/store";
import { slugify, timestampStamp } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/export/:id
 * Compiles the comic into a timestamped PDF (save_pdf equivalent) and streams
 * it back as a download.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const comic = await getComic(id);
    if (!comic) {
      return NextResponse.json({ error: "Comic not found." }, { status: 404 });
    }

    const pdf = await renderComicPdf(comic);
    const fileName = `comiccraft-${slugify(comic.title) || "comic"}-${timestampStamp()}.pdf`;

    return new Response(Buffer.from(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[ComicCraft] export failed:", error);
    return NextResponse.json({ error: "PDF export failed." }, { status: 500 });
  }
}
