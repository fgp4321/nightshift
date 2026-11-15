export type SecurityLevel = "Maximum" | "High" | "Moderate" | "Low" | "Unmonitored";

export interface District {
  id: string;
  name: string;
  code: string;
  security: SecurityLevel;
  description: string;
  /** Polygon points in the 400×300 schematic of the CITY MAP app. */
  shape: string;
  /** Label anchor in the same coordinate space. */
  label: [number, number];
}

/** Fictional districts of NIGHT//SHIFT. */
export const DISTRICTS: District[] = [
  {
    id: "corporate",
    name: "Corporate Sector",
    code: "D-01",
    security: "High",
    description:
      "Glass, patents and private airspace. Kestrel-Vance owns the skyline here and leases the weather beneath it. Nothing is illegal above level 40 — it is simply billed.",
    shape: "70,24 330,24 290,112 110,112",
    label: [200, 70],
  },
  {
    id: "industrial",
    name: "Industrial Zone",
    code: "D-02",
    security: "Moderate",
    description:
      "Foundries and desalination stacks that never cool. The night shift here is the only shift; the day one was automated in 2058. Patrols are drones, and the drones are tired.",
    shape: "300,122 344,34 384,62 384,250 300,196",
    label: [346, 150],
  },
  {
    id: "neon",
    name: "Neon District",
    code: "D-03",
    security: "Low",
    description:
      "Markets, arcades and noodle bars stacked nine storeys deep. Every sign is an advert and every advert is listening. Security is present mostly as a subscription offer.",
    shape: "16,62 56,34 100,122 100,196 16,250",
    label: [56, 150],
  },
  {
    id: "central",
    name: "Central Grid",
    code: "D-00",
    security: "Maximum",
    description:
      "The city's nervous system: power, data and identity, routed through a single sealed core. NIGHT//OS runs from here. Visitors are not refused entry; they are simply never found.",
    shape: "200,122 262,141 262,190 200,210 138,190 138,141",
    label: [200, 168],
  },
  {
    id: "underground",
    name: "Underground",
    code: "SUB-9",
    security: "Unmonitored",
    description:
      "Closed transit levels the Grid stopped mapping in 2069. Officially empty. Unofficially it has its own power, its own radio and a great deal of opinions about the surface.",
    shape: "24,262 104,208 200,224 296,208 376,262 200,290",
    label: [200, 256],
  },
];
