/* Default site content, content migration, and small shared helpers */

export const INTEREST_OPTIONS = [
  "Host a charger (property / mall / highway)",
  "Residential society (RWA)",
  "Fleet electrification / depot charging",
  "CPO / charge-point software",
  "Investment / partnership",
  "Advertising at charging hubs",
  "Driver support",
  "Other",
];

export const DEFAULT_CONTENT = {
  hero: {
    badge: "Bharat's interoperable EV network",
    headline: "Intelligent charging infrastructure for India's [scale]",
    subheadline:
      "From local grid complexities to high-density 2W/3W fleets and 480kW ultrafast 4W charging — SABHIVOLT delivers resilient hardware and native CPO software built for the realities of the Indian market.",
    ctaPrimary: "Host a charger",
    ctaSecondary: "Explore network",
    trust: ["100% UPI native", "480kW ultrafast ready", "OCPP 2.0 compliant"],
  },
  dashboard: {
    node: "Mangalagiri Metro Node",
    status: "Grid stable",
    revenueLabel: "Daily revenue (INR)",
    revenue: "₹42,850",
    revenueDelta: "+14%",
    portsLabel: "Active dispensing",
    portsActive: "8",
    portsTotal: "12",
    loadCap: "1.2 MW cap",
  },
  stats: [
    { value: "8", label: "Infrastructure verticals" },
    { value: "99.5%", label: "Network uptime target" },
    { value: "480", label: "kW ultrafast ready" },
    { value: "24/7", label: "Remote operations" },
  ],
  partners: ["Prestige Group", "BluSmart", "Phoenix Malls", "Amazon Logistics"],
  solutions: {
    eyebrow: "COMMERCIAL SOLUTIONS",
    headline: "Turn your location into a revenue engine",
    body: "Partner with SABHIVOLT to install resilient EV charging at your site. We handle hardware, smart grid management and automated UPI reconciliation. You simply earn.",
    items: [
      {
        icon: "briefcase",
        title: "Tech parks & offices",
        description:
          "Essential infrastructure for employees adopting electric 2-wheelers and cars. Intelligent dynamic load management keeps your facility grid stable without costly upgrades.",
        cta: "Explore workplace setup",
        highlight: false,
      },
      {
        icon: "home",
        title: "Residential societies (RWA)",
        description:
          "Solve charging anxiety for apartment residents. AC nodes (3.3kW / 7.2kW) are ideal for overnight charging, with automated individual billing synced to resident apps.",
        cta: "Explore RWA solutions",
        highlight: false,
      },
      {
        icon: "store",
        title: "Highway plazas & malls",
        description:
          "Drive footfall with SABHIVOLT Ultrafast. Offer up to 480kW DC fast charging to travellers and shoppers, with a >99% uptime guarantee for a premium experience.",
        cta: "Explore commercial fast charging",
        highlight: true,
      },
    ],
  },
  network: {
    eyebrow: "THE NETWORK",
    headline: "Expanding across the nation's arteries",
    body: "Rapidly deploying interoperable infrastructure across metros, regional corridors and state highways — starting from our home base in Mangalagiri, Andhra Pradesh — to eliminate range anxiety.",
    chargerTypes: [
      {
        icon: "zap",
        title: "DC fast & ultrafast",
        description:
          "30kW up to an industry-leading 480kW CCS2. Fully compliant with Indian standards, ideal for rapid intercity transit.",
      },
      {
        icon: "plug",
        title: "AC & LEV nodes",
        description:
          "3.3kW / 7.2kW / 22kW. Ubiquitous charging perfect for 2W/3W fleets, workplaces and overnight parking.",
      },
    ],
    locations: [
      {
        name: "Mangalagiri",
        status: "Headquarters",
        detail: "Operations base and pilot site",
        lat: "16.43",
        lon: "80.55",
        speed: "120kW DC",
        ports: 8,
      },
      {
        name: "Vijayawada–Guntur corridor",
        status: "In development",
        detail: "Site identification underway",
        lat: "16.34",
        lon: "80.40",
        speed: "60kW DC",
        ports: 6,
      },
      {
        name: "Hyderabad HITEC City",
        status: "Planned",
        detail: "Workplace + commercial hub",
        lat: "17.385",
        lon: "78.4867",
        speed: "60kW DC",
        ports: 8,
      },
      {
        name: "Bengaluru ORR",
        status: "Planned",
        detail: "Tech corridor fast hub",
        lat: "12.9716",
        lon: "77.5946",
        speed: "120kW DC",
        ports: 12,
      },
      {
        name: "Chennai highway express",
        status: "Planned",
        detail: "NH ultrafast corridor",
        lat: "13.0827",
        lon: "80.2707",
        speed: "480kW ultrafast",
        ports: 4,
      },
    ],
  },
  driver: {
    badge: "Interoperable experience",
    headline: "Discover. Charge. Pay via UPI.",
    body: "The SABHIVOLT app makes public charging frictionless — locate reliable stations, check live port availability, and pay instantly.",
    features: [
      "Seamless UPI & native wallets",
      "Real-time charger health alerts",
      "GST-compliant invoicing for fleets",
    ],
  },
  about: {
    eyebrow: "WHY SABHIVOLT EXISTS",
    headline: "Built where the grid meets the road",
    body: "India's EV transition will be won on its highways and in its towns — not just its metros. SABHIVOLT was founded in Mangalagiri, Andhra Pradesh, to build the charging, solar and storage backbone this transition needs: reliable, locally rooted and commercially sustainable. We don't just install equipment — we develop, operate and continuously improve energy assets as long-term owners.",
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
    eyebrow: "CONTACT SALES",
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

let idCounter = 0;
/** Stable-ish id for list keys (content is small and edited rarely). */
export const genId = () =>
  `id-${Date.now().toString(36)}-${(idCounter++).toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

/** Recursively fill missing keys from `base`; arrays are taken wholesale from `saved` when present. */
export function deepMerge(base, saved) {
  if (!isObject(base)) return saved === undefined ? base : saved;
  if (!isObject(saved)) return deepClone(base);
  const out = {};
  for (const key of new Set([...Object.keys(base), ...Object.keys(saved)])) {
    if (isObject(base[key])) out[key] = deepMerge(base[key], saved[key]);
    else out[key] = saved[key] === undefined ? deepClone(base[key]) : saved[key];
  }
  return out;
}

export function guessCoords(name = "") {
  const n = name.toLowerCase();
  if (n.includes("mangalagiri")) return { lat: "16.43", lon: "80.55" };
  if (n.includes("vijayawada") || n.includes("guntur")) return { lat: "16.34", lon: "80.40" };
  if (n.includes("nh-16") || n.includes("nh16")) return { lat: "17.00", lon: "81.78" };
  if (n.includes("visakhapatnam") || n.includes("vizag")) return { lat: "17.69", lon: "83.22" };
  if (n.includes("hyderabad") || n.includes("hitec")) return { lat: "17.385", lon: "78.4867" };
  if (n.includes("bengaluru") || n.includes("bangalore")) return { lat: "12.9716", lon: "77.5946" };
  if (n.includes("chennai")) return { lat: "13.0827", lon: "80.2707" };
  if (n.includes("tirupati")) return { lat: "13.63", lon: "79.42" };
  if (n.includes("nellore")) return { lat: "14.44", lon: "79.99" };
  if (n.includes("kurnool")) return { lat: "15.83", lon: "78.04" };
  return { lat: "15.90", lon: "79.70" };
}

/* Bring any older/partial saved content up to the current shape */
export function normalizeContent(saved) {
  if (!saved || typeof saved !== "object") return deepClone(DEFAULT_CONTENT);
  const merged = deepMerge(DEFAULT_CONTENT, saved);
  merged.network.locations = (merged.network.locations || []).map((l) => {
    const g = guessCoords(l.name);
    return { lat: g.lat, lon: g.lon, ...l };
  });
  return merged;
}

export function statusColor(status = "") {
  const s = status.toLowerCase();
  if (s.includes("head") || s.includes("live")) return "#10b981";
  if (s.includes("develop")) return "#f59e0b";
  return "#94a3b8";
}
