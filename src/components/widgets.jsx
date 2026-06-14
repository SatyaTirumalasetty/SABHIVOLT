import React, { useState, useEffect, useRef } from "react";
import {
  Zap,
  PlugZap,
  Briefcase,
  Home,
  Store,
  ArrowRight,
  Check,
  ShieldCheck,
  Smartphone,
  Server,
  CarFront,
  QrCode,
  Building2,
  Car,
  Truck,
  ShoppingBag,
  Globe,
  Share2,
  Mail,
  Play,
  Apple,
} from "lucide-react";
import { prefersReducedMotion, statusColor } from "../lib/content";
import { useDialogA11y } from "../lib/a11y";

/* ── icon registry ────────────────────────────────────── */
const ICONS = {
  zap: Zap,
  plug: PlugZap,
  briefcase: Briefcase,
  home: Home,
  store: Store,
  building: Building2,
  car: Car,
  truck: Truck,
  bag: ShoppingBag,
};
export function Icon({ name, ...props }) {
  const C = ICONS[name] || Zap;
  return <C {...props} />;
}

/* ── text helpers ─────────────────────────────────────── */

/** Render "[word]" segments as a gradient highlight */
export function Highlight({ text }) {
  const parts = String(text).split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("[") && p.endsWith("]") ? (
          <em key={i} className="sv-gradient">
            {p.slice(1, -1)}
          </em>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        )
      )}
    </>
  );
}

