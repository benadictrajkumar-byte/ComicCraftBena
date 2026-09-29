/**
 * ComicCraft Story Engine (local)
 * --------------------------------
 * Deterministic, seeded narrative generator that mirrors the behaviour of the
 * two Gemini stages: `forgeOutline()` produces the structured 5-panel outline
 * (panel number, title, scene description, image prompt) and `forgeStory()`
 * expands it into captions, narration and dialogue — tailored to the chosen
 * setting and tone. Used as the offline engine and as an automatic fallback
 * when the Gemini API is unreachable.
 */
import { hashSeed, mulberry32, pick } from "./rand";
import { settingKey } from "./art";
import type { Beat, ComicInput, PanelOutline, PanelStory } from "./types";

interface Lexicon {
  label: string;
  realms: string[];
  landmark: string[];
  guide: string[];
  threat: string[];
  relic: string[];
}

const LEX: Record<string, Lexicon> = {
  forest: {
    label: "Enchanted Forest",
    realms: ["the Whisperwood", "Mosslight Glade", "the Emberpine Wilds", "Fernhollow Deep"],
    landmark: [
      "a moonlit elder oak with a door in its trunk",
      "a ring of softly humming standing stones",
      "a fallen log bridge strung with lantern-moss",
      "a waterfall that runs upward after midnight",
    ],
    guide: ["a one-eyed owl wearing a monocle", "a firefly with very strong opinions", "a cartographer badger", "a deer with antlers full of birds"],
    threat: ["the Thorn Hollow", "a briar maze with a heartbeat", "the Hollow Keeper", "a fog that remembers your name"],
    relic: ["the Dawn Acorn", "a leaf of pure starlight", "the Forest Oath", "the Seed of First Spring"],
  },
  city: {
    label: "Neon City",
    realms: ["Lumen Row", "the Gilded Undergrid", "Neonmarket", "Old Voltage Town"],
    landmark: [
      "a noodle bar that never closes, run by a retired superhero",
      "a rooftop where the city pigeons hold nightly parliaments",
      "an elevator that stops on floors nobody built",
      "a vending machine that dispenses prophecies",
    ],
    guide: ["a taxi driver who knows every shortcut through time", "a graffiti fox that peels itself off walls", "a street violinist with lightning in the bow", "a janitor of secret doors"],
    threat: ["the Blackout Gang", "a signal that turns billboards against their owners", "the Mayor of Shadows", "a traffic jam that has lasted three years for mysterious reasons"],
    relic: ["the Master Key of Every Door", "the last analogue photograph of the city", "a subway token worth one impossible wish", "the Original Lightbulb"],
  },
  space: {
    label: "Deep Space",
    realms: ["the Vermilion Drift", "Orbit City Nine", "the Sea of Tranquil Static", "the Cartographer's Belt"],
    landmark: [
      "a derelict station blooming with zero-gravity orchids",
      "a diner at Lagrange Point Three with legendary coffee",
      "a lighthouse built for lost ships",
      "an asteroid field arranged, suspiciously, like a welcome sign",
    ],
    guide: ["a navigation AI with a flair for drama", "a helmet-grown plant named Gerald", "a retired comet wrangler", "a two-headed telescope that argues with itself"],
    threat: ["the Silence Between Signals", "a gravity well with ambitions", "the Corsairs of the Cold Dark", "a distress call from your own ship, sent tomorrow"],
    relic: ["a star that fits in your pocket", "the Map of All Possible Routes Home", "a golden record no one has ever played", "the Captain's Unsent Letter"],
  },
  school: {
    label: "School Days",
    realms: ["Oakhall Academy", "the school behind the school", "Riddleford High", "the Old Gym of Echoes"],
    landmark: [
      "a library where due dates are enforced by gargoyles",
      "a locker that opens onto a different season every day",
      "the lost-and-found box, which is definitely bottomless",
      "a chalkboard that finishes the teacher's sentences",
    ],
    guide: ["the hall monitor with a badge older than the school", "a lunch lady who knows your destiny by soup", "the mascot costume (occupied, mysteriously, at all hours)", "a homework-eating dog with commendable taste"],
    threat: ["the Endless Pop Quiz", "the Detention Dimension", "a substitute teacher from parts unknown", "the Bell That Rings Backwards"],
    relic: ["the Golden Hall Pass", "the answer sheet to the only question that matters", "the Founder's True Mascot Head", "a yearbook from next year"],
  },
  hills: {
    label: "The Open Wilds",
    realms: ["the Rolling Marches", "Summeric Vale", "the Long Meadow", "Wayward Downs"],
    landmark: [
      "a windmill that grinds stardust on Tuesdays",
      "a stone arch older than the road it stands on",
      "a lone tree where travellers tie their wishes",
      "a creek that hums show tunes at dawn",
    ],
    guide: ["a very round sheepdog with a map in his collar", "a travelling kettle that never runs dry", "a scarecrow on sabbatical", "the wind itself, in a helpful mood"],
    threat: ["the Long Rain", "a fork in the road that multiplies when unobserved", "the Grumblegate Pass", "a storm cloud with a personal grievance"],
    relic: ["the Compass of Honest Directions", "a seed from the First Orchard", "the Lantern of Warm Evenings", "the Last Page of a very good book"],
  },
};

