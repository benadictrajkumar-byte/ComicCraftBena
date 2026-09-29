import { renderPanelSVG } from "@/lib/comic/art";
import type { SceneArt } from "@/lib/comic/types";

/** Small SVG cover rendered from a comic's first panel art. */
export default function MiniCover({ art }: { art: SceneArt }) {
  if (art.png) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={art.png} alt="Comic cover" className="h-full w-full object-cover" />;
  }
  return (
    <div
      className="art-frame aspect-[4/3] w-full"
      dangerouslySetInnerHTML={{ __html: renderPanelSVG(art, { idPrefix: `c${art.seed.toString(36)}` }) }}
    />
  );
}
