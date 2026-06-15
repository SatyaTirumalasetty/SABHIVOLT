import React, { useState, useEffect, useRef } from "react";
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

/* ── energy flow diagram ──────────────────────────────── */

const FlowIcons = [
  // sun
  <svg key="sun" width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
    <circle cx="17" cy="17" r="7" stroke="#FFB930" strokeWidth="2" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
      const r1 = 10.5, r2 = 14.5;
      const rad = (a * Math.PI) / 180;
      return (
        <line
          key={a}
          x1={17 + r1 * Math.cos(rad)} y1={17 + r1 * Math.sin(rad)}
          x2={17 + r2 * Math.cos(rad)} y2={17 + r2 * Math.sin(rad)}
          stroke="#FFB930" strokeWidth="2" strokeLinecap="round"
        />
      );
    })}
  </svg>,
  // battery
  <svg key="batt" width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
    <rect x="5" y="11" width="22" height="12" rx="2" stroke="#00D4AA" strokeWidth="2" />
    <rect x="28" y="14.5" width="3" height="5" rx="1" fill="#00D4AA" />
    <rect x="8" y="14" width="10" height="6" rx="1" fill="#00D4AA" />
  </svg>,
  // bolt
  <svg key="bolt" width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
    <path d="M19 4 L9 19 H16 L14 30 L25 14 H18 L19 4 Z" stroke="#00D4AA" strokeWidth="2" strokeLinejoin="round" fill="rgba(0,212,170,0.18)" />
  </svg>,
  // rupee
  <svg key="rupee" width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
    <text x="17" y="24" textAnchor="middle" fontSize="20" fontFamily="sans-serif" fill="#FFB930">₹</text>
    <circle cx="17" cy="17" r="13" stroke="#FFB930" strokeWidth="2" />
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

/* ── Andhra Pradesh network map ───────────────────────── */

// Simplified AP outline (lat, lon) — stylised, not survey-accurate
const AP_OUTLINE = [
  [19.05, 84.45], [18.78, 84.05], [18.45, 83.55], [18.1, 83.4],
  [17.75, 83.35], [17.6, 83.0], [17.3, 82.55], [17.0, 82.3],
  [16.75, 82.3], [16.55, 81.85], [16.3, 81.3], [16.05, 81.05],
  [15.75, 80.45], [15.4, 80.15], [14.9, 80.1], [14.4, 80.15],
  [13.95, 80.2], [13.55, 80.15], [13.45, 79.95], [13.2, 79.75],
  [13.05, 79.4], [12.95, 78.95], [12.75, 78.55], [12.85, 78.25],
  [13.3, 78.1], [13.6, 77.9], [14.0, 77.45], [14.45, 77.1],
  [14.9, 76.95], [15.25, 77.05], [15.45, 77.3], [15.8, 77.45],
  [15.95, 77.9], [16.05, 78.3], [16.1, 78.9], [16.3, 79.25],
  [16.55, 79.7], [16.75, 80.1], [16.95, 80.5], [16.85, 80.95],
  [17.1, 81.2], [17.45, 81.4], [17.8, 81.65], [18.1, 81.95],
  [18.35, 82.3], [18.6, 82.7], [18.85, 83.3], [19.1, 83.9],
];

// NH-16 coastal corridor waypoints (Chennai→Kolkata trunk through AP)
const NH16_PATH = [
  [13.7, 80.1], [14.44, 79.99], [15.5, 80.05], [16.31, 80.44],
  [16.43, 80.55], [16.51, 80.65], [16.95, 81.78], [17.0, 82.25],
  [17.69, 83.22], [18.3, 83.9], [18.9, 84.4],
];

const MAP_W = 420, MAP_H = 420, MAP_PAD = 16;
function project(lat, lon) {
  const LON_MIN = 76.7, LON_MAX = 84.7, LAT_MIN = 12.5, LAT_MAX = 19.3;
  const x = MAP_PAD + ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * (MAP_W - MAP_PAD * 2);
  const y = MAP_PAD + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * (MAP_H - MAP_PAD * 2);
  return [x, y];
}

export function APMap({ locations }) {
  const outline = AP_OUTLINE.map(([lat, lon]) => project(lat, lon).join(",")).join(" ");
  const nh16 = NH16_PATH.map(([lat, lon], i) => {
    const [x, y] = project(lat, lon);
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");

  // Place labels first, nudging vertically to avoid overlaps between nearby pins.
  const placedLabels = [];
  const pins = locations.map((l) => {
    const lat = parseFloat(l.lat), lon = parseFloat(l.lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
    const [x, y] = project(lat, lon);
    const col = statusColor(l.status);
    const labelRight = x < MAP_W * 0.62;
    const labelX = labelRight ? x + 14 : x - 14;
    const labelWidth = l.name.length * 5.2;
    let labelY = y + 3.5;
    const left = labelRight ? labelX : labelX - labelWidth;
    const right = labelRight ? labelX + labelWidth : labelX;
    while (
      placedLabels.some(
        (p) => Math.abs(labelY - p.y) < 13 && left < p.right && right > p.left
      )
    ) {
      labelY += 13;
    }
    placedLabels.push({ y: labelY, left, right });
    return { ...l, x, y, col, labelRight, labelX, labelY };
  });

  return (
    <div className="sv-map-frame">
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="img" aria-label="Map of Andhra Pradesh showing SABHIVOLT network locations">
        <polygon className="sv-map-state" points={outline} />
        <path className="sv-map-nh16" d={nh16} />
        <text className="sv-map-label" x={project(15.2, 80.6)[0]} y={project(15.2, 80.6)[1]} fill="#FFB930">NH-16</text>
        {pins.map((p, i) => {
          if (!p) return null;
          const { x, y, col, labelRight, labelX, labelY, name } = p;
          return (
            <g key={i}>
              <circle className="sv-node-pulse" cx={x} cy={y} r="8" fill="none" stroke={col} strokeWidth="1.5" />
              <circle cx={x} cy={y} r="4.5" fill={col} />
              <circle cx={x} cy={y} r="9" fill="none" stroke={col} strokeOpacity="0.3" strokeWidth="1" />
              <text
                className="sv-map-label"
                x={labelX}
                y={labelY}
                textAnchor={labelRight ? "start" : "end"}
                fill="#E9F4EF"
              >
                {name}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="sv-map-caption">Stylised map · not to survey scale</div>
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
