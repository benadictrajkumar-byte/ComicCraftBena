import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { ComicPanel } from "../lib/comic/types";

/**
 * ComicCraft — persisted comics.
 * Every generated comic (outline + story + panel art descriptors) is stored so
 * users can re-open the preview and re-download the PDF at any time.
 */
export const comics = pgTable(
  "comics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    prompt: text("prompt").notNull(),
    character: text("character").notNull(),
    setting: text("setting").notNull(),
    tone: text("tone").notNull(),
    style: text("style").notNull(),
    /** Which generation pipeline produced this comic (gemini / storyforge, etc.) */
    engine: text("engine").notNull().default("storyforge"),
    /** The bound layout: panel titles, scenes, captions, narration, dialogue + art */
    panels: jsonb("panels").$type<ComicPanel[]>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("comics_created_at_idx").on(table.createdAt)],
);

export type ComicRow = typeof comics.$inferSelect;
export type NewComicRow = typeof comics.$inferInsert;
