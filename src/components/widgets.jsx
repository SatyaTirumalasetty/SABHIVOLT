import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { prefersReducedMotion, statusColor } from "../lib/content";
import { useDialogA11y } from "../lib/a11y";

/* ── text helpers ─────────────────────────────────────── */

/** Render "[word]" segments as highlighted <em> */
export function Highlight({ text }) {
  const parts = String(text).split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("[") && p.endsWith("]") ? (
          <em key={i}>{p.slice(1, -1)}</em>
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

/* ── icon set (lightweight, stroke-based, currentColor) ──── */

const iconBase = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export const Icons = {
  zap: (p) => <svg {...iconBase} {...p}><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" /></svg>,
  sun: (p) => <svg {...iconBase} {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>,
  battery: (p) => <svg {...iconBase} {...p}><rect x="2" y="7" width="18" height="10" rx="2" /><path d="M22 11v2M6 10v4M10 10v4" /></svg>,
  route: (p) => <svg {...iconBase} {...p}><circle cx="6" cy="19" r="2" /><circle cx="18" cy="5" r="2" /><path d="M8 19h8a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2H8a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h8" /></svg>,
  mapPin: (p) => <svg {...iconBase} {...p}><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0Z" /><circle cx="12" cy="10" r="3" /></svg>,
  megaphone: (p) => <svg {...iconBase} {...p}><path d="M3 11v3a1 1 0 0 0 1 1h2l3.5 5V5L6 10H4a1 1 0 0 0-1 1Z" /><path d="M14 7a4 4 0 0 1 0 10M18 4a8 8 0 0 1 0 16" /></svg>,
  activity: (p) => <svg {...iconBase} {...p}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
  leaf: (p) => <svg {...iconBase} {...p}><path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 9-9h7v7a9 9 0 0 1-9 9Z" /><path d="M4 13c4 0 9-1 13-5" /></svg>,
  briefcase: (p) => <svg {...iconBase} {...p}><rect x="2" y="7" width="20" height="13" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>,
  home: (p) => <svg {...iconBase} {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" /></svg>,
  store: (p) => <svg {...iconBase} {...p}><path d="M3 9 4 4h16l1 5" /><path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0" /><path d="M5 9v10h14V9" /></svg>,
  smartphone: (p) => <svg {...iconBase} {...p}><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M11 18h2" /><path d="M9 6c1 1 5 1 6 0" /></svg>,
  server: (p) => <svg {...iconBase} {...p}><rect x="3" y="4" width="18" height="7" rx="1.5" /><rect x="3" y="13" width="18" height="7" rx="1.5" /><path d="M7 7.5h.01M7 16.5h.01" /></svg>,
  check: (p) => <svg {...iconBase} {...p}><path d="M20 6 9 17l-5-5" /></svg>,
  qrCode: (p) => <svg {...iconBase} {...p}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM18 18h3v3h-3z" /></svg>,
  carFront: (p) => <svg {...iconBase} {...p}><path d="M5 17h14M5 17a2 2 0 0 1-2-2l1-5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2l1 5a2 2 0 0 1-2 2M7 17v2M17 17v2" /><circle cx="7.5" cy="14.5" r="0.6" fill="currentColor" /><circle cx="16.5" cy="14.5" r="0.6" fill="currentColor" /></svg>,
  arrowRight: (p) => <svg {...iconBase} {...p}><path d="M5 12h14M13 5l7 7-7 7" /></svg>,
  plug: (p) => <svg {...iconBase} {...p}><path d="M9 2v4M15 2v4M7 8h10v4a5 5 0 0 1-5 5 5 5 0 0 1-5-5V8z" /><path d="M12 17v5" /></svg>,
  mail: (p) => <svg {...iconBase} {...p}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 7L2 7" /></svg>,
  linkedin: (p) => <svg {...iconBase} {...p}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>,
  twitter: (p) => <svg {...iconBase} {...p}><path d="M4 4 20 20M4 20 20 4" /></svg>,
};

const SERVICE_ICONS = {
  "TP-01": Icons.briefcase,
  "RW-02": Icons.home,
  "MR-03": Icons.store,
};

export function ServiceIcon({ code, ...props }) {
  const Icon = SERVICE_ICONS[code] || Icons.zap;
  return <Icon {...props} />;
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

/* ── hero visual v2 — live charging hub ──────────────── */

const WAVE_H = [38,62,45,78,55,88,65,42,72,50,85,58,36,68,48,80,52,70,44,64];

export function HeroVisual() {
  const [energy, setEnergy] = useState(14.2);
  const r = 48;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(energy / 80, 1));

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = setInterval(() => {
      setEnergy(e => Math.min(77.6, parseFloat((e + 0.12).toFixed(1))));
    }, 1200);
    return () => clearInterval(id);
  }, []);

  const ports = [
    { id: 'P1', power: '480 kW', status: 'charging', vehicle: 'Mercedes EQS 580', timer: '14m' },
    { id: 'P2', power: '60 kW',  status: 'charging', vehicle: 'Tata Nexon EV Max', timer: '31m' },
    { id: 'P3', power: '60 kW',  status: 'available' },
    { id: 'P4', power: '480 kW', status: 'available' },
  ];

  return (
    <div className="sv-hv2 sv-reveal" aria-hidden="true">
      <div className="sv-hv2-head">
        <div className="sv-hv2-live"><span className="dot" />LIVE · BENGALURU HUB</div>
        <div className="sv-hv2-badge">2 / 4 ports active</div>
      </div>
      <div className="sv-hv2-main">
        <div className="sv-hv2-ring-wrap">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r={r} fill="none"
              stroke="#10b981" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={offset}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 1.1s ease', filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.5))' }}
            />
          </svg>
          <div className="sv-hv2-ring-label">
            <span className="sv-hv2-ring-val">{energy.toFixed(1)}</span>
            <span className="sv-hv2-ring-unit">kWh</span>
            <span className="sv-hv2-ring-sub">this session</span>
          </div>
        </div>
        <div className="sv-hv2-meta">
          <div className="sv-hv2-meta-item"><span className="label">MAX SPEED</span><b>480 kW</b></div>
          <div className="sv-hv2-meta-item"><span className="label">RATE</span><b>₹ 18 / kWh</b></div>
          <div className="sv-hv2-meta-item"><span className="label">UPTIME</span><b>99.4%</b></div>
        </div>
      </div>
      <div className="sv-hv2-ports">
        {ports.map((p) => (
          <div className={`sv-hv2-port ${p.status}`} key={p.id}>
            <span className="sv-hv2-port-id">{p.id}</span>
            <div className="sv-hv2-port-info">
              <span className="power">{p.power}</span>
              {p.status === 'charging'
                ? <span className="vehicle">{p.vehicle}</span>
                : <span className="avail">Available</span>}
            </div>
            <div className="sv-hv2-port-status">
              {p.status === 'charging'
                ? <><span className="dot charging" />{p.timer} left</>
                : <span className="dash">—</span>}
            </div>
          </div>
        ))}
      </div>
      <div className="sv-hv2-wave">
        {WAVE_H.map((h, i) => (
          <i key={i} style={{ '--h': `${h}%`, animationDelay: `${i * 0.14}s` }} />
        ))}
      </div>
    </div>
  );
}

