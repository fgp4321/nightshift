import { CHARACTERS } from "./characters";
import { DISTRICTS } from "./districts";

export type DatabaseCategory = "characters" | "corporations" | "classified" | "districts" | "history" | "records";

export interface DatabaseRecord {
  id: string;
  category: DatabaseCategory;
  title: string;
  subtitle: string;
  meta: [label: string, value: string][];
  body: string[];
  /** Shown with a clearance banner; redactions are part of the fiction. */
  classified?: boolean;
}

export const CATEGORIES: { id: DatabaseCategory; label: string }[] = [
  { id: "characters", label: "Characters" },
  { id: "corporations", label: "Corporations" },
  { id: "classified", label: "Classified" },
  { id: "districts", label: "Districts" },
  { id: "history", label: "History" },
  { id: "records", label: "Records" },
];

const CORPORATIONS: DatabaseRecord[] = [
  {
    id: "corp-kv",
    category: "corporations",
    title: "Kestrel-Vance Conglomerate",
    subtitle: "Infrastructure, security, weather",
    meta: [["Founded", "2039"], ["Headquarters", "The Spire, D-01"], ["Employees", "412,000"]],
    body: [
      "Builder and landlord of the Corporate Sector. Holds the maintenance contract for the Central Grid and, through it, a quiet veto over everything that needs electricity.",
      "Slogan since 2060: \"We keep the lights on.\" The second half of the sentence was removed by legal.",
    ],
  },
  {
    id: "corp-neural",
    category: "corporations",
    title: "Neural Lease",
    subtitle: "Memory storage and rental",
    meta: [["Founded", "2052"], ["Product", "Recall-as-a-service"], ["Tax status", "0% memory tax"]],
    body: [
      "Stores what customers cannot afford to keep in their own heads and rents it back by the hour. Missed payments result in what the contract calls \"graceful forgetting\".",
    ],
  },
  {
    id: "corp-helix",
    category: "corporations",
    title: "Helix Credit",
    subtitle: "Consumer debt",
    meta: [["Founded", "2047"], ["Accounts", "7.9 million"], ["Approval rate", "100%"]],
    body: [
      "Every resident is pre-approved. Interest is calculated nightly, which is why the city's quietest hour is 03:59.",
    ],
  },
  {
    id: "corp-orbit",
    category: "corporations",
    title: "Orbit Foods",
    subtitle: "Orbit Noodle — open 24 hours",
    meta: [["Founded", "2044"], ["Outlets", "1,206"], ["Closing time", "None"]],
    body: [
      "The only brand trusted in every district, largely because it has never claimed to be good for anyone. Its neon is the unofficial street lighting of the Neon District.",
    ],
  },
];

const CLASSIFIED: DatabaseRecord[] = [
  {
    id: "cls-lantern",
    category: "classified",
    classified: true,
    title: "Project LANTERN",
    subtitle: "Clearance 4 — partial release",
    meta: [["Opened", "2069"], ["Owner", "Central Grid audit"], ["Status", "Unresolved"]],
    body: [
      "Investigation into a persistent ████ MW shortfall between power generated and power billed. The shortfall follows the closed transit levels and stops at ██████████.",
      "Recommendation: ████████████████. Rejected by the chair. Reason given: \"It is cheaper to be robbed politely.\"",
    ],
  },
  {
    id: "cls-887",
    category: "classified",
    classified: true,
    title: "Unauthorised signal 88.7",
    subtitle: "Clearance 3 — active trace",
    meta: [["First logged", "2072"], ["Origin", "Below map depth"], ["Traces attempted", "341"]],
    body: [
      "A broadcast carried on the Grid's own maintenance band. Each trace ends inside NIGHT//OS itself, which reports the signal as ███████ and then apologises.",
      "Operators are advised not to listen for longer than ██ minutes.",
    ],
  },
  {
    id: "cls-weather",
    category: "classified",
    classified: true,
    title: "Weather order 77-B",
    subtitle: "Clearance 2",
    meta: [["Issued", "2077"], ["Signed", "A. Vance"], ["Duration", "Indefinite"]],
    body: [
      "Rain over the Corporate Sector is scheduled, not forecast. Order 77-B extends the current schedule \"until street-level retail conversion exceeds ██%\".",
    ],
  },
];

const HISTORY: DatabaseRecord[] = [
  {
    id: "his-blackout",
    category: "history",
    title: "The Long Blackout",
    subtitle: "2041",
    meta: [["Duration", "11 days"], ["Cause", "Disputed"], ["Outcome", "Grid privatised"]],
    body: [
      "The old municipal grid failed for eleven days. The companies that restored it kept it. Residents remember the stars; the official history remembers the looting.",
    ],
  },
  {
    id: "his-charter",
    category: "history",
    title: "The Grid Charter",
    subtitle: "2058",
    meta: [["Signatories", "6 corporations"], ["Public vote", "Not held"], ["In force", "Yes"]],
    body: [
      "Placed power, data and identity under a single operating system. The charter promised the city would never sleep again and has kept that promise without exception.",
    ],
  },
  {
    id: "his-closures",
    category: "history",
    title: "The Sublevel Closures",
    subtitle: "2069",
    meta: [["Levels sealed", "9"], ["Residents relocated", "On paper"], ["Maps updated", "Deleted"]],
    body: [
      "Nine transit levels were declared unsafe and removed from every map. The trains stopped. The lights, according to the meters, did not.",
    ],
  },
];

const RECORDS: DatabaseRecord[] = [
  {
    id: "rec-transit",
    category: "records",
    title: "Transit log — Meridian Line",
    subtitle: "Automated entry",
    meta: [["Line", "Meridian"], ["Stations served", "14 of 23"], ["Delays", "Rain (scheduled)"]],
    body: [
      "Nine stations are listed as \"not in service\". Trains report slowing as they pass them anyway. Cause logged as passenger sentiment.",
    ],
  },
  {
    id: "rec-noise",
    category: "records",
    title: "Noise complaint #7,412",
    subtitle: "Filed from D-01, level 38",
    meta: [["Subject", "Bass, origin below"], ["Action", "None possible"], ["Complainant", "Withheld"]],
    body: [
      "\"There is music coming up through the foundations. It is not unpleasant. Please make it stop before I start to prefer it.\"",
    ],
  },
  {
    id: "rec-visitor",
    category: "records",
    title: "Visitor session",
    subtitle: "This terminal",
    meta: [["Access", "Terminal 01, D-01"], ["Clearance", "Guest"], ["Flag", "Curious"]],
    body: [
      "A guest session opened from the plaza terminal beneath the Spire. No credentials were presented. NIGHT//OS allowed it, which is not in its instructions.",
    ],
  },
];

const DISTRICT_RECORDS: DatabaseRecord[] = DISTRICTS.map((district) => ({
  id: `dst-${district.id}`,
  category: "districts",
  title: district.name,
  subtitle: district.code,
  meta: [["Code", district.code], ["Security", district.security]],
  body: [district.description],
}));

export const DATABASE: DatabaseRecord[] = [
  ...CHARACTERS,
  ...CORPORATIONS,
  ...CLASSIFIED,
  ...DISTRICT_RECORDS,
  ...HISTORY,
  ...RECORDS,
];
