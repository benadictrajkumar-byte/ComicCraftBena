"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Building2,
  Camera,
  Check,
  FileDown,
  Flame,
  GraduationCap,
  Laugh,
  Loader2,
  Moon,
  Palette,
  PenLine,
  Rocket,
  Shuffle,
  Sparkles,
  Sun,
  Trees,
  User,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  icon: LucideIcon;
}

const SETTING_OPTIONS: Option[] = [
  { value: "forest", label: "Forest", icon: Trees },
  { value: "city", label: "City", icon: Building2 },
  { value: "space", label: "Space", icon: Rocket },
  { value: "school", label: "School", icon: GraduationCap },
];

const TONE_OPTIONS: Option[] = [
  { value: "dramatic", label: "Dramatic", icon: Flame },
  { value: "funny", label: "Funny", icon: Laugh },
  { value: "light-hearted", label: "Light", icon: Sun },
  { value: "poetic", label: "Poetic", icon: Moon },
];

const STYLE_OPTIONS: Option[] = [
  { value: "comic book", label: "Comic", icon: Zap },
  { value: "anime", label: "Anime", icon: Sparkles },
  { value: "pixel art", label: "Pixel", icon: Palette },
  { value: "realistic", label: "Real", icon: Camera },
];

const SAMPLES = [
  {
    label: "The Brave Fox",
    prompt: "A brave fox exploring an enchanted forest",
    character: "Fable",
    setting: "forest",
    tone: "dramatic",
    style: "anime",
  },
  {
    label: "Robot Exam Day",
    prompt: "A clumsy robot secretly taking the school math exam for fun",
    character: "Bolt",
    setting: "school",
    tone: "funny",
    style: "comic book",
  },
  {
    label: "Moon Postman",
    prompt: "A calm postman delivering long-lost letters between planets",
    character: "Milo",
    setting: "space",
    tone: "light-hearted",
    style: "pixel art",
  },
  {
    label: "The Night Train",
    prompt: "A mysterious cat who guards the last train through the sleeping city",
    character: "Whiskers",
    setting: "city",
    tone: "poetic",
    style: "realistic",
  },
];

const PIPE_STEPS = [
  { icon: PenLine, label: "Outlining five panels" },
  { icon: Sparkles, label: "Writing narration & dialogue" },
  { icon: Palette, label: "Painting panel artwork" },
  { icon: BookOpen, label: "Binding the layout" },
  { icon: FileDown, label: "Preparing the PDF exporter" },
];

