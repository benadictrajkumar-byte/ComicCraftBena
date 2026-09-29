import { ChevronRight } from "lucide-react";
import { renderPanelSVG } from "@/lib/comic/art";
import type { ComicPanel } from "@/lib/comic/types";
import { cn } from "@/lib/utils";

/**
 * One bound comic panel: header strip, illustration, scene description,
 * ambient caption, narration, dialogue bubbles and the image-prompt reference.
 */
export default function PanelCard({ panel }: { panel: ComicPanel }) {
  const pad = String(panel.panel).padStart(2, "0");
  const uid = `p${panel.art.seed.toString(36)}`;

  return (
    <article
      id={`panel-${panel.panel}`}
      className={cn("relative", panel.panel % 2 === 0 ? "md:rotate-[0.5deg]" : "md:rotate-[-0.5deg]")}
    >
      {/* ghost number */}
      <div aria-hidden className="ghost-digit pointer-events-none absolute -top-12 -left-3 z-0 text-[6.5rem] sm:-left-6 sm:text-[8.5rem]">
        {pad}
      </div>

      <div className="frame-lg relative z-10 overflow-hidden bg-paper text-ink">
        {/* header strip */}
        <header className="flex items-center justify-between gap-4 border-b-3 border-ink bg-gold px-4 py-2.5 sm:px-6">
          <span className="font-display text-sm tracking-[0.2em] text-ink/70">PANEL {pad}</span>
          <h3 className="truncate font-display text-lg uppercase tracking-wide sm:text-xl">{panel.title}</h3>
        </header>

        <div className="grid lg:grid-cols-[1.05fr_1fr]">
          {/* illustration */}
          <div className="border-b-3 border-ink lg:border-r-3 lg:border-b-0">
            <div className="art-frame h-full min-h-60">
              {panel.art.png ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={panel.art.png} alt={`Illustration for panel ${panel.panel}: ${panel.title}`} className="h-full w-full object-cover" />
              ) : (
                <div dangerouslySetInnerHTML={{ __html: renderPanelSVG(panel.art, { idPrefix: uid }) }} />
              )}
            </div>
          </div>

          {/* story text */}
          <div className="flex flex-col gap-5 p-5 sm:p-7">
            <p className="text-sm leading-relaxed text-ink/65 italic">{panel.scene}</p>

            <span className="chip w-fit bg-ink text-gold">{panel.caption}</span>

            <p className="text-[0.97rem] leading-relaxed text-ink/90">{panel.narration}</p>

            {panel.dialogue.length > 0 && (
              <div className="space-y-5 pt-1">
                {panel.dialogue.map((line, i) => (
                  <div key={i} className={cn("flex", i % 2 === 1 && "justify-end")}>
                    <p className={cn("bubble max-w-[88%]", i % 2 === 0 ? "bubble-left" : "bubble-right")}>{line}</p>
                  </div>
                ))}
              </div>
            )}

            <details className="prompt-details mt-auto border-t-2 border-dashed border-ink/25 pt-3">
              <summary className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-ink/50 transition-colors hover:text-pop">
                <ChevronRight className="h-3.5 w-3.5 transition-transform details-open:rotate-90" />
                Image prompt
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-ink/55 italic">{panel.imagePrompt}</p>
            </details>
          </div>
        </div>
      </div>
    </article>
  );
}
