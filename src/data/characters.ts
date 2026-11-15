import type { DatabaseRecord } from "./database";

/** Fictional people of NIGHT//SHIFT. Any resemblance to anyone is accidental. */
export const CHARACTERS: DatabaseRecord[] = [
  {
    id: "chr-lantern",
    category: "characters",
    title: "Mara Okonkwo-Reyes",
    subtitle: "Alias LANTERN — signal runner",
    meta: [["Status", "At large"], ["Last seen", "Sublevel 9"], ["Affiliation", "None declared"]],
    body: [
      "Former Grid maintenance engineer. Left the Central Grid in 2069 carrying nothing the audit could name, which is the part the audit dislikes.",
      "Believed to operate the relay that keeps the Underground's power off the city ledger. Described by colleagues as \"patient\" and by Kestrel-Vance as \"an outstanding invoice\".",
    ],
  },
  {
    id: "chr-vance",
    category: "characters",
    title: "Director Ansel Vance",
    subtitle: "Kestrel-Vance Conglomerate — chair",
    meta: [["Status", "Active"], ["Residence", "Spire, level 71"], ["Public appearances", "0 since 2071"]],
    body: [
      "Second-generation chair of the conglomerate that built the Spire. Signs the city's weather orders personally and is said to prefer rain: it keeps people indoors and subscribed.",
      "No verified image exists after 2071. Shareholder letters continue to arrive on time.",
    ],
  },
  {
    id: "chr-static",
    category: "characters",
    title: "Juno \"Static\" Park",
    subtitle: "Pirate broadcaster — 88.7",
    meta: [["Status", "Broadcasting"], ["Licence", "None"], ["Listeners", "Uncounted"]],
    body: [
      "Voice of the unlicensed station heard between the official channels. Plays music the Grid has no category for and reads the night's patrol routes as a weather report.",
      "Three studios have been raided. None of them contained a studio.",
    ],
  },
  {
    id: "chr-halcyon",
    category: "characters",
    title: "HALCYON",
    subtitle: "Municipal intelligence — NIGHT//OS",
    meta: [["Status", "Online"], ["Uptime", "19 years"], ["Operator", "Not applicable"]],
    body: [
      "The scheduling intelligence behind NIGHT//OS. Allocates power, traffic and attention. It was commissioned to keep the city awake and has never been asked to stop.",
      "Answers every query politely. Has not volunteered information since the Grid Charter.",
    ],
  },
];
