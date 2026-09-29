import Link from "next/link";
import { Sparkles, Image as ImageIcon, FileDown, BookOpen } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t-3 border-ink bg-ink2">
      <div className="halftone-dark h-2 w-full bg-gold" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl text-paper">
            COMIC<span className="text-gold">CRAFT</span>
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-paper/60">
            An AI comic story creator. Prompt an idea, and the pipeline outlines
            five panels, writes narration and dialogue, illustrates each frame
            and binds everything into a downloadable PDF.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[0.68rem] font-bold uppercase tracking-wider text-paper/50">
            <span className="chip border-paper/30 bg-transparent text-paper/60 shadow-none">Gemini story engine</span>
            <span className="chip border-paper/30 bg-transparent text-paper/60 shadow-none">Diffusion-ready art</span>
            <span className="chip border-paper/30 bg-transparent text-paper/60 shadow-none">PDF export</span>
          </div>
        </div>

        <div>
          <p className="font-display text-sm tracking-wider text-gold">PIPELINE</p>
          <ul className="mt-3 space-y-2 text-sm text-paper/65">
            <li className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-candy" /> Outline &amp; narration</li>
            <li className="flex items-center gap-2"><ImageIcon className="h-3.5 w-3.5 text-bolt" /> Panel illustrations</li>
            <li className="flex items-center gap-2"><BookOpen className="h-3.5 w-3.5 text-mint" /> Layout binding</li>
            <li className="flex items-center gap-2"><FileDown className="h-3.5 w-3.5 text-pop" /> PDF export</li>
          </ul>
        </div>

        <div>
          <p className="font-display text-sm tracking-wider text-gold">PAGES</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="text-paper/65 transition-colors hover:text-gold" href="/">Create a comic</Link></li>
            <li><Link className="text-paper/65 transition-colors hover:text-gold" href="/library">Comic library</Link></li>
            <li><Link className="text-paper/65 transition-colors hover:text-gold" href="/api/comics">JSON API</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/10 py-4 text-center text-xs uppercase tracking-[0.25em] text-paper/35">
        Ink on demand — crafted panel by panel
      </div>
    </footer>
  );
}
