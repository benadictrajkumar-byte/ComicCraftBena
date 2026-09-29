import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  FileDown,
  ImageIcon,
  Layers,
  LibraryBig,
  MessageSquareText,
  PenLine,
  Sparkles,
  Star,
} from "lucide-react";
import ComicCreator from "@/components/ComicCreator";
import MarqueeBand from "@/components/MarqueeBand";
import MiniCover from "@/components/MiniCover";
import Reveal from "@/components/Reveal";
import { makeArt } from "@/lib/comic/art";
import { listComics } from "@/lib/comic/store";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PIPELINE = [
  {
    n: "01",
    icon: PenLine,
    title: "Outline",
    body: "The story engine breaks your prompt into five tight panel beats: hook, journey, peril, climax, resolution.",
    color: "bg-candy",
  },
  {
    n: "02",
    icon: MessageSquareText,
    title: "Narration",
    body: "Each panel gets an ambient caption, rich narration and character dialogue tuned to your chosen tone.",
    color: "bg-gold",
  },
  {
    n: "03",
    icon: ImageIcon,
    title: "Illustration",
    body: "Panel-by-panel artwork is generated from the scene prompts — illustrations that match your art style.",
    color: "bg-bolt",
  },
  {
    n: "04",
    icon: Layers,
    title: "Layout",
    body: "The layout builder binds titles, scenes, images, captions and dialogue into one cohesive comic layout.",
    color: "bg-mint",
  },
  {
    n: "05",
    icon: FileDown,
    title: "Export",
    body: "One click compiles everything into a timestamped, professionally paged PDF — ready to save, print or share.",
    color: "bg-pop",
  },
];

const DEMO_LABELS = [
  "PERIL · ENCHANTED FOREST",
  "CLIMAX · NEON CITY",
  "LEGACY · DEEP SPACE",
];

