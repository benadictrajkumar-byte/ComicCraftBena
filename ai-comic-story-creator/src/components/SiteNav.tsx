import Link from "next/link";
import { PenSquare, LibraryBig } from "lucide-react";

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b-3 border-ink bg-ink/95 backdrop-blur-sm">
      <div className="h-1 w-full bg-gradient-to-r from-pop via-gold to-candy" />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          {/* starburst logo */}
          <span className="relative grid h-10 w-10 place-items-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full transition-transform duration-300 group-hover:rotate-45">
              <polygon
                points="50,2 58,24 74,10 70,34 94,28 78,44 100,50 78,56 94,72 70,66 74,90 58,76 50,98 42,76 26,90 30,66 6,72 22,56 0,50 22,44 6,28 30,34 26,10 42,24"
                fill="#ffb02e"
                stroke="#0d0b14"
                strokeWidth="4"
              />
            </svg>
            <span className="relative font-display text-sm text-ink">CC</span>
          </span>
          <span className="font-display text-xl tracking-wide text-paper">
            COMIC<span className="text-gold">CRAFT</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 border-2.5 border-transparent px-3 py-1.5 text-sm font-bold uppercase tracking-wider text-paper/80 transition-colors hover:text-gold"
          >
            <LibraryBig className="h-4 w-4" />
            <span className="hidden sm:inline">Library</span>
          </Link>
          <Link
            href="/#creator"
            className="btn-pop bg-candy px-4 py-2 text-sm text-ink"
          >
            <PenSquare className="h-4 w-4" />
            <span className="hidden sm:inline">New comic</span>
            <span className="sm:hidden">Create</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
