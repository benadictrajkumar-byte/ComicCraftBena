import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, CheckCircle2, LibraryBig, PenSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Export complete" };

const CONFETTI_COLORS = ["#ffb02e", "#ff5e3a", "#ff3d81", "#3fd8ff", "#45e0a8", "#f6edd8"];

export default async function ExportSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  const pieces = Array.from({ length: 30 }, (_, i) => {
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const left = (i * 137) % 100;
    const delay = ((i * 37) % 34) / 10;
    const dur = 2.9 + ((i * 13) % 16) / 10;
    return { color, left, delay, dur, key: i };
  });

  return (
    <div className="relative overflow-hidden">
      {/* confetti */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {pieces.map((p) => (
          <span
            key={p.key}
            className="confetti-piece"
            style={{
              left: `${p.left}%`,
              background: p.color,
              "--c-delay": `${p.delay}s`,
              "--c-dur": `${p.dur}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <section className="relative mx-auto grid max-w-5xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.2fr_1fr]">
        <div className="animate-rise">
          <span className="chip bg-mint text-ink">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Export successful
          </span>
          <h1 className="mt-6 font-display text-5xl uppercase leading-[0.95] tracking-wide text-paper sm:text-7xl">
            Your comic
            <br />
            <span className="text-gold">is in the bag.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-paper/65">
            The full comic — cover, illustrated panels, captions, dialogue and prompts —
            has been compiled into a timestamped PDF and downloaded to your device.
            Print it, share it, or frame it like the masterpiece it is.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/#creator" className="btn-pop bg-gold text-ink">
              <PenSquare className="h-5 w-5" />
              Go create another comic
            </Link>
            {id && (
              <Link href={`/comic/${id}`} className="btn-pop bg-paper text-ink">
                <BookOpen className="h-5 w-5" />
                Re-read this one
              </Link>
            )}
            <Link href="/library" className="btn-pop bg-ink3 text-paper">
              <LibraryBig className="h-5 w-5" />
              Open library
            </Link>
          </div>
        </div>

        <div className="animate-pop-in relative mx-auto w-full max-w-xs" style={{ animationDelay: "180ms" }}>
          <div className="frame-lg bg-paper p-3">
            <Image
              src="/images/fox-badge.png"
              alt="ComicCraft fox mascot celebrating"
              width={480}
              height={480}
              className="h-auto w-full"
              priority
            />
          </div>
          <p className="bubble bubble-left absolute -bottom-8 -left-4 -rotate-3 font-hand text-xl font-bold whitespace-nowrap">
            print me twice!
          </p>
        </div>
      </section>
    </div>
  );
}
