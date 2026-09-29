/**
 * ComicCraft layout builder  (layout_builder.py)
 * ---------------------------------------------
 * Binds the outline rows, the story rows and the panel art descriptors into
 * the final layout list that is stored in the database and rendered by the
 * preview page and the PDF exporter.
 */
import { makeArt } from "./art";
import type { ComicInput, ComicPanel, PanelOutline, PanelStory } from "./types";
import { PANEL_COUNT } from "./types";

export function buildComicLayout(
  input: ComicInput,
  outline: PanelOutline[],
  stories: PanelStory[],
): ComicPanel[] {
  const panels: ComicPanel[] = [];

  for (let i = 0; i < PANEL_COUNT; i++) {
    const o = outline[i];
    const s = stories[i];
    if (!o) break;

    panels.push({
      panel: i + 1,
      title: o.title || `Panel ${i + 1}`,
      scene: o.scene || "",
      imagePrompt: o.imagePrompt || "",
      caption: s?.caption ?? "*the story unfolds*",
      narration: s?.narration ?? o.scene,
      dialogue: s?.dialogue ?? [],
      art: makeArt(
        {
          setting: input.setting,
          tone: input.tone,
          style: input.style,
          character: input.character,
          prompt: input.prompt,
        },
        i + 1,
      ),
    });
  }

  return panels;
}
