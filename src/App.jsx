import React, { useState, useEffect, useCallback } from "react";
import { DEFAULT_CONTENT, prefersReducedMotion, statusColor } from "./lib/content";
import { loadContent, saveContent, getSession, onAuthChange } from "./lib/data";
import { Highlight, CountStat, FlowDiagram, APMap, PrivacyModal } from "./components/widgets";
import { EnquiryForm, LoginModal } from "./components/forms";
import { AdminPanel } from "./components/AdminPanel";

const NAV_SECTIONS = ["services", "model", "network", "about", "contact"];

export default function App() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [loaded, setLoaded] = useState(false);
  const [session, setSession] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  /* load content + auth session */
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

  const openAdmin = () => {
    if (session) setAdminOpen(true);
    else setLoginOpen(true);
  };

  if (!loaded) {
    return (
      <div className="sv-root">
        <div className="sv-splash" role="status" aria-label="Loading">
          <div className="logo">SABHI<span>VOLT</span></div>
          <div className="bar" aria-hidden="true" />
        </div>
      </div>
    );
  }

  const c = content;
  const flagshipFirst = [...c.services].sort((a, b) => (b.flagship ? 1 : 0) - (a.flagship ? 1 : 0));

  return (
    <div className="sv-root">
      <div className="sv-current" aria-hidden="true" />

      <nav className="sv-nav" aria-label="Main">
        <div className="sv-wrap sv-nav-inner">
          <a href="#top" className="sv-logo">SABHI<span>VOLT</span></a>
          <div className="sv-links">
            <a href="#services" className={`hide-m ${activeSection === "services" ? "active" : ""}`}>Verticals</a>
            <a href="#model" className={`hide-m ${activeSection === "model" ? "active" : ""}`}>Model</a>
            <a href="#network" className={`hide-m ${activeSection === "network" ? "active" : ""}`}>Network</a>
            <a href="#about" className={`hide-m ${activeSection === "about" ? "active" : ""}`}>About</a>
            <a href="#contact" className={activeSection === "contact" ? "active" : ""}>Contact</a>
          </div>
        </div>
      </nav>

      <header className="sv-hero" id="top">
        <div className="sv-hero-grid" aria-hidden="true" />
        <div className="sv-hero-glow" aria-hidden="true" />
        <div className="sv-wrap">
          <div className="sv-eyebrow">{c.hero.eyebrow}</div>
          <h1><Highlight text={c.hero.headline} /></h1>
          <p>{c.hero.subheadline}</p>
          <div className="sv-hero-ctas">
            <a href="#contact" className="sv-btn sv-btn-solid">{c.hero.ctaPrimary}</a>
            <a href="#services" className="sv-btn sv-btn-ghost">{c.hero.ctaSecondary}</a>
          </div>
        </div>
      </header>

      <section className="sv-stats" aria-label="Key figures">
        <div className="sv-wrap">
          <div className="sv-stats-row">
            {c.stats.map((s, i) => (
              <CountStat key={`${s.value}-${s.label}-${i}`} value={s.value} label={s.label} />
            ))}
          </div>
        </div>
      </section>

      <section className="sv-section" id="services">
        <div className="sv-wrap">
          <div className="sv-eyebrow">EIGHT VERTICALS, ONE NETWORK</div>
          <h2>Everything the electric corridor needs</h2>
          <p className="sv-lede">
            Each vertical strengthens the others — solar powers the chargers,
            storage keeps them on, amenities bring people in, and software ties
            it all together.
          </p>
          <div className="sv-services-grid">
            {flagshipFirst.map((s, i) => (
              <article
                className={`sv-card sv-reveal ${s.flagship ? "flagship" : ""}`}
                key={i}
                style={{ transitionDelay: `${Math.min(i * 60, 300)}ms` }}
              >
                <span className="code">
                  {s.code}
                  {s.flagship && <span className="flag">FLAGSHIP</span>}
                </span>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sv-section sv-flow-band" id="model">
        <div className="sv-wrap">
          <div className="sv-eyebrow">{c.flow.eyebrow}</div>
          <h2>{c.flow.headline}</h2>
          <p className="sv-lede">{c.flow.body}</p>
          <FlowDiagram flow={c.flow} />
        </div>
      </section>

      <section className="sv-section" id="network">
        <div className="sv-wrap">
          <div className="sv-eyebrow">{c.network.eyebrow}</div>
          <h2>{c.network.headline}</h2>
          <p className="sv-lede">{c.network.body}</p>
          <div className="sv-map-grid">
            <div className="sv-reveal"><APMap locations={c.network.locations} /></div>
            <div className="sv-map-legend">
              {c.network.locations.map((l, i) => (
                <div className="sv-legend-item sv-reveal" key={i} style={{ transitionDelay: `${i * 90}ms` }}>
                  <span className="sv-legend-dot" style={{ background: statusColor(l.status) }} aria-hidden="true" />
                  <div>
                    <span className="name">{l.name}</span>
                    <span className="status" style={{ color: statusColor(l.status) }}>{l.status}</span>
                    <span className="detail">{l.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="sv-section sv-network" id="about">
        <div className="sv-wrap">
          <div className="sv-eyebrow">{c.about.eyebrow}</div>
          <h2>{c.about.headline}</h2>
          <p className="sv-about-body">{c.about.body}</p>
          <div className="sv-values">
            {c.about.values.map((v, i) => (
              <div className="sv-value sv-reveal" key={i} style={{ transitionDelay: `${i * 90}ms` }}>
                <h4>{v.title}</h4>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sv-section" id="contact">
        <div className="sv-wrap">
          <div className="sv-eyebrow">{c.contact.eyebrow}</div>
          <h2>{c.contact.headline}</h2>
          <p className="sv-lede">{c.contact.body}</p>
          <div className="sv-contact-grid">
            <EnquiryForm onOpenPrivacy={() => setPrivacyOpen(true)} />
            <div className="sv-contact-side">
              <div className="sv-contact-item">
                <span className="k">Email</span>
                <span className="v"><a href={`mailto:${c.contact.email}`}>{c.contact.email}</a></span>
              </div>
              <div className="sv-contact-item">
                <span className="k">Phone</span>
                <span className="v"><a href={`tel:${c.contact.phone.replace(/\s/g, "")}`}>{c.contact.phone}</a></span>
              </div>
              <div className="sv-contact-item">
                <span className="k">Headquarters</span>
                <span className="v">{c.contact.address}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="sv-footer">
        <div className="sv-wrap sv-footer-inner">
          <p>© {new Date().getFullYear()} SABHIVOLT · Mangalagiri, Andhra Pradesh</p>
          <div className="sv-footer-links">
            <button className="link" onClick={() => setPrivacyOpen(true)}>Privacy &amp; terms</button>
            <button className="sv-admin-link" onClick={openAdmin}>⚙ Admin</button>
          </div>
        </div>
      </footer>

      {privacyOpen && <PrivacyModal onClose={() => setPrivacyOpen(false)} />}

      {loginOpen && (
        <LoginModal
          onSuccess={() => { setLoginOpen(false); setAdminOpen(true); }}
          onCancel={() => setLoginOpen(false)}
        />
      )}

      {adminOpen && (
        <AdminPanel
          content={content}
          onSave={handleSave}
          onClose={() => setAdminOpen(false)}
          onSignedOut={() => setAdminOpen(false)}
        />
      )}
    </div>
  );
}