/* ── energy flow diagram ──────────────────────────────── */

const FlowIcons = [
  // sun
  <svg key="sun" width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
    <circle cx="17" cy="17" r="7" stroke="#f59e0b" strokeWidth="2" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
      const r1 = 10.5, r2 = 14.5;
      const rad = (a * Math.PI) / 180;
      return (
        <line
          key={a}
          x1={17 + r1 * Math.cos(rad)} y1={17 + r1 * Math.sin(rad)}
          x2={17 + r2 * Math.cos(rad)} y2={17 + r2 * Math.sin(rad)}
          stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"
        />
      );
    })}
  </svg>,
  // battery
  <svg key="batt" width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
    <rect x="5" y="11" width="22" height="12" rx="2" stroke="#10b981" strokeWidth="2" />
    <rect x="28" y="14.5" width="3" height="5" rx="1" fill="#10b981" />
    <rect x="8" y="14" width="10" height="6" rx="1" fill="#10b981" />
  </svg>,
  // bolt
  <svg key="bolt" width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
    <path d="M19 4 L9 19 H16 L14 30 L25 14 H18 L19 4 Z" stroke="#10b981" strokeWidth="2" strokeLinejoin="round" fill="rgba(16,185,129,0.16)" />
  </svg>,
  // rupee
  <svg key="rupee" width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
    <text x="17" y="24" textAnchor="middle" fontSize="20" fontFamily="sans-serif" fill="#f59e0b">₹</text>
    <circle cx="17" cy="17" r="13" stroke="#f59e0b" strokeWidth="2" />
  </svg>,
];

function FlowWire() {
  return (
    <div className="sv-flow-link" aria-hidden="true">
      <svg viewBox="0 0 64 16" preserveAspectRatio="none">
        <line className="sv-flow-wire" x1="0" y1="8" x2="64" y2="8" />
      </svg>
    </div>
  );
}