function lexiconFor(setting: string): Lexicon {
  return LEX[settingKey(setting)] ?? LEX.hills;
}

type Rng = () => number;
type ToneKey = "dramatic" | "funny" | "poetic" | "light";

function toneOf(tone: string): ToneKey {
  const t = tone.toLowerCase();
  if (t.includes("fun")) return "funny";
  if (t.includes("poet")) return "poetic";
  if (t.includes("light") || t.includes("heart")) return "light";
  return "dramatic";
}

interface BeatCtx {
  char: string;
  goal: string;
  realm: string;
  landmark: string;
  guide: string;
  threat: string;
  relic: string;
  settingLabel: string;
  tone: string;
  style: string;
}

function imagePrompt(ctx: BeatCtx, beat: Beat, focus: string): string {
  return (
    `${ctx.style} comic book panel, ${ctx.char} ${focus}, ${ctx.settingLabel.toLowerCase()} environment, ` +
    `${ctx.tone} atmosphere, dynamic composition, bold ink lines, halftone shading, rich cinematic lighting, ` +
    `highly detailed background, square comic frame`
  );
}

interface BeatSpec {
  beat: Beat;
  titles: string[];
  scene: (c: BeatCtx) => string;
  caption: string[];
  focus: (c: BeatCtx) => string;
  narration: Record<ToneKey, (c: BeatCtx) => string>;
  dialogue: Record<ToneKey, (c: BeatCtx) => string[]>;
}

