/**
 * ComicCraft diffusion backend  (image_generator.py)
 * -------------------------------------------------
 * Optional Stable Diffusion image generation via the Hugging Face Inference
 * API. Enabled only when HF_API_KEY is configured. Any failure returns null so
 * the pipeline silently falls back to the built-in SVG art engine — the app
 * never hard-depends on external image services.
 */
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { slugify } from "../utils";

const MODEL = "stabilityai/stable-diffusion-xl-base-1.0";

export function diffusionEnabled(): boolean {
  const key = process.env.HF_API_KEY;
  return Boolean(key && key.trim().length > 0);
}

/**
 * Generate one PNG illustration for `prompt` and store it under
 * public/panels/<fileStem>.png. Returns the public URL path, or null.
 */
export async function generateDiffusionImage(prompt: string, fileStem: string): Promise<string | null> {
  const key = process.env.HF_API_KEY?.trim();
  if (!key) return null;

  try {
    const res = await fetch(`https://router.huggingface.co/hf-inference/models/${MODEL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Accept: "image/png",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { width: 1024, height: 768, num_inference_steps: 28 },
      }),
      signal: AbortSignal.timeout(90_000),
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type") ?? "";
    if (!res.ok || !contentType.includes("image")) return null;

    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length < 10_000) return null; // error pages / placeholders

    const safeStem = slugify(fileStem) || "panel";
    const dir = path.join(process.cwd(), "public", "panels");
    await mkdir(dir, { recursive: true });
    const fileName = `${safeStem}.png`;
    await writeFile(path.join(dir, fileName), bytes);
    return `/panels/${fileName}`;
  } catch {
    return null;
  }
}
