import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Cpu, PenSquare } from "lucide-react";
import MiniCover from "@/components/MiniCover";
import Reveal from "@/components/Reveal";
import { listComics } from "@/lib/comic/store";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Comic library" };

export default async function LibraryPage() {
  let comics: Awaited<ReturnType<typeof listComics>> = [];
  let loadError = false;
  try {
    comics = await listComics(24);
  } catch {
    loadError = true;
  }

  return (
    <div className="relative">
      <section className="relative overflow-hidden border-b-3 border-ink bg-ink2">
        <div className="halftone pointer-events-none absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18">
          <Reveal>
            <span className="chip bg-bolt text-ink">The archive</span>
          </Reveal>
          <Reveal delay={90}>
            <h1 className="mt-5 font-display text-4xl uppercase tracking-wide text-paper sm:text-6xl">
              The ComicCraft <span className="text-gold">library</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-4 max-w-lg text-paper/60">
              Every comic you generate is bound and shelved here — reopen the preview or
              re-download the PDF any time.
            </p>
          </Reveal>
          {comics.length > 0 && (
            <Reveal delay={220}>
              <p className="mt-5 font-display text-sm tracking-[0.25em] text-paper/40 uppercase">
                {comics.length} {comics.length === 1 ? "tale" : "tales"} bound in this shelf
              </p>
            </Reveal>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        {comics.length === 0 ? (
          <Reveal>
            <div className="frame-lg mx-auto max-w-xl bg-paper p-8 text-center text-ink sm:p-12">
              <span className="frame-sm mx-auto block w-fit bg-ink p-2">
                <Image
                  src="/images/fox-badge.png"
                  alt="ComicCraft fox mascot"
                  width={300}
                  height={300}
                  className="h-44 w-44 object-contain"
                />
              </span>
              <h2 className="mt-6 font-display text-3xl uppercase tracking-wide">
                {loadError ? "The shelf is warming up" : "No comics yet"}
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink/60">
                {loadError
                  ? "The database is still being prepared. Try again in a moment — or better, craft the very first comic right now."
                  : "This shelf is suspiciously empty. Fix that — your first five-panel adventure takes about a minute."}
              </p>
              <Link href="/#creator" className="btn-pop mt-7 inline-flex bg-gold text-ink">
                <PenSquare className="h-5 w-5" />
                Craft the first comic
              </Link>
            </div>
          </Reveal>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {comics.map((comic, i) => (
              <Reveal key={comic.id} delay={(i % 3) * 90} rot={i % 2 === 0 ? -0.6 : 0.6}>
                <Link
                  href={`/comic/${comic.id}`}
                  className="frame group block bg-paper p-3 text-ink transition-transform duration-200 hover:-translate-y-2 hover:rotate-[-0.6deg]"
                >
                  <MiniCover art={comic.panels[0].art} />
                  <div className="px-1 pt-3.5 pb-1.5">
                    <h2 className="truncate font-display text-lg uppercase tracking-wide transition-colors group-hover:text-pop">
                      {comic.title}
                    </h2>
                    <p className="mt-1 font-hand text-lg leading-none text-ink/60">starring {comic.character}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-wider text-ink/55">
                      <span className="chip bg-cream px-2 py-1 shadow-none">{comic.tone}</span>
                      <span className="chip bg-cream px-2 py-1 shadow-none">{comic.style}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t-2 border-dashed border-ink/20 pt-2.5 text-[0.65rem] font-bold uppercase tracking-wider text-ink/45">
                      <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatDate(comic.createdAt)}</span>
                      <span className="flex items-center gap-1"><Cpu className="h-3 w-3" />{comic.engine}</span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