const BEATS: BeatSpec[] = [
  {
    beat: "arrival",
    titles: ["The Call", "Ink on the Horizon", "Where It Begins", "One Small Step Sideways"],
    scene: (c) =>
      `${cap(c.realm)} at the edge of morning. ${cap(c.landmark)} waits somewhere ahead, and every shadow seems to be holding its breath.`,
    caption: ["*crackle underfoot — the world leaning in to listen*", "*a lone wind combs the horizon*", "*somewhere, a door unlocks itself*"],
    focus: (c) => `standing at the edge of ${c.realm}, ${c.landmark} glimmering in the distance`,
    narration: {
      dramatic: (c) =>
        `${c.realm} never asked for a hero. It simply waited — patient as stone, old as weather — until ${c.char} arrived. The mission was impossible on paper: ${c.goal}. Fortunately, ${c.char} had never been much of a reader.`,
      funny: (c) =>
        `Everyone agreed the plan was terrible. Unfortunately, everyone had also voted for ${c.char} to carry it out. So here they stood at the edge of ${c.realm}, packed lunch in hand, pretending this was all completely normal.`,
      poetic: (c) =>
        `Morning opened like an envelope, and ${c.realm} was the letter inside. ${c.char} read it slowly: the light, the mist, the hush between two heartbeats. Some journeys begin with a step. This one began with a held breath.`,
      light: (c) =>
        `The sun was up, the sky was showing off, and ${c.char} had a heart full of breakfast and exactly one big idea: ${c.goal}. ${cap(c.realm)} sparkled ahead like it had been waiting just for them. Maybe it had.`,
    },
    dialogue: {
      dramatic: (c) => [`“${cap(c.realm)},” ${c.char} said. “Let's see what you're keeping from me.”`, "The horizon did not answer. It considered that polite."],
      funny: (c) => [`“Okay, ${c.char},” ${c.char} announced, “we're doing this.”`, "“We're doing this?” echoed the trees. “Oh, this should be good.”"],
      poetic: (c) => [`“I hear you,” ${c.char} whispered to the morning.`, "And the morning, shy as ink, whispered back: “Then come.”"],
      light: (c) => [`“Adventure checklist!” said ${c.char}. “Snacks? Check. Courage? …Mostly check!”`],
    },
  },
  {
    beat: "journey",
    titles: ["Into the Deep", "The Long Way Round", "Strange Company", "Footprints and Rumours"],
    scene: (c) =>
      `The path folds deeper into ${c.realm}. ${cap(c.landmark)} turns out to be real — and it is being guarded, argued over, or possibly just napped upon by ${c.guide}.`,
    caption: ["*leaves / neon / starlight (delete as appropriate) whisper past*", "*footsteps, then one extra*", "*a map being folded the wrong way*"],
    focus: (c) => `walking beside ${c.guide} past ${c.landmark}, deep inside ${c.realm}`,
    narration: {
      dramatic: (c) =>
        `${cap(c.guide)} fell into step beside ${c.char} without asking permission, the way all true guides do. “The way is watched,” they said. “And the way does not like being watched back.” ${c.char} kept walking. Some warnings are just invitations wearing a disguise.`,
      funny: (c) =>
        `${cap(c.guide)} joined the expedition uninvited, immediately questioned the snack situation, and declared ${c.char}'s map “upside down, emotionally.” The map was, technically, upside down.`,
      poetic: (c) =>
        `They walked the way rivers remember — unhurried, certain. ${cap(c.guide)} spoke in small bright sentences, and ${c.realm} leaned closer to listen, and ${c.char} felt the story quietly change its mind about being small.`,
      light: (c) =>
        `New friend alert! ${cap(c.guide)} knew every shortcut in ${c.realm} and exactly three terrible jokes. ${c.char} heard all three before lunch. Things were looking up.`,
    },
    dialogue: {
      dramatic: (c) => [`“Every step deeper costs you something,” said ${c.guide}.`, `“Then I'll pay in footsteps,” said ${c.char}. “I've plenty.”`],
      funny: (c) => [`“Rule one,” said ${c.guide}, “never trust the quiet parts.”`, `“…Which parts are quiet?” asked ${c.char}. “Precisely,” said the guide, helpfully.`],
      poetic: (c) => [`“Do you ever get lost out here?” ${c.char} asked.`, `“Only into better places,” said ${c.guide}.`],
      light: (c) => [`“I know a shortcut!” said ${c.guide}.`, `“Is it safe?” “It's SHORT. One out of two!”`],
    },
  },
  {
    beat: "peril",
    titles: ["The Thorn Hollow", "Teeth of the Story", "The Test", "Where Shadows Clock In"],
    scene: (c) =>
      `${cap(c.threat)} rises between our hero and the prize. The air goes thin and metallic, and old warnings suddenly sound like excellent advice.`,
    caption: ["*a growl with somewhere to be*", "*the light remembers somewhere safer*", "*heartbeat: syncopated*"],
    focus: (c) => `facing down ${c.threat}, small but unflinching, lantern-light behind them`,
    narration: {
      dramatic: (c) =>
        `${cap(c.threat)} did not roar. Roaring is for things that need to be believed in. It simply unmade the path behind ${c.char} and waited, patient as gravity. This was the price of every good story: a moment that asks what you are actually made of.`,
      funny: (c) =>
        `There are many ways to handle ${c.threat}: diplomacy, choreography, interpretive dance. ${c.char} chose option four — standing very still while the brain filed seventeen identical reports reading “nope.”`,
      poetic: (c) =>
        `Fear arrived wearing ${c.threat}'s face. It filled the clearing the way night fills a room: not by entering, but by being suddenly, utterly, already there. ${c.char} stood inside it anyway, a small warm contradiction.`,
      light: (c) =>
        `Okay, so: ${c.threat}. Bigger than advertised. ${c.char}'s knees were playing the maracas, but somewhere under the wobble was a little engine of “I can,” and it was still chugging.`,
    },
    dialogue: {
      dramatic: (c) => [`“Turn back,” rumbled ${c.threat}. “This page was not written for you.”`, `“Then I'll write it over,” said ${c.char}.`],
      funny: (c) => [`“YOU DARE ENTER—” began ${c.threat}.`, `“Honestly?” said ${c.char}. “I dared about twelve exits ago. We're committed now.”`],
      poetic: (c) => [`“Little spark,” said ${c.threat}, “the dark is older than you.”`, `“Yes,” said ${c.char}. “But I'm brighter presently.”`],
      light: (c) => [`“Uh, nice ${c.threat}…” said ${c.char}. “Good… ominous thing. Stay?”`, `It did not stay.`],
    },
  },
  {
    beat: "climax",
    titles: ["The Turning", "One Bright Move", "Against the Panel Border", "The Loudest Panel"],
    scene: (c) =>
      `Everything converges. ${cap(c.relic)} is within reach — and ${c.char} does the one thing nobody, not even the story, expected.`,
    caption: ["*the page holds its breath*", "*KRAKOOM-adjacent noises*", "*destiny: buffering…*"],
    focus: (c) => `striking the decisive blow against ${c.threat}, ${c.relic} blazing in their grip, burst of white-hot light`,
    narration: {
      dramatic: (c) =>
        `There was no plan. There was only the moment, and ${c.char} running straight through the middle of it. When ${c.char}'s hand closed around ${c.relic}, the whole of ${c.realm} rang like a struck bell — and ${c.threat}, for the first time in its long and gloomy career, hesitated.`,
      funny: (c) =>
        `The trick, ${c.char} would later explain to absolutely anyone holding still, was to trip with purpose. One heroic stumble later, ${c.relic} landed in their arms, ${c.threat} landed on its dignity, and physics quietly excused itself from the panel.`,
      poetic: (c) =>
        `And here the story turned, the way light turns at the edge of a prism. ${c.char} reached — not for glory, but for the small true thing at the centre of the dark — and ${c.relic} answered like a chord resolving.`,
      light: (c) =>
        `Deep breath. Big grin. ${c.char} leapt, the world went WHIZZ-POP-BRIGHT — and when the sparkles settled, there was ${c.relic}, snug in their hands like it had always lived there.`,
    },
    dialogue: {
      dramatic: (c) => [`“This,” said ${c.char}, lifting ${c.relic} high, “is the part where you blink first.”`, `And ${c.threat}, at last, did.`],
      funny: (c) => [`“I meant to do that!” ${c.char} shouted, mid-tumble.`, `From somewhere below: “NOBODY MEANS TO DO THAT,” said ${c.threat}, falling.`],
      poetic: (c) => [`“Shine,” ${c.char} told ${c.relic}, very quietly.`, `It did.`],
      light: (c) => [`“GOTCHA!” cheered ${c.char}.`, `“…gotcha?” squeaked ${c.relic}. Best. Day. Ever.`],
    },
  },
  {
    beat: "legacy",
    titles: ["Homeward Light", "What the Forest Keeps", "The Map After", "Epilogue With Snacks"],
    scene: (c) =>
      `Dawn reorganises the sky. Our hero stands a little taller than before, ${c.realm} humming behind them like a well-fed fire.`,
    caption: ["*birdsong, or the starlight equivalent*", "*a story settling into legend*", "*somewhere, a new page being turned*"],
    focus: (c) => `on a rise at sunrise, ${c.relic} glowing softly, confetti-like light drifting through the air`,
    narration: {
      dramatic: (c) =>
        `They never found ${c.char} changed. They found ${c.char} the same — the way a knife is the same after the whetstone: the same shape, newly honest. ${cap(c.realm)} kept ${c.relic}'s light. ${c.char} kept the road. Both, it must be said, kept in touch.`,
      funny: (c) =>
        `And so ${c.char} returned home a legend: statue commissioned (life-size, then budget-size, then mushroom-size), song composed (decent), and ${c.guide} hired as official biographer (unsupervised). The snacks, sources confirm, were finally adequate.`,
      poetic: (c) =>
        `Morning came back on tiptoe and found the story finished, or nearly: ${c.realm} breathing easier, ${c.relic} warm as a coal in its keeping. “Stay a little,” said the light. “I always do,” said ${c.char}, “on my way through.”`,
      light: (c) =>
        `Home again, home again — with one more story, one more friend, and pockets full of glow. “Same time next Tuesday?” asked ${c.guide}. ${c.char} grinned. Some adventures fit in a comic. The best ones don't fit anywhere.`,
    },
    dialogue: {
      dramatic: (c) => [
        `“Will you forget this place?” asked ${c.guide}.`,
        `“Places like this,” said ${c.char}, “are how I remember everything else.”`,
      ],
      funny: (c) => [`“So — hero now. What's the first thing you're doing?” asked ${c.guide}.`, `“Nap,” said ${c.char}. “A legendary one.”`],
      poetic: (c) => [`“Endings are shy,” said ${c.char}.`, `“Then let's tiptoe,” said ${c.guide}. And they did.`],
      light: (c) => [`“Best! Quest! Ever!” said ${c.guide}.`, `“Until the sequel,” winked ${c.char}.`],
    },
  },
];

