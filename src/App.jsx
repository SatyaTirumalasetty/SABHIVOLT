import React, { useState, useEffect, useCallback } from "react";
import { DEFAULT_CONTENT, prefersReducedMotion } from "./lib/content";
import { loadContent, saveContent, getSession, onAuthChange } from "./lib/data";
import {
  Highlight,
  CountStat,
  CommandCenter,
  IndiaMap,
  PhoneMockup,
  PrivacyModal,
  Icon,
  Check,
  ArrowRight,
  Play,
  Apple,
  Globe,
  Share2,
  Mail,
  TrustIcons,
} from "./components/widgets";
import { Zap } from "lucide-react";
import { EnquiryForm, LoginModal } from "./components/forms";
import { AdminPanel } from "./components/AdminPanel";

const NAV_SECTIONS = ["solutions", "network", "drivers", "contact"];
const TRUST_ICONS = [TrustIcons.Smartphone, Zap, TrustIcons.Server];

function Logo({ className = "sv-logo" }) {
  return (
    <a href="#top" className={className}>
      <span className="mark">
        <Zap size={20} fill="currentColor" />
      </span>
      <span className="word">SABHIVOLT</span>
    </a>
  );
}

export default function App() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [loaded, setLoaded] = useState(false);
  const [session, setSession] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    (async () => {
      const [remote, sess] = await Promise.all([loadContent(), getSession()]);
      if (remote) setContent(remote);
      setSession(sess);
      setLoaded(true);
    })();
    return onAuthChange(setSession);
  }, []);

  /* scroll spy */
  useEffect(() => {
    if (!loaded) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5] }
    );
    NAV_SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [loaded]);

  /* scroll reveals */
  useEffect(() => {
    if (!loaded || prefersReducedMotion()) {
      document.querySelectorAll(".sv-reveal").forEach((el) => el.classList.add("in"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".sv-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loaded, content]);

  const handleSave = useCallback(async (draft) => {
    const ok = await saveContent(draft);
    if (ok) setContent(draft);
    return ok;
  }, []);

  const openAdmin = () => (session ? setAdminOpen(true) : setLoginOpen(true));

  if (!loaded) {
    return (
      <div className="sv-root">
        <div className="sv-splash" role="status" aria-label="Loading">
          <div className="logo">
            <span className="mark">
              <Zap size={22} fill="currentColor" />
            </span>
            SABHIVOLT
          </div>
          <div className="bar" aria-hidden="true" />
        </div>
      </div>
    );
  }

  const c = content;

  return (
    <div className="sv-root" id="top">
      <nav className="sv-nav" aria-label="Main">
        <div className="sv-wrap sv-nav-inner">
          <Logo />
          <div className="sv-links">
            <a
              href="#solutions"
              className={`hide-m ${activeSection === "solutions" ? "active" : ""}`}
            >
              Commercial solutions
            </a>
            <a href="#network" className={`hide-m ${activeSection === "network" ? "active" : ""}`}>
              Infrastructure
            </a>
            <a href="#drivers" className={`hide-m ${activeSection === "drivers" ? "active" : ""}`}>
              Driver app
            </a>
            <span className="sv-nav-divider hide-m" aria-hidden="true" />
            <a href="#contact">Contact sales</a>
            <button
              className="sv-btn sv-btn-dark"
              onClick={() => {
                document.getElementById("contact")?.scrollIntoView();
              }}
            >
              Partner with us
            </button>
          </div>
        </div>
      </nav>

      {/* ── hero ── */}
      <header className="sv-hero">
        <div className="sv-hero-grid" aria-hidden="true" />
        <div className="sv-hero-glow" aria-hidden="true" />
        <div className="sv-wrap">
          <div className="sv-hero-grid2">
            <div>
              <div className="sv-pill">
                <span className="dot" />
                <span>{c.hero.badge}</span>
              </div>
              <h1>
                <Highlight text={c.hero.headline} />
              </h1>
              <p>{c.hero.subheadline}</p>
              <div className="sv-hero-ctas">
                <a href="#contact" className="sv-btn sv-btn-solid">
                  {c.hero.ctaPrimary}
                </a>
                <a href="#network" className="sv-btn sv-btn-ghost">
                  {c.hero.ctaSecondary}
                </a>
              </div>
              <div className="sv-hero-trust">
                {c.hero.trust.map((t, i) => {
                  const TI = TRUST_ICONS[i % TRUST_ICONS.length];
                  return (
                    <span className="sv-trust-chip" key={t}>
                      <TI size={16} /> {t}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="sv-reveal">
              <CommandCenter data={c.dashboard} />
            </div>
          </div>
        </div>
      </header>

      {/* ── trust strip ── */}
      {c.partners?.length > 0 && (
        <section className="sv-trust-strip" aria-label="Trusted by">
          <div className="sv-wrap">
            <p className="cap">Trusted by India's leading fleets &amp; property developers</p>
            <div className="sv-trust-logos">
              {c.partners.map((p) => (
                <div className="sv-trust-logo" key={p}>
                  <Zap size={22} /> {p}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── commercial solutions ── */}
      <section className="sv-section" id="solutions">
        <div className="sv-wrap">
          <div className="sv-section-head">
            <div className="sv-eyebrow">{c.solutions.eyebrow}</div>
            <h2>{c.solutions.headline}</h2>
            <p className="sv-lede">{c.solutions.body}</p>
          </div>
          <div className="sv-cards">
            {c.solutions.items.map((s, i) => (
              <article
                className="sv-card sv-reveal"
                key={s.title}
                style={{ transitionDelay: `${Math.min(i * 80, 240)}ms` }}
              >
                {s.highlight && <span className="ribbon">High ROI</span>}
                <span className="icon">
                  <Icon name={s.icon} size={28} />
                </span>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
                <a href="#contact" className="more">
                  {s.cta} <ArrowRight size={16} />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── stats ── */}
      <section className="sv-stats" aria-label="Key figures">
        <div className="sv-wrap">
          <div className="sv-stats-row">
            {c.stats.map((s) => (
              <CountStat key={`${s.label}`} value={s.value} label={s.label} />
            ))}
          </div>
        </div>
      </section>

      {/* ── network / infrastructure ── */}
      <section className="sv-network" id="network">
        <div className="sv-network-grid-bg" aria-hidden="true" />
        <div className="sv-wrap">
          <div className="sv-network-grid">
            <div>
              <div className="sv-eyebrow">{c.network.eyebrow}</div>
              <h2>{c.network.headline}</h2>
              <p className="body">{c.network.body}</p>
              {c.network.chargerTypes.map((t) => (
                <div className="sv-charger" key={t.title}>
                  <span className="ic">
                    <Icon name={t.icon} size={22} />
                  </span>
                  <div>
                    <h4>{t.title}</h4>
                    <p>{t.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="sv-reveal">
              <div className="sv-map-shell">
                <span className="sv-map-badge">
                  <span className="live" /> Live network
                </span>
                <IndiaMap locations={c.network.locations} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── driver app ── */}
      <section className="sv-driver" id="drivers">
        <span className="glow1" aria-hidden="true" />
        <span className="glow2" aria-hidden="true" />
        <div className="sv-wrap">
          <div className="sv-driver-grid">
            <div>
              <div className="sv-driver-badge">
                <span>{c.driver.badge}</span>
              </div>
              <h2>{c.driver.headline}</h2>
              <p className="body">{c.driver.body}</p>
              <ul className="sv-driver-feats">
                {c.driver.features.map((f) => (
                  <li key={f}>
                    <span className="tick">
                      <Check size={16} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="sv-store-btns">
                <button className="sv-store-btn dark">
                  <Play size={22} fill="currentColor" />
                  <span>
                    <span className="sm">GET IT ON</span>
                    <span className="lg">Google Play</span>
                  </span>
                </button>
                <button className="sv-store-btn light">
                  <Apple size={24} fill="currentColor" />
                  <span>
                    <span className="sm">Download on the</span>
                    <span className="lg">App Store</span>
                  </span>
                </button>
              </div>
            </div>
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* ── about ── */}
      <section className="sv-section" id="about">
        <div className="sv-wrap">
          <div className="sv-section-head">
            <div className="sv-eyebrow">{c.about.eyebrow}</div>
            <h2>{c.about.headline}</h2>
            <p className="sv-lede">{c.about.body}</p>
          </div>
          <div className="sv-cards">
            {c.about.values.map((v, i) => (
              <div
                className="sv-card sv-reveal"
                key={v.title}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── contact ── */}
      <section
        className="sv-section"
        id="contact"
        style={{ background: "#fff", borderTop: "1px solid var(--slate-200)" }}
      >
        <div className="sv-wrap">
          <div className="sv-section-head">
            <div className="sv-eyebrow">{c.contact.eyebrow}</div>
            <h2>{c.contact.headline}</h2>
            <p className="sv-lede">{c.contact.body}</p>
          </div>
          <div className="sv-contact-grid">
            <EnquiryForm onOpenPrivacy={() => setPrivacyOpen(true)} />
            <div className="sv-contact-side">
              <div className="sv-contact-item">
                <span className="k">Email</span>
                <span className="v">
                  <a href={`mailto:${c.contact.email}`}>{c.contact.email}</a>
                </span>
              </div>
              <div className="sv-contact-item">
                <span className="k">Phone</span>
                <span className="v">
                  <a href={`tel:${c.contact.phone.replace(/\s/g, "")}`}>{c.contact.phone}</a>
                </span>
              </div>
              <div className="sv-contact-item">
                <span className="k">Headquarters</span>
                <span className="v">{c.contact.address}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── footer ── */}
      <footer className="sv-footer">
        <div className="sv-wrap">
          <div className="sv-footer-cols">
            <div className="sv-footer-brand">
              <Logo />
              <p>
                Accelerating India's transition to electric mobility through reliable, interoperable
                and intelligent charging infrastructure built for scale — from Mangalagiri, Andhra
                Pradesh.
              </p>
              <div className="sv-socials">
                <a href={`mailto:${c.contact.email}`} aria-label="Email">
                  <Mail size={18} />
                </a>
                <a href="#contact" aria-label="LinkedIn">
                  <Globe size={18} />
                </a>
                <a href="#contact" aria-label="X / Twitter">
                  <Share2 size={18} />
                </a>
              </div>
            </div>
            <div className="sv-footer-col">
              <h4>Solutions</h4>
              <ul>
                {c.solutions.items.map((s) => (
                  <li key={s.title}>
                    <a href="#solutions">{s.title}</a>
                  </li>
                ))}
                <li>
                  <a href="#network">CPO software</a>
                </li>
              </ul>
            </div>
            <div className="sv-footer-col">
              <h4>Company</h4>
              <ul>
                <li>
                  <a href="#about">About us</a>
                </li>
                <li>
                  <a href="#network">Network</a>
                </li>
                <li>
                  <a href="#contact">Contact sales</a>
                </li>
                <li>
                  <button onClick={openAdmin}>Admin</button>
                </li>
              </ul>
            </div>
            <div className="sv-footer-col">
              <h4>Legal &amp; support</h4>
              <ul>
                <li>
                  <a href="#drivers">Driver help</a>
                </li>
                <li>
                  <a href="#contact">Host support</a>
                </li>
                <li>
                  <button onClick={() => setPrivacyOpen(true)}>Privacy &amp; terms</button>
                </li>
              </ul>
            </div>
          </div>
          <div className="sv-footer-bot">
            <p>© {new Date().getFullYear()} SABHIVOLT · Mangalagiri, Andhra Pradesh</p>
            <span className="sv-status-chip">
              <span className="dot" /> System status: operational
            </span>
          </div>
        </div>
      </footer>

      {privacyOpen && <PrivacyModal onClose={() => setPrivacyOpen(false)} />}

      {loginOpen && (
        <LoginModal
          onSuccess={() => {
            setLoginOpen(false);
            setAdminOpen(true);
          }}
          onCancel={() => setLoginOpen(false)}
        />
      )}

      {adminOpen && (
        <AdminPanel
          content={content}
          onSave={handleSave}
          onClose={() => setAdminOpen(false)}
          onSignedOut={() => {
            setAdminOpen(false);
            setSession(null);
          }}
        />
      )}
    </div>
  );
}
