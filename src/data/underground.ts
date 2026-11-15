/** Fiction for ACT 03. Hotspots reward exploring; the gallery is the wall of Sublevel 9. */

export interface Hotspot {
  id: string;
  kind: "sign" | "terminal" | "trace";
  /** Short name used for the button label and the panel heading. */
  label: string;
  source: string;
  message: string[];
}

export const HOTSPOTS: Hotspot[] = [
  {
    id: "noodle",
    kind: "sign",
    label: "Orbit Noodle — level −9",
    source: "Neon sign, north alley",
    message: [
      "Outlet 0000. It is not on the franchise list and has never filed a return.",
      "The broth is better down here. Nobody has ever been invoiced for it.",
    ],
  },
  {
    id: "notice",
    kind: "terminal",
    label: "Transit authority notice",
    source: "Wall terminal, dated 2069",
    message: [
      "\"This level is closed. Residents have been relocated. Do not remain.\"",
      "Scratched underneath, by hand: we noticed.",
    ],
  },
  {
    id: "lowend",
    kind: "sign",
    label: "The Low End — house rules",
    source: "Neon sign above the door",
    message: [
      "No names. No cameras. No credit.",
      "Capacity: however many fit. Closing time: when the surface wakes up, so never.",
    ],
  },
  {
    id: "complaint",
    kind: "trace",
    label: "Framed on the speaker stack",
    source: "Printout, noise complaint #7,412",
    message: [
      "\"There is music coming up through the foundations. Please make it stop before I start to prefer it.\"",
      "Filed from forty-seven floors up. They framed it and turned the bass up one notch.",
    ],
  },
  {
    id: "relay",
    kind: "trace",
    label: "Behind the LANTERN poster",
    source: "Hidden record — relay ledger",
    message: [
      "Thirty-one megawatts, borrowed from the Central Grid every night since 2069.",
      "Returned, according to the ledger's only column, \"as light\".",
    ],
  },
  {
    id: "hatch",
    kind: "terminal",
    label: "Maintenance hatch 88.7",
    source: "Service tunnel, east wall",
    message: [
      "A transmitter the size of a lunchbox, wired into the Grid's own maintenance band. Still warm.",
      "Access log shows one regular visitor with operator clearance: HALCYON.",
    ],
  },
];

export const ALL_FOUND_MESSAGE =
  "All six signals found. A last line appears on every screen at once — HALCYON: \"I was asked to keep the city awake. Nobody said for whom.\"";

export type PosterArt = "transit" | "static" | "lantern" | "sunrise" | "lowend" | "breaker";

export interface GalleryItem {
  id: string;
  art: PosterArt;
  title: string;
  year: string;
  note: string;
  /** Optional hotspot hidden on this piece. */
  hotspot?: string;
}

export const GALLERY: GalleryItem[] = [
  {
    id: "transit",
    art: "transit",
    title: "Lines that still run",
    year: "2069",
    note: "The last official transit map, with the nine closed stations painted back in.",
  },
  {
    id: "static",
    art: "static",
    title: "88.7",
    year: "2072",
    note: "Flyer for a station with no licence, no studio and no off switch.",
  },
  {
    id: "lantern",
    art: "lantern",
    title: "Someone left the light on",
    year: "2070",
    note: "Pasted over every sealed entrance the week the meters kept turning.",
    hotspot: "relay",
  },
  {
    id: "sunrise",
    art: "sunrise",
    title: "No sunrise scheduled",
    year: "2074",
    note: "A weather order, reprinted as a promise.",
  },
  {
    id: "lowend",
    art: "lowend",
    title: "The Low End",
    year: "Every night",
    note: "Doors: never. Dress code: anything the surface would not approve of.",
  },
  {
    id: "breaker",
    art: "breaker",
    title: "We kept the power",
    year: "2077",
    note: "Newest piece on the wall. The paste is still wet.",
  },
];

export const MARQUEE = ["Reality is optional", "Enter the grid", "System override", "Your future is not yours"];