function cap(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function firstLower(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "to follow the story wherever it leads";
  const sentence = trimmed.replace(/[.!?]+$/, "");
  return sentence.charAt(0).toLowerCase() + sentence.slice(1);
}

function buildCtx(input: ComicInput, rng: Rng): BeatCtx {
  const lex = lexiconFor(input.setting);
  return {
    char: input.character.trim() || "Our Hero",
    goal: firstLower(input.prompt),
    realm: pick(rng, lex.realms),
    landmark: pick(rng, lex.landmark),
    guide: pick(rng, lex.guide),
    threat: pick(rng, lex.threat),
    relic: pick(rng, lex.relic),
    settingLabel: lex.label,
    tone: input.tone,
    style: input.style,
  };
}

function seedFor(input: ComicInput): number {
  return hashSeed(`story|${input.prompt}|${input.character}|${input.setting}|${input.tone}`);
}

/** Structured 5-panel outline — the local equivalent of generate_outline(). */
export function forgeOutline(input: ComicInput): PanelOutline[] {
  const rng = mulberry32(seedFor(input));
  const ctx = buildCtx(input, rng);
  return BEATS.map((spec, i) => ({
    panel: i + 1,
    title: pick(rng, spec.titles),
    scene: spec.scene(ctx),
    imagePrompt: imagePrompt(ctx, spec.beat, spec.focus(ctx)),
  }));
}

/** Captions, narration and dialogue — the local equivalent of generate_story(). */
export function forgeStory(input: ComicInput, outline?: PanelOutline[]): PanelStory[] {
  void outline; // stories are seeded identically, so they stay coherent with any outline run
  const rng = mulberry32(seedFor(input));
  const ctx = buildCtx(input, rng);
  const tk = toneOf(input.tone);
  return BEATS.map((spec) => ({
    caption: pick(rng, spec.caption),
    narration: spec.narration[tk](ctx),
    dialogue: spec.dialogue[tk](ctx),
  }));
}

/** Comic title from the same seeded context. */
export function forgeTitle(input: ComicInput): string {
  const rng = mulberry32(seedFor(input) ^ 0x9e3779b9);
  const ctx = buildCtx(input, rng);
  const char = ctx.char;
  const options = [
    `${char} and ${cap(ctx.relic)}`,
    `${char} of ${cap(ctx.realm)}`,
    `The ${titleNoun(ctx)} Accord`,
    `${char} vs. ${cap(ctx.threat)}`,
    `A Map Through ${cap(ctx.realm)}`,
  ];
  return pick(rng, options);
}

function titleNoun(ctx: BeatCtx): string {
  const noun = ctx.realm.split(" ").pop() ?? "Wilds";
  return cap(noun);
}
