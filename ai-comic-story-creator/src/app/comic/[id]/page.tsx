import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Cpu, LibraryBig, MapPin, Palette, PenSquare, Smile } from "lucide-react";
import DownloadButton from "@/components/DownloadButton";
import PanelCard from "@/components/PanelCard";
import Reveal from "@/components/Reveal";
import { getComic } from "@/lib/comic/store";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const comic = await getComic(id).catch(() => null);
  return { title: comic ? comic.title : "Comic" };
}

export default async function ComicPage({ params }: PageProps) {
  const { id } = await params;
  const comic = await getComic(id).catch(() => null);
  if (!comic) notFound();

  return (
    <div className="relative">
      {/* header */}
      <section className="relative overflow-hidden border-b-3 border-ink bg-ink2">
        <div className="halftone pointer-events-none absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-5xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <Reveal>
            <span className="chip bg-candy text-ink">An AI-crafted comic</span>
          </Reveal>
          <Reveal delay={90}>
            <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl uppercase leading-tight tracking-wide text-paper sm:text-6xl">
              {comic.title}
            </h1>
          </Reveal>
          <Reveal delay={170}>
            <p className="mt-5 font-hand text-2xl text-paper/70 sm:text-3xl">
              starring <span className="text-gold">{comic.character}</span>
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              <span className="chip bg-ink3 text-paper/85"><MapPin className="h-3.5 w-3.5 text-mint" />{comic.setting}</span>
              <span className="chip bg-ink3 text-paper/85"><Smile className="h-3.5 w-3.5 text-gold" />{comic.tone}</span>
              <span className="chip bg-ink3 text-paper/85"><Palette className="h-3.5 w-3.5 text-bolt" />{comic.style}</span>
              <span className="chip bg-ink3 text-paper/85"><Cpu className="h-3.5 w-3.5 text-candy" />{comic.engine}</span>
              <span className="chip bg-ink3 text-paper/85"><CalendarDays className="h-3.5 w-3.5 text-pop" />{formatDate(comic.createdAt)}</span>
            </div>
          </Reveal>

          <Reveal delay={310}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <DownloadButton id={comic.id} label="Download your comic as PDF" />
              <Link href="/#creator" className="btn-pop bg-paper text-ink">
                <PenSquare className="h-5 w-5" />
                Craft another
              </Link>
            </div>
          </Reveal>

          {/* panel index */}
          <Reveal delay={380}>
            <nav className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {comic.panels.map((panel) => (
                <a
                  key={panel.panel}
                  href={`#panel-${panel.panel}`}
                  className="border-2 border-paper/30 px-3 py-1 font-display text-[0.68rem] tracking-[0.18em] text-paper/60 transition-colors hover:border-gold hover:text-gold"
                >
                  {String(panel.panel).padStart(2, "0")}
                </a>
              ))}
            </nav>
          </Reveal>
        </div>
      </section>

      {/* panels */}
      <section className="mx-auto max-w-5xl space-y-16 px-4 pt-20 sm:px-6">
        {comic.panels.map((panel, i) => (
          <Reveal key={panel.panel} delay={i % 2 === 0 ? 0 : 60}>
            <PanelCard panel={panel} />
          </Reveal>
        ))}
      </section>

      {/* closing actions */}
      <section className="mx-auto max-w-3xl px-4 pt-24 sm:px-6">
        <Reveal>
          <div className="frame-lg relative overflow-hidden bg-candy p-8 text-center text-ink sm:p-12">
            <div className="halftone-dark pointer-events-none absolute inset-0 opacity-50" />
            <div className="relative">
              <h2 className="font-display text-3xl uppercase tracking-wide sm:text-4xl">
                Keep this story forever
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-relaxed text-ink/70">
                Export the full comic — cover, five illustrated panels and back page —
                as a timestamped PDF, straight to your device.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
                <DownloadButton id={comic.id} label="Download as PDF" className="bg-gold" />
                <Link href="/library" className="btn-pop bg-paper text-ink">
                  <LibraryBig className="h-5 w-5" />
                  Open library
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
