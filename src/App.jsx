import React, { useState, useEffect, useCallback } from "react";
import { DEFAULT_CONTENT, prefersReducedMotion, statusColor } from "./lib/content";
import { loadContent, saveContent, getSession, onAuthChange } from "./lib/data";
import { Highlight, CountStat, FlowDiagram, LeafletMap, HeroVisual, DriverAppVisual, ServiceIcon, Icons, PrivacyModal } from "./components/widgets";
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

  /* apply the chosen colour theme */
  useEffect(() => {
    document.documentElement.dataset.theme = content.theme || "emerald";
  }, [content.theme]);

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
          <a href="#top" className="sv-logo">
            <span className="sv-logo-mark"><Icons.zap stroke="#10b981" /></span>
            <span className="sv-logo-text">SABHI<span>VOLT</span></span>
          </a>
          <div className="sv-links">
            <a href="#services" className={`hide-m ${activeSection === "services" ? "active" : ""}`}>Commercial Solutions</a>
            <a href="#model" className={`hide-m ${activeSection === "model" ? "active" : ""}`}>Partner Model</a>
            <a href="#network" className={`hide-m ${activeSection === "network" ? "active" : ""}`}>Infrastructure</a>
            <a href="#about" className={`hide-m ${activeSection === "about" ? "active" : ""}`}>Driver App</a>
            <a href="#contact" className={activeSection === "contact" ? "active" : ""}>Contact</a>
          </div>
          <a href="#contact" className="sv-btn sv-btn-solid sv-nav-cta hide-m">{c.hero.ctaPrimary}</a>
        </div>
      </nav>

      <header className="sv-hero" id="top">
        <div className="sv-hero-grid" aria-hidden="true" />
        <div className="sv-hero-glow" aria-hidden="true" />
        <div className="sv-wrap sv-hero-cols">
          <div>
            <div className="sv-pill-badge"><span className="sv-pill-dot" aria-hidden="true" />{c.hero.eyebrow}</div>
            <h1><Highlight text={c.hero.headline} /></h1>
            <p>{c.hero.subheadline}</p>
            <div className="sv-hero-ctas">
              <a href="#contact" className="sv-btn sv-btn-solid">{c.hero.ctaPrimary}</a>
              <a href="#network" className="sv-btn sv-btn-ghost">{c.hero.ctaSecondary}</a>
            </div>
            <div className="sv-feature-pills">
              <span className="sv-feature-pill"><Icons.smartphone />100% UPI Native</span>
              <span className="sv-feature-pill"><Icons.zap />480kW Ultrafast Ready</span>
              <span className="sv-feature-pill"><Icons.server />OCCP 2.0 Compliant</span>
            </div>
          </div>
          <HeroVisual />
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

      <section className="sv-trustbar" aria-label="Trusted by">
        <div className="sv-wrap">
          <p className="sv-trustbar-label">Trusted by leading fleets &amp; property developers</p>
        </div>
        <div className="sv-trustbar-track-wrap" aria-hidden="true">
          <div className="sv-trustbar-track">
            {[0, 1].map((n) => (
              <div className="sv-trustbar-set" key={n}>
                <span><Icons.home />Prestige RWAs</span>
                <span><Icons.store />Metro Malls</span>
                <span><Icons.carFront />BluSmart Fleets</span>
                <span><Icons.briefcase />Embassy Parks</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sv-section sv-services" id="services">
        <div className="sv-wrap">
          <div className="sv-eyebrow">COMMERCIAL SOLUTIONS</div>
          <h2>Turn empty parking into a revenue engine</h2>
          <p className="sv-lede">
            Partner with SABHIVOLT to install resilient EV charging at your location.
            We handle the hardware installation, software management, and payment
            reconciliation. You simply earn revenue.
          </p>
          <div className="sv-services-grid">
            {flagshipFirst.map((s, i) => (
              <article
                className={`sv-card sv-reveal ${s.flagship ? "flagship" : ""}`}
                key={i}
                style={{ transitionDelay: `${Math.min(i * 60, 300)}ms` }}
              >
                <div className="sv-card-icon"><ServiceIcon code={s.code} /></div>
                <span className="code">
                  {s.code}
                  {s.flagship && <span className="flag">FLAGSHIP</span>}
                </span>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
                {s.link && (
                  <a href="#contact" className="sv-card-link">
                    {s.link}<Icons.arrowRight />
                  </a>
                )}
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

      <section className="sv-section sv-dark-band sv-network" id="network">
        <div className="sv-wrap">
          <div className="sv-eyebrow">{c.network.eyebrow}</div>
          <h2>{c.network.headline}</h2>
          <p className="sv-lede">{c.network.body}</p>
          <div className="sv-network-specs-bar">
            {c.network.specs.map((s, i) => (
              <div className="sv-network-spec sv-reveal" key={s.title} style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="sv-network-spec-icon">{i === 0 ? <Icons.zap /> : <Icons.plug />}</span>
                <div>
                  <h4>{s.title}</h4>
                  <p>{s.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="sv-map-grid">
            <div className="sv-map-frame sv-reveal">
              <span className="sv-map-live-badge"><span className="dot" aria-hidden="true" />Live network</span>
              <LeafletMap locations={c.network.locations} />
            </div>
            <div className="sv-map-legend">
              {c.network.locations.map((l, i) => (
                <div className="sv-legend-item sv-reveal" key={i} style={{ transitionDelay: `${i * 55}ms` }}>
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

      <section className="sv-section sv-brand-band" id="about">
        <div className="sv-wrap sv-app-cols">
          <div>
            <div className="sv-eyebrow">{c.about.eyebrow}</div>
            <h2>{c.about.headline}</h2>
            <p className="sv-about-body">{c.about.body}</p>
            <ul className="sv-app-features">
              {c.about.values.map((v, i) => (
                <li className="sv-reveal" key={i} style={{ transitionDelay: `${i * 90}ms` }}>
                  <span className="sv-app-check"><Icons.check /></span>
                  <div>
                    <b>{v.title}</b>
                    <p>{v.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <DriverAppVisual />
        </div>
      </section>

      <section className="sv-section sv-contact" id="contact">
        <div className="sv-wrap">
          <div className="sv-eyebrow">{c.contact.eyebrow}</div>
          <h2>{c.contact.headline}</h2>
          <p className="sv-lede">{c.contact.body}</p>
          <div className="sv-contact-grid">
            <EnquiryForm onOpenPrivacy={() => setPrivacyOpen(true)} />
            <div className="sv-contact-side">
              <div className="sv-contact-item">
                <span className="sv-contact-icon"><Icons.mail /></span>
                <div>
                  <span className="k">Email</span>
                  <span className="v"><a href={`mailto:${c.contact.email}`}>{c.contact.email}</a></span>
                </div>
              </div>
              {c.contact.phone?.trim() && (
                <div className="sv-contact-item">
                  <span className="sv-contact-icon"><Icons.smartphone /></span>
                  <div>
                    <span className="k">Phone</span>
                    <span className="v"><a href={`tel:${c.contact.phone.replace(/\s/g, "")}`}>{c.contact.phone}</a></span>
                  </div>
                </div>
              )}
              <div className="sv-contact-item">
                <span className="sv-contact-icon"><Icons.mapPin /></span>
                <div>
                  <span className="k">Headquarters</span>
                  <span className="v">{c.contact.address}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="sv-footer sv-dark-band">
        <div className="sv-wrap">
          <div className="sv-footer-grid">
            <div className="sv-footer-brand">
              <a href="#top" className="sv-logo">
                <span className="sv-logo-mark"><Icons.zap stroke="#10b981" /></span>
                <span className="sv-logo-text">SABHI<span>VOLT</span></span>
              </a>
              <p>Accelerating India's transition to electric mobility through reliable, accessible and intelligent charging infrastructure.</p>
            </div>
            <div className="sv-footer-col">
              <h5>Solutions</h5>
              <ul>
                <li><a href="#services">Residential (RWA)</a></li>
                <li><a href="#services">Commercial &amp; Retail</a></li>
                <li><a href="#model">Fleet Depot Setup</a></li>
                <li><a href="#about">CPO Software</a></li>
              </ul>
            </div>
            <div className="sv-footer-col">
              <h5>Company</h5>
              <ul>
                <li><a href="#model">How it works</a></li>
                <li><a href="#network">Infrastructure map</a></li>
                <li><a href="#about">Driver app</a></li>
                <li><a href="#contact">Contact sales</a></li>
              </ul>
            </div>
            <div className="sv-footer-col">
              <h5>Legal &amp; support</h5>
              <ul>
                <li><a href="#contact">Driver help centre</a></li>
                <li><a href="#contact">Host support</a></li>
                <li><button className="link" onClick={() => setPrivacyOpen(true)}>Privacy &amp; terms</button></li>
                <li><a href={`mailto:${c.contact.email}`}>{c.contact.email}</a></li>
                <li><button className="sv-admin-link" onClick={openAdmin}>⚙ Admin</button></li>
              </ul>
            </div>
          </div>
          <div className="sv-footer-inner">
            <p>© {new Date().getFullYear()} SABHIVOLT · {c.contact.address}</p>
            <span className="sv-status-badge"><span className="dot" aria-hidden="true" />System status: operational</span>
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