export function FlowDiagram({ flow }) {
  return (
    <div className="sv-flow">
      {flow.steps.map((s, i) => (
        <React.Fragment key={i}>
          {i > 0 && <FlowWire />}
          <div className="sv-flow-step sv-reveal">
            <div className="sv-flow-icon">{FlowIcons[i] || FlowIcons[2]}</div>
            <h4>{s.title}</h4>
            <p>{s.text}</p>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

/* ── interactive network map (Leaflet) ────────────────── */

function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

const MAP_PIN_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/></svg>';

export function LeafletMap({ locations }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, {
      scrollWheelZoom: false,
      zoomControl: false,
    }).setView([22.5937, 78.9629], 5);

    L.control.zoom({ position: "topright" }).addTo(map);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers = [];
    const coords = [];

    locations.forEach((loc) => {
      const lat = parseFloat(loc.lat);
      const lon = parseFloat(loc.lon);
      if (Number.isNaN(lat) || Number.isNaN(lon)) return;
      coords.push([lat, lon]);
      const col = statusColor(loc.status);
      const icon = L.divIcon({
        className: "",
        html: `<div class="sv-map-pin" style="background:${col}">${MAP_PIN_SVG}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        popupAnchor: [0, -14],
      });
      const marker = L.marker([lat, lon], { icon, title: loc.name }).addTo(map);
      marker.bindPopup(
        `<div class="sv-map-popup">` +
          `<div class="name">${escapeHtml(loc.name)}</div>` +
          `<div class="detail">${loc.ports != null ? `${loc.ports} Ports Available` : escapeHtml(loc.detail)}</div>` +
          (loc.speed != null
            ? `<div class="sv-popup-badges"><span>Max ${escapeHtml(String(loc.speed))}</span><span>CCS2 / AC</span></div>`
            : ``) +
        `</div>`
      );
      markers.push(marker);
    });

    if (coords.length) map.fitBounds(L.latLngBounds(coords).pad(0.18), { maxZoom: 6 });

    return () => markers.forEach((m) => m.remove());
  }, [locations]);

  return (
    <div
      ref={elRef}
      className="sv-leaflet"
      role="img"
      aria-label="Map of Sabhivolt charging network locations across India"
    />
  );
}

/* ── driver app phone mockup ──────────────────────────── */

export function DriverAppVisual() {
  return (
    <div className="sv-phone sv-reveal" aria-hidden="true">
      <div className="sv-phone-notch" />
      <div className="sv-phone-screen">
        <div className="sv-phone-head">
          <div>
            <span className="label">Welcome back,</span>
            <h4>Arjun M.</h4>
          </div>
          <div className="sv-phone-wallet">
            <span className="label">Wallet Balance</span>
            <b>₹650.00</b>
          </div>
        </div>
        <div className="sv-phone-body">
          <div className="sv-phone-card">
            <div>
              <span className="label">Current Vehicle</span>
              <h5>Tata Nexon EV</h5>
            </div>
            <span className="sv-phone-icon"><Icons.carFront /></span>
          </div>
          <div className="sv-phone-hub">
            <span className="label">Nearest Station</span>
            <h5>Phoenix Marketcity, Whitefield</h5>
            <div className="sv-phone-tags">
              <span>2.5 km</span>
              <span>₹18/kWh</span>
            </div>
            <div className="sv-phone-status">
              <span className="dot" />2 CCS2 Ports Available
            </div>
          </div>
        </div>
        <div className="sv-phone-cta">
          <Icons.qrCode />Scan QR to Charge
        </div>
      </div>
    </div>
  );
}

/* ── privacy & terms modal ────────────────────────────── */

export function PrivacyModal({ onClose }) {
  const ref = useRef(null);
  useDialogA11y(ref, onClose);
  return (
    <div className="sv-overlay" role="dialog" aria-modal="true" aria-label="Privacy and terms">
      <div className="sv-modal" ref={ref}>
        <h2>Privacy &amp; terms</h2>
        <h4>What we collect</h4>
        <p>
          When you send an enquiry, we collect the details you provide — your name, contact
          information and message — solely to respond to your enquiry and discuss potential
          partnerships.
        </p>
        <h4>How it's used</h4>
        <ul>
          <li>We use your details only to contact you about your enquiry.</li>
          <li>We do not sell or share your information with third parties for marketing.</li>
          <li>You may ask us to correct or delete your details at any time by contacting us.</li>
        </ul>
        <h4>Data protection</h4>
        <p>
          We handle personal data in line with India's Digital Personal Data Protection Act, 2023.
          For any privacy request, write to us at the contact address on this site.
        </p>
        <h4>Terms of use</h4>
        <p>
          Content on this site is provided for general information about SABHIVOLT's services and
          does not constitute an offer or commercial commitment. Project statuses shown are
          indicative and subject to change.
        </p>
        <div className="close-row">
          <button className="sv-btn sv-btn-solid" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
