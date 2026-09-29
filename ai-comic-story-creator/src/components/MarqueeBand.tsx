import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const WORDS = ["GENERATE", "INK", "NARRATE", "ILLUSTRATE", "EXPORT", "IMAGINE", "PANEL", "STORY"];

export default function MarqueeBand({ className }: { className?: string }) {
  const row = (
    <div className="flex shrink-0 items-center">
      {WORDS.map((word) => (
        <span key={word} className="flex items-center">
          <span className="px-5 font-display text-lg tracking-widest text-ink">{word}</span>
          <Star className="h-4 w-4 fill-ink text-ink" />
        </span>
      ))}
    </div>
  );

  return (
    <div className={cn("relative z-10 overflow-hidden border-y-3 border-ink bg-gold py-2.5", className)}>
      <div className="marquee-track">
        {row}
        {row}
      </div>
    </div>
  );
}