export function Field({ label, value, onChange, textarea, id, type, inputMode }) {
  return (
    <div className="sv-field">
      <label htmlFor={id}>{label}</label>
      {textarea ? (
        <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input
          id={id}
          type={type || "text"}
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

/* ── count-up stat ────────────────────────────────────── */

export function CountStat({ value, label }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const match = String(value).match(/^(\d+(?:\.\d+)?)(.*)$/);
    if (!match || prefersReducedMotion()) {
      setDisplay(value);
      return;
    }
    const target = parseFloat(match[1]);
    const suffix = match[2];
    const decimals = match[1].includes(".") ? match[1].split(".")[1].length : 0;
    setDisplay("0" + suffix);

    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const dur = 1300;
        const tick = (now) => {
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay((target * eased).toFixed(decimals) + suffix);
          if (t < 1) raf = requestAnimationFrame(tick);
          else setDisplay(value);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <div className="sv-stat" ref={ref}>
      <b>{display}</b>
      <span>{label}</span>
    </div>
  );
}

/* ── command-center dashboard mockup ──────────────────── */

const BAR_HEIGHTS = [30, 45, 60, 85, 95, 70, 80, 50];

export function CommandCenter({ data }) {
  return (
    <div className="sv-dash">
      <div className="sv-dash-bar">
        <div className="sv-dash-dots">
          <span />
          <span />
          <span />
        </div>
        <div className="sv-dash-title">SABHIVOLT Command Center</div>
        <div style={{ width: 40 }} />
      </div>
      <div className="sv-dash-body">
        <div className="sv-dash-head">
          <div>
            <p className="label">Live hub status</p>
            <h3>{data.node}</h3>
          </div>
          <span className="sv-dash-status">
            <span className="live" />
            {data.status}
          </span>
        </div>

        <div className="sv-dash-metrics">
          <div className="sv-dash-metric">
            <p className="k">{data.revenueLabel}</p>
            <p className="v">
              <b>{data.revenue}</b>
              <span className="delta">{data.revenueDelta}</span>
            </p>
          </div>
          <div className="sv-dash-metric">
            <p className="k">{data.portsLabel}</p>
            <p className="v">
              <b>{data.portsActive}</b>
              <span className="sub">/ {data.portsTotal} ports</span>
            </p>
          </div>
        </div>

        <div className="sv-dash-graph">
          <div className="top">
            <p className="k">Dynamic load management</p>
            <p className="cap">{data.loadCap}</p>
          </div>
          <div className="sv-dash-bars" aria-hidden="true">
            {BAR_HEIGHTS.map((h, i) => (
              <i key={i} style={{ height: `${h}%`, opacity: 0.25 + (h / 100) * 0.75 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── India network map (Leaflet, loaded lazily) ───────── */

export function IndiaMap({ locations }) {
  const ref = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !ref.current || mapRef.current) return;

      const map = L.map(ref.current, { scrollWheelZoom: false, zoomControl: false }).setView(
        [19.5, 79],
        4.4
      );
      L.control.zoom({ position: "topright" }).addTo(map);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap &copy; CARTO",
      }).addTo(map);
      mapRef.current = map;

      const pts = [];
      locations.forEach((loc) => {
        const lat = parseFloat(loc.lat);
        const lon = parseFloat(loc.lon);
        if (Number.isNaN(lat) || Number.isNaN(lon)) return;
        const color = statusColor(loc.status);
        const icon = L.divIcon({
          className: "",
          html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:3px solid #fff;box-shadow:0 4px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12],
        });
        const speed = loc.speed ? String(loc.speed) : "";
        const fast = speed.toLowerCase().includes("ultra") || speed.includes("480");
        const badgeStyle = fast
          ? "background:#ecfdf5;color:#047857;border-color:#a7f3d0"
          : "background:#f1f5f9;color:#334155;border-color:#e2e8f0";
        L.marker([lat, lon], { icon })
          .addTo(map)
          .bindPopup(
            `<div class="sv-pop"><h5>${esc(loc.name)}</h5><div class="meta">${esc(loc.detail || "")}</div>` +
              (speed
                ? `<span class="badge" style="${badgeStyle}">${esc(speed)}${loc.ports ? ` · ${loc.ports} ports` : ""}</span>`
                : "") +
              `</div>`
          );
        pts.push([lat, lon]);
      });
      if (pts.length > 1) map.fitBounds(pts, { padding: [40, 40], maxZoom: 6 });
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [locations]);

  return (
    <div
      className="sv-map"
      ref={ref}
      role="img"
      aria-label="Map of SABHIVOLT charging locations across India"
    />
  );
}

function esc(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

/* ── driver app phone mockup ──────────────────────────── */

export function PhoneMockup() {
  return (
    <div className="sv-phone-wrap">
      <div className="sv-phone" aria-hidden="true">
        <div className="notch" />
        <div className="sv-phone-head">
          <div>
            <p className="label">Welcome back</p>
            <h3>Arjun M.</h3>
          </div>
          <div className="sv-phone-wallet">
            <p className="label">Wallet</p>
            <p className="v">₹650.00</p>
          </div>
        </div>
        <div className="sv-phone-body">
          <div className="sv-phone-veh">
            <div>
              <p className="k">Vehicle selected</p>
              <h4>Tata Nexon EV Max</h4>
            </div>
            <span className="ic">
              <CarFront size={16} />
            </span>
          </div>
          <div className="sv-phone-hub">
            <Zap className="bg" size={120} />
            <p className="k">Nearest fast hub</p>
            <h3>
              Benz Circle,
              <br />
              Vijayawada
            </h3>
            <div className="sv-phone-tags">
              <span>2.5 km away</span>
              <span>₹18/kWh</span>
            </div>
            <div className="sv-phone-avail">
              <span className="live" />
              2× 60kW CCS2 available
            </div>
          </div>
        </div>
        <div className="sv-phone-foot">
          <button className="sv-btn sv-btn-solid sv-btn-block">
            <QrCode size={18} /> Scan QR to charge
          </button>
        </div>
      </div>
    </div>
  );
}

export const TrustIcons = { Smartphone, Server, ShieldCheck };
export { Check, ArrowRight, Play, Apple, Globe, Share2, Mail };

/* ── privacy / terms modal ────────────────────────────── */

export function PrivacyModal({ onClose }) {
  const ref = useRef(null);
  useDialogA11y(ref, onClose);
  return (
    <div className="sv-overlay" role="dialog" aria-modal="true" aria-label="Privacy and terms">
      <div className="sv-modal sv-modal-scroll" ref={ref} style={{ width: "min(640px, 100%)" }}>
        <h2>Privacy &amp; terms</h2>
        <p>
          SABHIVOLT collects the details you submit through the enquiry form (name, phone, email,
          area of interest and message) solely to respond to your enquiry and discuss potential
          partnerships. We do not sell your data.
        </p>
        <p>
          Information is stored securely and accessed only by authorised SABHIVOLT staff. You can
          request deletion of your enquiry at any time by emailing us.
        </p>
        <p>
          This website is provided on an "as is" basis. Project details, locations and figures are
          indicative and subject to change as the network develops.
        </p>
        <div className="sv-modal-row">
          <button className="sv-btn sv-btn-solid" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
