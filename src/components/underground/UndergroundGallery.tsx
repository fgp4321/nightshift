import { GALLERY } from "@/data/underground";
import { Poster } from "./GalleryPosters";
import { Hotspot } from "./NeonHotspots";

/**
 * The wall of Sublevel 9: a horizontal strip the visitor walks along.
 * Motion is applied from undergroundAnimations.ts via the data attributes.
 */
export function UndergroundGallery() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#070509]">
      <div className="absolute inset-x-0 top-[calc(var(--hud-h)+var(--hud-pad)*1.5)] h-px bg-ns-magenta/40" aria-hidden />
      <div
        data-ug="track"
        className="absolute inset-y-0 left-0 flex w-max items-center gap-[7vw] px-[10vw] pb-[calc(var(--hud-h)+var(--hud-pad)*2)] pt-[calc(var(--hud-h)+var(--hud-pad)*2)] will-change-transform"
      >
        <header className="w-[72vw] shrink-0 sm:w-[38vw] lg:w-[26vw]">
          <p className="ns-label text-accent">The wall — sublevel 9</p>
          <h2 className="ns-monument ns-chroma mt-3 text-[length:var(--text-hero)] text-ns-white">What the surface threw away</h2>
          <p className="mt-5 max-w-[32ch] text-base leading-relaxed text-ns-white/80">
            Nine years of posters, pasted over sealed doors. Keep going <span aria-hidden>→</span>
          </p>
        </header>

        {GALLERY.map((item, index) => (
          <figure key={item.id} className="w-[min(40svh,74vw)] shrink-0">
            <div className="relative">
              <div data-ug="poster" className="aspect-[4/5] w-full overflow-hidden border border-ns-white/10">
                <div data-ug="poster-art" className="size-full">
                  <Poster art={item.art} title={item.title} />
                </div>
              </div>
              {item.hotspot && <Hotspot id={item.hotspot} className="absolute -bottom-3 -right-3" />}
            </div>
            <figcaption className="mt-4 flex min-h-[8.5rem] items-baseline gap-4">
              <span className="ns-label shrink-0 text-accent">{String(index + 1).padStart(2, "0")}</span>
              <span>
                <span className="ns-monument block text-2xl text-ns-white">{item.title}</span>
                <span className="ns-label mt-1 block text-ns-gray">{item.year}</span>
                <span className="mt-2 block max-w-[34ch] text-sm leading-relaxed text-ns-white/75">{item.note}</span>
              </span>
            </figcaption>
          </figure>
        ))}

        <p className="ns-monument w-[60vw] shrink-0 text-[length:var(--text-hero)] text-ns-white/15 sm:w-[30vw]" aria-hidden>
          End of wall
        </p>
      </div>
    </div>
  );
}