export default function ComicCreator() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [character, setCharacter] = useState("");
  const [setting, setSetting] = useState("forest");
  const [tone, setTone] = useState("dramatic");
  const [style, setStyle] = useState("anime");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!busy) return;
    timer.current = setInterval(() => {
      setStepIdx((i) => Math.min(i + 1, PIPE_STEPS.length - 1));
    }, 1150);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [busy]);

  function surprise() {
    const sample = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    setPrompt(sample.prompt);
    setCharacter(sample.character);
    setSetting(sample.setting);
    setTone(sample.tone);
    setStyle(sample.style);
    setError(null);
  }

  async function submit() {
    if (busy) return;
    if (prompt.trim().length < 4) {
      setError("Give your story a prompt first — even a short one works wonders.");
      return;
    }
    setBusy(true);
    setDone(false);
    setError(null);
    setStepIdx(0);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          character: character.trim() || "Our Hero",
          setting,
          tone,
          style,
        }),
      });
      const data = (await res.json()) as { previewUrl?: string; error?: string };
      if (!res.ok || !data.previewUrl) {
        throw new Error(data.error ?? "Generation failed.");
      }
      setStepIdx(PIPE_STEPS.length - 1);
      setDone(true);
      window.setTimeout(() => router.push(data.previewUrl as string), 650);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      {/* pipeline overlay */}
      {busy && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-ink/92 px-4 backdrop-blur-sm">
          <div className="frame-lg w-full max-w-md bg-paper p-6 text-ink sm:p-8">
            <p className="font-display text-2xl uppercase tracking-wide">
              Crafting your comic<span className="animate-blink">_</span>
            </p>
            <p className="mt-1 text-sm text-ink/60">The pipeline is running — five panels coming right up.</p>
            <ul className="mt-6 space-y-3.5">
              {PIPE_STEPS.map((step, i) => {
                const state = done || i < stepIdx ? "done" : i === stepIdx ? "active" : "idle";
                return (
                  <li key={step.label} data-state={state} className="pipe-step flex items-center gap-3 text-sm font-bold uppercase tracking-wide">
                    <span className={cn(
                      "grid h-8 w-8 place-items-center border-2.5 border-ink",
                      state === "active" && "bg-gold",
                      state === "done" && "bg-mint text-ink",
                      state === "idle" && "bg-paper",
                    )}>
                      {state === "active" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : state === "done" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <step.icon className="h-4 w-4" />
                      )}
                    </span>
                    {step.label}
                  </li>
                );
              })}
            </ul>
            {done && (
              <p className="mt-6 animate-pop-in bg-ink px-4 py-2.5 text-center font-display text-sm tracking-widest text-gold">
                OPENING YOUR COMIC…
              </p>
            )}
          </div>
        </div>
      )}

      {/* console card */}
      <div className="frame-lg relative overflow-hidden bg-paper text-ink">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-3 border-ink bg-ink px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center border-2.5 border-gold bg-ink3">
              <PenLine className="h-4.5 w-4.5 text-gold" />
            </span>
            <div>
              <p className="font-display text-lg uppercase tracking-wider text-paper">Story console</p>
              <p className="text-xs uppercase tracking-[0.2em] text-paper/50">outline → story → art → pdf</p>
            </div>
          </div>
          <button
            type="button"
            onClick={surprise}
            className="btn-pop bg-bolt px-3.5 py-2 text-xs text-ink"
          >
            <Shuffle className="h-4 w-4" />
            Surprise me
          </button>
        </div>

        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1.1fr_1fr]">
          {/* left column */}
          <div className="space-y-6">
            <div>
              <label htmlFor="prompt" className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-ink/70">
                01 — Story prompt
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="A brave fox exploring an enchanted forest…"
                className="field resize-none border-ink/40 bg-ink text-paper focus:border-pop"
              />
              <div className="mt-1.5 flex items-center justify-between text-xs text-ink/50">
                <span>Describe the adventure in a sentence or two.</span>
                <span className="font-bold">{prompt.length}/500</span>
              </div>
            </div>

            <div>
              <label htmlFor="character" className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-ink/70">
                <User className="h-3.5 w-3.5" /> 02 — Main character
              </label>
              <input
                id="character"
                value={character}
                onChange={(e) => setCharacter(e.target.value)}
                maxLength={60}
                placeholder="Fable the fox…"
                className="field border-ink/40 bg-ink text-paper focus:border-pop"
              />
            </div>
          </div>

          {/* right column */}
          <div className="space-y-6">
            <OptionGroup index="03" label="Setting">
              {SETTING_OPTIONS.map((opt) => (
                <Chip key={opt.value} opt={opt} active={setting === opt.value} onClick={() => setSetting(opt.value)} />
              ))}
            </OptionGroup>
            <OptionGroup index="04" label="Tone">
              {TONE_OPTIONS.map((opt) => (
                <Chip key={opt.value} opt={opt} active={tone === opt.value} onClick={() => setTone(opt.value)} />
              ))}
            </OptionGroup>
            <OptionGroup index="05" label="Art style">
              {STYLE_OPTIONS.map((opt) => (
                <Chip key={opt.value} opt={opt} active={style === opt.value} onClick={() => setStyle(opt.value)} />
              ))}
            </OptionGroup>
          </div>
        </div>

        {error && (
          <div className="mx-5 mb-2 flex items-center gap-2 border-2.5 border-ink bg-pop px-4 py-2.5 text-sm font-bold text-ink sm:mx-8">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex flex-col items-center gap-4 border-t-3 border-ink bg-cream px-5 py-6 sm:flex-row sm:justify-between sm:px-8">
          <p className="max-w-sm text-center text-xs leading-relaxed text-ink/55 sm:text-left">
            One click runs the entire ComicCraft pipeline and saves your comic to
            the library — preview it on screen, then export it as a PDF.
          </p>
          <button type="button" onClick={submit} disabled={busy} className="btn-pop bg-gold px-8 py-4 text-lg text-ink">
            <Sparkles className="h-5 w-5" />
            Generate my comic
          </button>
        </div>
      </div>
    </div>
  );
}

function OptionGroup({ index, label, children }: { index: string; label: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-xs font-bold uppercase tracking-[0.18em] text-ink/70">
        {index} — {label}
      </legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Chip({ opt, active, onClick }: { opt: Option; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      data-active={active}
      onClick={onClick}
      className="opt-chip border-ink text-ink hover:border-pop data-[active=true]:bg-gold"
    >
      <opt.icon className="h-4 w-4" />
      {opt.label}
    </button>
  );
}
