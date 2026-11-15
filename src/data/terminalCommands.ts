import { DISTRICTS } from "./districts";

export interface TerminalLine {
  text: string;
  tone?: "ok" | "warn" | "dim" | "accent";
  /** Milliseconds to wait before this line appears. */
  delay?: number;
}

export type OsAppId = "netrunner" | "database" | "map" | "radio";

export interface CommandContext {
  openApp: (id: OsAppId) => void;
}

interface Command {
  summary: string;
  run: (args: string[], context: CommandContext) => TerminalLine[];
}

const APPS: Record<string, OsAppId> = { database: "database", db: "database", map: "map", radio: "radio" };

/**
 * NETRUNNER is theatre: every response below is scripted fiction.
 * Nothing here contacts a network or inspects the visitor's device.
 */
export const COMMANDS: Record<string, Command> = {
  help: {
    summary: "List available commands",
    run: () => [
      { text: "AVAILABLE COMMANDS", tone: "accent" },
      ...Object.entries(COMMANDS).map(([name, command]) => ({ text: `  ${name.padEnd(10)} ${command.summary}` })),
      { text: "Tip: ↑ and ↓ recall previous commands.", tone: "dim" },
    ],
  },
  scan: {
    summary: "Run a simulated sweep of the local grid",
    run: () => [
      { text: "SIMULATED SWEEP — fiction only, no real network is touched.", tone: "dim" },
      { text: "sweeping sector D-01 ......", delay: 350 },
      { text: "[#####               ]  25%   412 nodes", delay: 420 },
      { text: "[##########          ]  50%   1,906 nodes", delay: 420 },
      { text: "[###############     ]  75%   3,388 nodes", delay: 420 },
      { text: "[####################] 100%   4,217 nodes", delay: 420 },
      { text: "4,216 nodes registered to NIGHT//OS.", tone: "ok", delay: 300 },
      { text: "1 node unregistered — carrier 88.7, origin below map depth.", tone: "warn", delay: 500 },
    ],
  },
  city: {
    summary: "City overview",
    run: () => [
      { text: "NIGHT//SHIFT — MUNICIPAL SUMMARY", tone: "accent" },
      { text: "  year            2077" },
      { text: "  population      8,420,000" },
      { text: "  districts       5 (4 mapped)" },
      { text: "  operator        HALCYON // NIGHT//OS 7.7" },
      { text: "  last sunrise    not scheduled", tone: "dim" },
    ],
  },
  districts: {
    summary: "List districts and security status",
    run: () => [
      { text: "CODE    DISTRICT            SECURITY", tone: "accent" },
      ...DISTRICTS.map((d) => ({
        text: `${d.code.padEnd(7)} ${d.name.padEnd(19)} ${d.security.toUpperCase()}`,
        tone: d.security === "Unmonitored" ? ("warn" as const) : undefined,
      })),
      { text: "Run `open map` for the schematic.", tone: "dim" },
    ],
  },
  network: {
    summary: "Network status",
    run: () => [
      { text: "NETWORK STATUS: ONLINE", tone: "ok" },
      { text: "  uplink          Central Grid, sealed core" },
      { text: "  latency         0.4 ms (in-world figure)" },
      { text: "  open sessions   1 guest (you)" },
      { text: "  anomalies       1 unauthorised carrier on the maintenance band", tone: "warn" },
    ],
  },
  security: {
    summary: "Security posture",
    run: () => [
      { text: "SECURITY PROTOCOL: ACTIVE", tone: "ok" },
      { text: "  D-01 Corporate Sector    HIGH" },
      { text: "  D-00 Central Grid        MAXIMUM" },
      { text: "  your clearance           GUEST" },
      { text: "  note: guest sessions are not supposed to reach this prompt.", tone: "dim" },
    ],
  },
  about: {
    summary: "About this terminal",
    run: () => [
      { text: "NETRUNNER 3.1 — part of NIGHT//OS", tone: "accent" },
      { text: "An interactive fiction terminal. Every command returns scripted" },
      { text: "story content. It does not connect to, scan or access any real" },
      { text: "system, and it reads nothing from your device." },
    ],
  },
  open: {
    summary: "Open an app: database, map, radio",
    run: (args, context) => {
      const app = APPS[args[0] ?? ""];
      if (!app) return [{ text: "usage: open <database|map|radio>", tone: "warn" }];
      context.openApp(app);
      return [{ text: `opening ${args[0]} …`, tone: "ok" }];
    },
  },
  clear: {
    summary: "Clear the screen",
    run: () => [],
  },
};

export const WELCOME: TerminalLine[] = [
  { text: "NETRUNNER 3.1 — guest session", tone: "accent" },
  { text: "Simulated terminal. Type `help` to list commands.", tone: "dim" },
];

/** Returns the lines to print, or "clear" for the clear command. */
export function execute(input: string, context: CommandContext): TerminalLine[] | "clear" {
  const [name, ...args] = input.trim().toLowerCase().split(/\s+/);
  if (!name) return [];
  if (name === "clear") return "clear";
  const command = COMMANDS[name];
  if (!command) {
    return [{ text: `command not found: ${name} — type \`help\``, tone: "warn" }];
  }
  return command.run(args, context);
}
