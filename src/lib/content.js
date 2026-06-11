/* Default site content, content migration, and small shared helpers */

export const INTEREST_OPTIONS = [
  "Land / site partnership",
  "Fleet electrification",
  "Investment",
  "EV charging",
  "Solar / renewable project",
  "Advertising space",
  "Other",
];

export const DEFAULT_CONTENT = {
  hero: {
    eyebrow: "EV · SOLAR · STORAGE · MOBILITY",
    headline: "Energy infrastructure for India's [electric] decade",
    subheadline:
      "SABHIVOLT builds, owns and operates EV charging networks, solar plants and smart energy systems across Andhra Pradesh — starting from our home base in Mangalagiri.",
    ctaPrimary: "Partner with us",
    ctaSecondary: "Explore our verticals",
  },
  stats: [
    { value: "8", label: "Infrastructure verticals" },
    { value: "24/7", label: "Network operations" },
    { value: "AP", label: "Home state, national vision" },
  ],
  services: [
    {
      code: "EV-01",
      title: "EV Charging Infrastructure",
      flagship: true,
      description:
        "DC fast charging and AC destination charging networks — site selection, installation, operations and uptime management for highways, cities and fleets. This is the anchor of everything we build.",
    },
    {
      code: "RE-02",
      title: "Renewable Energy Projects",
      description:
        "End-to-end development of renewable generation assets, from land and approvals to commissioning and long-term asset management.",
    },
    {
      code: "SO-03",
      title: "Solar Infrastructure",
      description:
        "Rooftop, ground-mount and canopy solar systems that power our charging stations and deliver clean energy to commercial partners.",
    },
    {
      code: "HW-04",
      title: "Highway Amenities",
      description:
        "Charging-anchored rest stops with food, retail and restrooms — turning the wait into a destination on Andhra Pradesh's busiest corridors.",
    },
    {
      code: "BS-05",
      title: "Battery Storage",
      description:
        "Grid-scale and behind-the-meter battery systems that store solar energy, manage peak loads and keep chargers running on demand.",
    },
    {
      code: "SM-06",
      title: "Smart Mobility",
      description:
        "Fleet electrification support, charge-point software and data services that make electric movement seamless for operators and drivers.",
    },
    {
      code: "AD-07",
      title: "Advertising Infrastructure",
      description:
        "Digital screens and brand spaces at high-dwell charging locations — premium attention in the moments drivers actually stop.",
    },
    {
      code: "EM-08",
      title: "Energy Management Systems",
      description:
        "Monitoring, optimisation and control platforms that tie generation, storage and charging into one intelligent energy network.",
    },
  ],
  flow: {
    eyebrow: "THE MODEL",
    headline: "How the network pays for itself",
    body: "One site, four engines. Solar generates, storage banks it, charging sells it, and amenities and advertising monetise every minute a driver spends with us.",
    steps: [
      { title: "Solar generates", text: "Canopy and rooftop solar produce clean energy on site." },
      { title: "Storage banks it", text: "Batteries hold energy and smooth out grid demand." },
      { title: "Charging sells it", text: "Fast chargers deliver energy to vehicles at the kerb." },
      { title: "The stop earns", text: "Food, retail and ad screens monetise every dwell minute." },
    ],
  },
  network: {
    eyebrow: "THE NETWORK",
    headline: "Where we're building",
    body: "Our first corridor is home: the Vijayawada–Guntur–Mangalagiri belt, with expansion planned along NH-16 and key state highways. The map updates as sites move from identification to live.",
    locations: [
      { name: "Mangalagiri", status: "Headquarters", detail: "Operations base and pilot site", lat: "16.43", lon: "80.55" },
      { name: "Vijayawada–Guntur corridor", status: "In development", detail: "Site identification underway", lat: "16.34", lon: "80.40" },
      { name: "NH-16 expansion", status: "Planned", detail: "Highway charging + amenities", lat: "17.00", lon: "81.78" },
    ],
  },
  about: {
    eyebrow: "WHY SABHIVOLT EXISTS",
    headline: "Built where the grid meets the road",
    body: "India's EV transition will be won on its highways and in its towns — not just its metros. SABHIVOLT was founded in Mangalagiri, Andhra Pradesh, to build the charging, solar and storage backbone that this transition needs: infrastructure that is reliable, locally rooted and commercially sustainable. We don't just install equipment. We develop, operate and continuously improve energy assets as long-term owners.",
    values: [
      {
        title: "Uptime is everything",
        text: "A charger that doesn't work is worse than no charger. We engineer and operate for reliability first.",
      },
      {
        title: "Local roots, national standards",
        text: "We build in our own backyard with the quality and safety standards of a national operator.",
      },
      {
        title: "Energy that pays for itself",
        text: "Every project pairs clean generation with real revenue — charging, amenities, advertising and services.",
      },
    ],
  },
  contact: {
    eyebrow: "START A CONVERSATION",
    headline: "Land, fleets, capital or partnerships — let's talk",
    body: "Whether you own land on a highway corridor, run a vehicle fleet, or want to invest in energy infrastructure, send us an enquiry and we'll get back to you.",
    email: "hello@sabhivolt.com",
    phone: "+91 00000 00000",
    address: "Mangalagiri, Guntur District, Andhra Pradesh, India",
  },
};

export const deepClone = (o) =>
  typeof structuredClone === "function" ? structuredClone(o) : JSON.parse(JSON.stringify(o));

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function guessCoords(name = "") {
  const n = name.toLowerCase();
  if (n.includes("mangalagiri")) return { lat: "16.43", lon: "80.55" };
  if (n.includes("vijayawada") || n.includes("guntur")) return { lat: "16.34", lon: "80.40" };
  if (n.includes("nh-16") || n.includes("nh16")) return { lat: "17.00", lon: "81.78" };
  if (n.includes("visakhapatnam") || n.includes("vizag")) return { lat: "17.69", lon: "83.22" };
  if (n.includes("tirupati")) return { lat: "13.63", lon: "79.42" };
  if (n.includes("nellore")) return { lat: "14.44", lon: "79.99" };
  if (n.includes("kurnool")) return { lat: "15.83", lon: "78.04" };
  return { lat: "15.90", lon: "79.70" };
}

/* Bring any older/partial saved content up to the current shape */
export function normalizeContent(saved) {
  const base = deepClone(DEFAULT_CONTENT);
  if (!saved || typeof saved !== "object") return base;
  const merged = { ...base, ...saved };
  merged.flow = { ...base.flow, ...(saved.flow || {}) };
  if (!Array.isArray(merged.flow.steps) || merged.flow.steps.length !== 4) {
    merged.flow.steps = base.flow.steps;
  }
  merged.network = { ...base.network, ...(saved.network || {}) };
  merged.network.locations = (merged.network.locations || []).map((l) => {
    const g = guessCoords(l.name);
    return { lat: g.lat, lon: g.lon, ...l };
  });
  return merged;
}

export function statusColor(status = "") {
  const s = status.toLowerCase();
  if (s.includes("head") || s.includes("live")) return "#00D4AA";
  if (s.includes("develop")) return "#FFB930";
  return "#8AA89B";
}
