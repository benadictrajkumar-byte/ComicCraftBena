/**
 * ComicCraft persistence layer (PostgreSQL via Drizzle ORM).
 */
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { comics, type ComicRow } from "@/db/schema";
import type { Comic, ComicInput, ComicPanel } from "./types";

function rowToComic(row: ComicRow): Comic {
  return {
    id: row.id,
    title: row.title,
    prompt: row.prompt,
    character: row.character,
    setting: row.setting,
    tone: row.tone,
    style: row.style,
    engine: row.engine,
    panels: row.panels,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createComic(
  input: ComicInput,
  data: { title: string; engine: string; panels: ComicPanel[] },
): Promise<Comic> {
  const [row] = await db
    .insert(comics)
    .values({
      title: data.title,
      prompt: input.prompt,
      character: input.character,
      setting: input.setting,
      tone: input.tone,
      style: input.style,
      engine: data.engine,
      panels: data.panels,
    })
    .returning();
  return rowToComic(row);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getComic(id: string): Promise<Comic | null> {
  if (!UUID_RE.test(id)) return null;
  const rows = await db.select().from(comics).where(eq(comics.id, id)).limit(1);
  return rows[0] ? rowToComic(rows[0]) : null;
}

export async function listComics(limit = 24): Promise<Comic[]> {
  const rows = await db.select().from(comics).orderBy(desc(comics.createdAt)).limit(limit);
  return rows.map(rowToComic);
}
