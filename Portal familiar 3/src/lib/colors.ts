export const MEMBER_COLORS = [
  "rose",
  "amber",
  "emerald",
  "sky",
  "violet",
  "orange",
  "teal",
  "indigo",
  "fuchsia",
  "pink",
] as const;

export type MemberColor = (typeof MEMBER_COLORS)[number];

interface ColorClassSet {
  bg: string;
  bgSoft: string;
  text: string;
  textSoft: string;
  border: string;
  ring: string;
  solid: string;
  gradient: string;
  dot: string;
}

export const colorClasses: Record<string, ColorClassSet> = {
  rose: {
    bg: "bg-rose-500",
    bgSoft: "bg-rose-100",
    text: "text-rose-700",
    textSoft: "text-rose-500",
    border: "border-rose-300",
    ring: "ring-rose-400",
    solid: "bg-rose-500 text-white",
    gradient: "from-rose-400 to-pink-500",
    dot: "bg-rose-500",
  },
  amber: {
    bg: "bg-amber-500",
    bgSoft: "bg-amber-100",
    text: "text-amber-700",
    textSoft: "text-amber-500",
    border: "border-amber-300",
    ring: "ring-amber-400",
    solid: "bg-amber-500 text-white",
    gradient: "from-amber-400 to-orange-500",
    dot: "bg-amber-500",
  },
  emerald: {
    bg: "bg-emerald-500",
    bgSoft: "bg-emerald-100",
    text: "text-emerald-700",
    textSoft: "text-emerald-500",
    border: "border-emerald-300",
    ring: "ring-emerald-400",
    solid: "bg-emerald-500 text-white",
    gradient: "from-emerald-400 to-teal-500",
    dot: "bg-emerald-500",
  },
  sky: {
    bg: "bg-sky-500",
    bgSoft: "bg-sky-100",
    text: "text-sky-700",
    textSoft: "text-sky-500",
    border: "border-sky-300",
    ring: "ring-sky-400",
    solid: "bg-sky-500 text-white",
    gradient: "from-sky-400 to-blue-500",
    dot: "bg-sky-500",
  },
  violet: {
    bg: "bg-violet-500",
    bgSoft: "bg-violet-100",
    text: "text-violet-700",
    textSoft: "text-violet-500",
    border: "border-violet-300",
    ring: "ring-violet-400",
    solid: "bg-violet-500 text-white",
    gradient: "from-violet-400 to-purple-500",
    dot: "bg-violet-500",
  },
  orange: {
    bg: "bg-orange-500",
    bgSoft: "bg-orange-100",
    text: "text-orange-700",
    textSoft: "text-orange-500",
    border: "border-orange-300",
    ring: "ring-orange-400",
    solid: "bg-orange-500 text-white",
    gradient: "from-orange-400 to-red-500",
    dot: "bg-orange-500",
  },
  teal: {
    bg: "bg-teal-500",
    bgSoft: "bg-teal-100",
    text: "text-teal-700",
    textSoft: "text-teal-500",
    border: "border-teal-300",
    ring: "ring-teal-400",
    solid: "bg-teal-500 text-white",
    gradient: "from-teal-400 to-cyan-500",
    dot: "bg-teal-500",
  },
  indigo: {
    bg: "bg-indigo-500",
    bgSoft: "bg-indigo-100",
    text: "text-indigo-700",
    textSoft: "text-indigo-500",
    border: "border-indigo-300",
    ring: "ring-indigo-400",
    solid: "bg-indigo-500 text-white",
    gradient: "from-indigo-400 to-blue-600",
    dot: "bg-indigo-500",
  },
  fuchsia: {
    bg: "bg-fuchsia-500",
    bgSoft: "bg-fuchsia-100",
    text: "text-fuchsia-700",
    textSoft: "text-fuchsia-500",
    border: "border-fuchsia-300",
    ring: "ring-fuchsia-400",
    solid: "bg-fuchsia-500 text-white",
    gradient: "from-fuchsia-400 to-pink-500",
    dot: "bg-fuchsia-500",
  },
  pink: {
    bg: "bg-pink-500",
    bgSoft: "bg-pink-100",
    text: "text-pink-700",
    textSoft: "text-pink-500",
    border: "border-pink-300",
    ring: "ring-pink-400",
    solid: "bg-pink-500 text-white",
    gradient: "from-pink-400 to-rose-500",
    dot: "bg-pink-500",
  },
};

export function getColorClasses(color: string | undefined): ColorClassSet {
  return colorClasses[color ?? "sky"] ?? colorClasses.sky;
}

export const EVENT_CATEGORY_COLORS: Record<string, string> = {
  familia: "rose",
  colegio: "sky",
  salud: "emerald",
  trabajo: "amber",
  ocio: "violet",
  otro: "teal",
};

export const NOTE_COLORS = [
  { key: "amber", bg: "bg-amber-200", border: "border-amber-300" },
  { key: "rose", bg: "bg-rose-200", border: "border-rose-300" },
  { key: "sky", bg: "bg-sky-200", border: "border-sky-300" },
  { key: "emerald", bg: "bg-emerald-200", border: "border-emerald-300" },
  { key: "violet", bg: "bg-violet-200", border: "border-violet-300" },
];
