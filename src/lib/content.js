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

/* Pre-defined one-click colour themes, based on Google's most-used Material palette hues */
export const THEMES = [
  { id: "emerald", name: "Emerald", brand: "#10b981", brandDark: "#059669" },
  { id: "blue", name: "Google Blue", brand: "#2563eb", brandDark: "#1d4ed8" },
  { id: "indigo", name: "Indigo", brand: "#4f46e5", brandDark: "#4338ca" },
  { id: "teal", name: "Teal", brand: "#0d9488", brandDark: "#0f766e" },
  { id: "purple", name: "Deep Purple", brand: "#7c3aed", brandDark: "#6d28d9" },
  { id: "amber", name: "Amber", brand: "#f59e0b", brandDark: "#d97706" },
  { id: "rose", name: "Rose", brand: "#e11d48", brandDark: "#be123c" },
];

export const DEFAULT_CONTENT = {
  theme: "emerald",
  hero: {
    eyebrow: "BHARAT'S INTEROPERABLE NETWORK",
    headline: "Future-ready infrastructure for [India's EV transition.]",
    subheadline:
      "From navigating grid complexities to managing high-density 2W/3W fleets and premium 4W charging, SABHIVOLT delivers resilient hardware and intelligent CPO software designed specifically for the realities of the Indian market.",
    ctaPrimary: "Host a Charger",
    ctaSecondary: "Find Nearest Station",
  },
  stats: [
    { value: "480kW", label: "Max ultrafast charging speed" },
    { value: "100%", label: "UPI-native payments" },
    { value: "24/7", label: "Monitored network operations" },
  ],
  services: [
    {
      code: "TP-01",
      title: "Tech Parks & Offices",
      description:
        "Provide essential infrastructure for employees adopting electric 2-wheelers and cars. Our intelligent software handles dynamic load management to ensure facility grid stability without costly upgrades.",
      link: "Explore Workplace Solutions",
    },
    {
      code: "RW-02",
      title: "Residential Societies (RWA)",
      description:
        "Solve the charging anxiety for apartment residents. Our slow-charging AC nodes (3.3kW / 7.2kW) are perfect for overnight charging, with automated individual billing synced directly to resident maintenance apps.",
      link: "Explore RWA Solutions",
    },
    {
      code: "MR-03",
      title: "Malls & Retail Plazas",
      description:
        "Increase footfall and dwell time. Offer high-speed DC fast charging (30kW - 60kW+) to shoppers while they dine or shop. We guarantee >98% uptime to ensure a premium customer experience.",
      link: "Explore Retail Solutions",
    },
  ],
  flow: {
    eyebrow: "THE PARTNER MODEL",
    headline: "From site survey to payout — fully managed",
    body: "Once you partner with SABHIVOLT, our team takes care of everything end-to-end — installation, grid integration, live monitoring and automated UPI-based revenue share.",
    steps: [
      { title: "Site survey & design", text: "We assess your site's power capacity and footfall to design the right mix of AC, DC and Ultrafast chargers." },
      { title: "Installation & grid integration", text: "SABHIVOLT hardware goes in with dynamic load management, keeping your facility's grid stable without costly upgrades." },
      { title: "Smart operations & UPI billing", text: "Our CPO software monitors uptime 24/7 and handles every transaction — UPI, wallets and GST-compliant invoicing." },
      { title: "You earn, hands-free", text: "Revenue from every session is reconciled and shared automatically. No hardware to manage, no billing to chase." },
    ],
  },
  network: {
    eyebrow: "THE NETWORK",
    headline: "Expanding across the nation",
    body: "SABHIVOLT is rapidly deploying interoperable infrastructure across Tier-1 metros, regional corridors and state highways — so you never face range anxiety. The map updates as hubs come online.",
    specs: [
      {
        title: "SABHIVOLT DC Fast & Ultrafast",
        text: "30kW up to 480kW CCS2. Fully compliant with Indian standards — ideal for highway corridors and rapid intercity transit.",
      },
      {
        title: "SABHIVOLT AC Nodes",
        text: "3.3kW / 7.2kW. Ubiquitous charging, perfect for 2W/3W and overnight parking.",
      },
    ],
    locations: [
      { name: "Bengaluru Tech Park Hub", status: "Live network", detail: "60kW DC · 8 ports available", lat: "12.9716", lon: "77.5946" },
      { name: "Delhi NCR Metro Connect", status: "Live network", detail: "480kW Ultrafast · 6 ports available", lat: "28.7041", lon: "77.1025" },
      { name: "Mumbai BKC Fast Charge", status: "Live network", detail: "120kW DC · 4 ports available", lat: "19.0760", lon: "72.8777" },
      { name: "Pune Hinjewadi Node", status: "Live network", detail: "7.2kW AC · 12 ports available", lat: "18.5204", lon: "73.8567" },
      { name: "Chennai OMR Express", status: "Live network", detail: "480kW Ultrafast · 6 ports available", lat: "13.0827", lon: "80.2707" },
      { name: "Hyderabad HITEC City", status: "Live network", detail: "120kW DC · 8 ports available", lat: "17.3850", lon: "78.4867" },
      { name: "Ahmedabad Highway Station", status: "Live network", detail: "480kW Ultrafast · 4 ports available", lat: "23.0225", lon: "72.5714" },
      { name: "Gurugram Cyber City", status: "Live network", detail: "7.2kW AC · 15 ports available", lat: "28.4595", lon: "77.0266" },
    ],
  },
  about: {
    eyebrow: "INTEROPERABLE EXPERIENCE",
    headline: "Discover. Charge. Pay via UPI.",
    body: "The SABHIVOLT app makes public charging frictionless. Locate reliable stations, check live port availability, and pay instantly using PhonePe, GPay, or Paytm.",
    values: [
      {
        title: "Seamless UPI & native wallet integration",
        text: "Pay instantly with UPI, Paytm, PhonePe or your saved wallet — no new account needed.",
      },
      {
        title: "Real-time charger health & availability",
        text: "Live port availability and fault alerts mean you never arrive at a charger that's down.",
      },
      {
        title: "GST-compliant invoicing for fleets",
        text: "Every session generates a GST invoice automatically — ready for fleet expense reports.",
      },
    ],
  },
  contact: {
    eyebrow: "PARTNER WITH US",
    headline: "Have a site, fleet or investment in mind?",
    body: "Whether you want to host a charger at your property, electrify your fleet, or explore investment and CPO partnerships, send us an enquiry and we'll get back to you.",
    email: "hello@sabhivolt.com",
    phone: "",
    address: "Amaravati, Andhra Pradesh, India",
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
  if (n.includes("delhi") || n.includes("ncr")) return { lat: "28.7041", lon: "77.1025" };
  if (n.includes("bengaluru") || n.includes("bangalore")) return { lat: "12.9716", lon: "77.5946" };
  if (n.includes("mumbai")) return { lat: "19.0760", lon: "72.8777" };
  if (n.includes("chennai")) return { lat: "13.0827", lon: "80.2707" };
  if (n.includes("pune")) return { lat: "18.5204", lon: "73.8567" };
  if (n.includes("hyderabad")) return { lat: "17.3850", lon: "78.4867" };
  if (n.includes("ahmedabad")) return { lat: "23.0225", lon: "72.5714" };
  if (n.includes("kolkata")) return { lat: "22.5726", lon: "88.3639" };
  if (n.includes("mangalagiri")) return { lat: "16.4300", lon: "80.5500" };
  if (n.includes("amaravati")) return { lat: "16.5130", lon: "80.5165" };
  if (n.includes("vijayawada")) return { lat: "16.5062", lon: "80.6480" };
  if (n.includes("guntur")) return { lat: "16.3067", lon: "80.4365" };
  if (n.includes("visakhapatnam") || n.includes("vizag")) return { lat: "17.6868", lon: "83.2185" };
  if (n.includes("gurugram") || n.includes("gurgaon")) return { lat: "28.4595", lon: "77.0266" };
  return { lat: "21.1458", lon: "79.0882" };
}

/* Bring any older/partial saved content up to the current shape */
export function normalizeContent(saved) {
  const base = deepClone(DEFAULT_CONTENT);
  if (!saved || typeof saved !== "object") return base;
  const merged = { ...base, ...saved };
  if (!THEMES.some((t) => t.id === merged.theme)) merged.theme = base.theme;
  merged.flow = { ...base.flow, ...(saved.flow || {}) };
  if (!Array.isArray(merged.flow.steps) || merged.flow.steps.length !== 4) {
    merged.flow.steps = base.flow.steps;
  }
  merged.network = { ...base.network, ...(saved.network || {}) };
  if (!Array.isArray(merged.network.specs) || merged.network.specs.length !== 2) {
    merged.network.specs = base.network.specs;
  }
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
