import type { SceneId } from "./scenes";

export type AudioLayer = "rumble" | "rain" | "drone" | "hum" | "club";

export interface Station {
  id: string;
  name: string;
  band: string;
  description: string;
  /** Gain of each synthesised layer for this ambience. */
  mix: Record<AudioLayer, number>;
}

/** NIGHT RADIO ambiences. All synthesised in the browser — no recordings. */
export const STATIONS: Station[] = [
  {
    id: "city",
    name: "City Bed",
    band: "71.0",
    description: "Traffic far below, light rain, the hum of the Spire.",
    mix: { rumble: 0.5, rain: 0.03, drone: 0.05, hum: 0, club: 0 },
  },
  {
    id: "rain",
    name: "Rain Channel",
    band: "77.7",
    description: "Scheduled rainfall, uninterrupted.",
    mix: { rumble: 0.16, rain: 0.11, drone: 0.012, hum: 0, club: 0 },
  },
  {
    id: "industrial",
    name: "Industrial Hum",
    band: "50.0",
    description: "Transformers and foundry fans of the night shift.",
    mix: { rumble: 0.3, rain: 0, drone: 0.03, hum: 0.11, club: 0 },
  },
  {
    id: "sublevel",
    name: "Sublevel 9",
    band: "88.7",
    description: "A club system, heard through three floors of concrete.",
    mix: { rumble: 0.22, rain: 0, drone: 0.02, hum: 0.015, club: 0.55 },
  },
];

export const DEFAULT_STATION = STATIONS[0].id;

/** The ambience each world tunes to while NIGHT RADIO is on "follow the city". */
export const SCENE_STATION: Record<SceneId, string> = {
  city: "city",
  os: "industrial",
  underground: "sublevel",
  beyond: "rain",
};
