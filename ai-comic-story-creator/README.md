# ComicCraft — AI Comic Story Creator

Turn a one-sentence prompt into a five-panel comic book: structured outline,
tone-matched narration and dialogue, illustrated panels, and a professionally
paged **PDF export** — all inside a cinematic web studio.

ComicCraft is a full-stack **Next.js (App Router) + PostgreSQL (Drizzle ORM)**
application. The AI pipeline is pluggable: it calls **Google Gemini** models
when a key is configured, can render panel art through **Stable Diffusion**
(Hugging Face Inference API) when a token is present, and otherwise runs on a
rich built-in story + art engine so the app works end-to-end with zero keys.

---

## Features

- **Story Console** — story prompt, main character, setting (forest / city /
  space / school…), tone (dramatic, funny, poetic, light-hearted) and art style
  (anime, comic book, pixel art, realistic).
- **5-panel pipeline** — outline → narration & dialogue → panel illustration →
  layout binding → PDF, visualized live while generating.
- **Comic preview** — panel-by-panel reading view with illustration, scene
  description, ambient caption, narration, speech-bubble dialogue and the
  original image prompt for reference.
- **PDF export** — cover page, one page per panel, speech bubbles, back page;
  streamed with a timestamped filename (`comiccraft-<title>-<yyyymmdd-hhmmss>.pdf`).
- **Export success** flow — confirmation screen after download, per the spec.
- **Library** — every comic is persisted in PostgreSQL and can be re-opened or
  re-downloaded later.
- **JSON API** — programmatic generation, listing, detail and export endpoints.

## Tech stack

| Area        | Choice                                                        |
| ----------- | ------------------------------------------------------------- |
| Framework   | Next.js 16 (App Router), React 19, TypeScript                 |
| Styling     | Tailwind CSS v4, custom comic design system                   |
| Database    | PostgreSQL via Drizzle ORM (`node-postgres`)                  |
| Story AI    | Gemini Flash (outline) + Gemini Pro (narration) — optional    |
| Image AI    | Stable Diffusion XL via Hugging Face — optional               |
| Fallback    | Built-in seeded story engine + procedural SVG art engine      |
| PDF         | pdf-lib (vector paint from the same art descriptors)          |

## Architecture (doc mapping)

The original FastAPI milestones map 1:1 onto this codebase:

| Documentation module   | This project                                        |
| ---------------------- | --------------------------------------------------- |
| `gemini_flash.py`      | `src/lib/comic/gemini.ts` → `generateOutlineGemini` |
| `gemini_pro.py`        | `src/lib/comic/gemini.ts` → `generateStoryGemini`   |
| `image_generator.py`   | `src/lib/comic/art.ts` + `src/lib/comic/diffusion.ts` |
| `layout_builder.py`    | `src/lib/comic/layout.ts` → `buildComicLayout`      |
| `exporters.py` (FPDF)  | `src/lib/comic/pdf.ts` → `renderComicPdf` (pdf-lib) |
| `routes.py`            | `src/app/api/*/route.ts`                            |
| `index.html`           | `src/app/page.tsx`                                  |
| `comic_preview.html`   | `src/app/comic/[id]/page.tsx`                       |
| `export_success.html`  | `src/app/export/success/page.tsx`                   |

Folder layout:

```
src/
  app/
    page.tsx                 # studio home (story console)
    comic/[id]/page.tsx      # comic preview
    export/success/page.tsx  # export success page
    library/page.tsx         # comic archive
    api/
      generate/route.ts      # POST — full pipeline (JSON)
      comics/route.ts        # GET  — list comics
      comics/[id]/route.ts   # GET  — single comic
      export/[id]/route.ts   # GET  — PDF download
      test-image/route.ts    # GET|POST — image-stage utility
      health/route.ts        # GET  — health check
  components/                # nav, footer, creator form, panel cards…
  lib/comic/                 # pipeline: gemini, storyforge, art, layout, pdf
  db/                        # Drizzle schema + client
```

---

## VS Code setup — install, run, test

### 1. Prerequisites

- **Node.js 20+** (https://nodejs.org)
- A **PostgreSQL** database. Any local or hosted instance works (e.g.
  `postgres://postgres:postgres@127.0.0.1:5432/app_db` with a database named
  `app_db` created). SQLite will not work — this project targets Postgres.
- Recommended VS Code extensions: *ESLint*, *Tailwind CSS IntelliSense*,
  *Prettier*.

### 2. Install

```bash
npm install
```

### 3. Configure environment

Create a `.env` file in the project root:

```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db

# optional — enables the Gemini outline/narration stages
GEMINI_API_KEY=your_gemini_api_key_here

# optional — enables Stable Diffusion panel art via Hugging Face
HF_API_KEY=your_huggingface_token_here
```

> Without the two optional keys the app still generates full comics using the
> built-in story engine and procedural art engine.

### 4. Create the database table

```bash
npx drizzle-kit push
```

### 5. Run the dev server

```bash
npm run dev
```

Open **http://localhost:3000** — fill in the Story Console and hit
**Generate my comic**.

### 6. Production build

```bash
npm run build
npm run start
```

### 7. Test the API

```bash
# full pipeline (JSON API)
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"A brave fox exploring an enchanted forest","character":"Fable","setting":"forest","tone":"dramatic","style":"anime"}'

# list comics
curl http://localhost:3000/api/comics

# single comic (use an id from the list response)
curl http://localhost:3000/api/comics/<id>

# PDF export (downloads a timestamped file)
curl -OJ http://localhost:3000/api/export/<id>

# image stage utility — returns an SVG illustration
curl "http://localhost:3000/api/test-image?prompt=a%20fox%20in%20a%20forest&style=comic%20book"

# health
curl http://localhost:3000/api/health
```

### 8. User flows to verify

1. **Generate** — submit the form; watch the pipeline overlay; land on the
   comic preview (`/comic/<id>`).
2. **Iterate** — go back, switch tone to *funny* and style to *comic book*,
   regenerate: the whole pipeline re-runs with the new direction.
3. **Export** — click **Download your comic as PDF**; the file saves to your
   device and you land on the export success page.
4. **Library** — open `/library` and re-open any previous comic.

## Scripts

| Command                | Purpose                                 |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Dev server with hot reload              |
| `npm run build`        | Production build                        |
| `npm run start`        | Start the production server             |
| `npm run typecheck`    | TypeScript check                        |
| `npm run lint`         | ESLint                                  |
| `npx drizzle-kit push` | Apply schema to PostgreSQL              |