export default async function HomePage() {
  // demo panels produced by the same art engine the generator uses
  const demos = [
    makeArt(
      { setting: "enchanted forest", tone: "dramatic", style: "comic book", character: "Fable the fox", prompt: "a brave fox exploring an enchanted forest" },
      3,
    ),
    makeArt(
      { setting: "neon city", tone: "funny", style: "comic book", character: "Detective Pickles the cat", prompt: "a cat detective solving the case of the missing moon" },
      4,
    ),
    makeArt(
      { setting: "deep space", tone: "light-hearted", style: "anime", character: "Milo the astronaut", prompt: "a postman delivering letters between planets" },
      5,
    ),
  ];

  let recent: Awaited<ReturnType<typeof listComics>> = [];
  try {
    recent = await listComics(3);
  } catch {
    recent = [];
  }

  return (
    <div className="relative">
      {/* ------------------------------------------------- hero */}
      <section className="relative overflow-hidden">
        <Image
          src="/images/hero-ink.jpg"
          alt=""
          fill
          priority
          className="pointer-events-none object-cover opacity-55"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/55 to-ink" />
        <div className="pointer-events-none absolute inset-0 halftone opacity-40" />

        {/* floating speech bubbles */}
        <div
          className="animate-floaty absolute top-[16%] right-[6%] hidden rotate-6 lg:block"
          style={{ "--float-rot": "6deg" } as React.CSSProperties}
        >
          <p className="bubble bubble-left font-hand text-2xl font-bold">hello, panels!</p>
        </div>
        <div
          className="animate-floaty absolute top-[54%] left-[4%] hidden -rotate-8 lg:block"
          style={{ "--float-rot": "-8deg", animationDelay: "1.4s" } as React.CSSProperties}
        >
          <p className="bubble bubble-right font-hand text-2xl font-bold">once upon a prompt…</p>
        </div>
        <div
          className="animate-floaty absolute top-[70%] right-[12%] hidden rotate-3 lg:block"
          style={{ "--float-rot": "3deg", animationDelay: "2.6s" } as React.CSSProperties}
        >
          <p className="chip bg-pop text-ink">AI-native publishing desk</p>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-24 sm:px-6 sm:pt-28 sm:pb-32">
          <p className="hero-word mx-auto w-fit chip bg-ink text-gold" style={{ "--word-delay": "50ms" } as React.CSSProperties}>
            <Sparkles className="h-3.5 w-3.5" />
            ComicCraft · AI Comic Story Creator
          </p>

          <h1 className="mt-8 text-center font-display leading-[0.92] text-paper uppercase">
            <span className="block">
              {["Your", "story"].map((w, i) => (
                <span
                  key={w}
                  className="hero-word mr-[0.22em] text-[clamp(2.6rem,8.5vw,6.5rem)] last:mr-0"
                  style={{ "--word-delay": `${120 + i * 110}ms` } as React.CSSProperties}
                >
                  {w}
                </span>
              ))}
            </span>
            <span className="block">
              <span className="hero-word mr-[0.22em] text-[clamp(2.6rem,8.5vw,6.5rem)] text-gold" style={{ "--word-delay": "340ms" } as React.CSSProperties}>
                becomes
              </span>
              <span className="hero-word text-[clamp(2.6rem,8.5vw,6.5rem)] text-gold" style={{ "--word-delay": "450ms" } as React.CSSProperties}>
                a
              </span>
            </span>
            <span className="block">
              {["comic", "book."].map((w, i) => (
                <span
                  key={w}
                  className="hero-word mr-[0.22em] text-[clamp(2.6rem,8.5vw,6.5rem)] last:mr-0"
                  style={{ "--word-delay": `${560 + i * 110}ms` } as React.CSSProperties}
                >
                  {w}
                </span>
              ))}
            </span>
          </h1>

          <p
            className="hero-word mx-auto mt-7 max-w-xl text-center text-base leading-relaxed text-paper/70 sm:text-lg"
            style={{ "--word-delay": "780ms" } as React.CSSProperties}
          >
            Type one sentence. ComicCraft outlines five panels, writes the dialogue,
            illustrates every frame and binds it all into a PDF you can download.
          </p>

          <div
            className="hero-word mt-10 flex flex-wrap items-center justify-center gap-4"
            style={{ "--word-delay": "900ms" } as React.CSSProperties}
          >
            <Link href="#creator" className="btn-pop bg-gold text-ink">
              <PenLine className="h-5 w-5" />
              Start crafting
            </Link>
            <Link href="/library" className="btn-pop bg-paper text-ink">
              <LibraryBig className="h-5 w-5" />
              Browse library
            </Link>
          </div>

          <div
            className="hero-word mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-paper/45"
            style={{ "--word-delay": "1020ms" } as React.CSSProperties}
          >
            <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-gold text-gold" /> 5-panel arcs</span>
            <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-candy text-candy" /> 4 tones × 4 art styles</span>
            <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-bolt text-bolt" /> Instant PDF export</span>
          </div>
        </div>
      </section>

      <MarqueeBand className="-rotate-1 scale-[1.02]" />

      {/* ------------------------------------------------- creator */}
      <section id="creator" className="relative mx-auto max-w-5xl scroll-mt-24 px-4 pt-24 sm:px-6">
        <Reveal>
          <div className="mb-10 text-center">
            <p className="font-hand text-2xl text-gold sm:text-3xl">step inside the studio</p>
            <h2 className="mt-1 font-display text-4xl uppercase tracking-wide text-paper sm:text-5xl">
              Describe it. <span className="text-pop">We ink it.</span>
            </h2>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <ComicCreator />
        </Reveal>
      </section>

      {/* ------------------------------------------------- pipeline */}
      <section className="mx-auto max-w-6xl px-4 pt-28 sm:px-6">
        <Reveal className="mb-12 text-center">
          <p className="font-hand text-2xl text-bolt sm:text-3xl">how the machine thinks</p>
          <h2 className="mt-1 font-display text-4xl uppercase tracking-wide text-paper sm:text-5xl">
            One prompt, <span className="text-candy">five moves</span>
          </h2>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {PIPELINE.map((step, i) => (
            <Reveal key={step.n} delay={i * 90} rot={i % 2 === 0 ? -1 : 1}>
              <div className="frame-sm group h-full bg-paper p-5 text-ink transition-transform duration-200 hover:-translate-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`grid h-10 w-10 place-items-center border-2.5 border-ink ${step.color}`}>
                    <step.icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-2xl text-ink/20">{step.n}</span>
                </div>
                <h3 className="mt-4 font-display text-xl uppercase tracking-wide">{step.title}</h3>
                <p className="mt-2 text-[0.83rem] leading-relaxed text-ink/65">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------- showcase */}
      <section className="mx-auto max-w-6xl px-4 pt-28 sm:px-6">
        <Reveal className="mb-12 text-center">
          <p className="font-hand text-2xl text-mint sm:text-3xl">fresh off the press</p>
          <h2 className="mt-1 font-display text-4xl uppercase tracking-wide text-paper sm:text-5xl">
            Panels with <span className="text-bolt">real ink</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-paper/55">
            Every illustration below was produced live by the built-in art engine — the
            same one that paints your comics.
          </p>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {demos.map((art, i) => (
            <Reveal key={DEMO_LABELS[i]} delay={i * 110} rot={i === 1 ? 1.2 : i === 0 ? -1.6 : 0.6}>
              <figure className="frame bg-paper p-2.5 transition-transform duration-200 hover:-translate-y-2">
                <MiniCover art={art} />
                <figcaption className="flex items-center justify-between px-1 pt-2.5 pb-1">
                  <span className="font-display text-[0.68rem] tracking-[0.2em] text-ink/70">{DEMO_LABELS[i]}</span>
                  <BookOpen className="h-3.5 w-3.5 text-ink/50" />
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        {/* recent comics teaser */}
        {recent.length > 0 && (
          <>
            <Reveal className="mt-24 mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="font-hand text-2xl text-gold sm:text-3xl">hot from the library</p>
                <h2 className="mt-1 font-display text-3xl uppercase tracking-wide text-paper sm:text-4xl">
                  Recently crafted
                </h2>
              </div>
              <Link href="/library" className="btn-pop hidden bg-ink3 px-4 py-2 text-xs text-paper sm:inline-flex">
                View all
              </Link>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-3">
              {recent.map((comic, i) => (
                <Reveal key={comic.id} delay={i * 100}>
                  <Link href={`/comic/${comic.id}`} className="frame group block bg-paper p-2.5 transition-transform duration-200 hover:-translate-y-2">
                    <MiniCover art={comic.panels[0].art} />
                    <div className="px-1 pt-3 pb-1 text-ink">
                      <p className="truncate font-display text-base uppercase tracking-wide">{comic.title}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-ink/50">
                        {comic.character} · {formatDate(comic.createdAt)}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ------------------------------------------------- closing CTA */}
      <section className="mx-auto max-w-4xl px-4 pt-28 sm:px-6">
        <Reveal>
          <div className="frame-lg relative overflow-hidden bg-gold p-8 text-center text-ink sm:p-14">
            <div className="halftone-dark pointer-events-none absolute inset-0 opacity-60" />
            <div className="relative">
              <p className="font-hand text-2xl sm:text-3xl">no drawing skills required</p>
              <h2 className="mt-2 font-display text-3xl uppercase tracking-wide sm:text-5xl">
                Your next adventure is one sentence away
              </h2>
              <Link href="#creator" className="btn-pop mt-8 inline-flex bg-ink text-paper">
                <PenLine className="h-5 w-5" />
                Write the first line
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
