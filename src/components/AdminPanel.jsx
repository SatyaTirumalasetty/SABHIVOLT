import React, { useState, useEffect, useRef } from "react";
import { DEFAULT_CONTENT, deepClone } from "../lib/content";
import { listEnquiries, setEnquiryRead, deleteEnquiry, loadBackup, signOut } from "../lib/data";
import { useDialogA11y } from "../lib/a11y";
import { Field } from "./widgets";

const ICON_OPTIONS = [
  "briefcase",
  "home",
  "store",
  "building",
  "car",
  "truck",
  "bag",
  "zap",
  "plug",
];

function IconSelect({ label, value, onChange }) {
  return (
    <div className="sv-field">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {ICON_OPTIONS.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export function AdminPanel({ content, onSave, onClose, onSignedOut }) {
  const [tab, setTab] = useState("content");
  const [draft, setDraft] = useState(deepClone(content));
  const [saveState, setSaveState] = useState("");
  const [enquiries, setEnquiries] = useState([]);
  const [confirmReset, setConfirmReset] = useState(false);
  const [csvText, setCsvText] = useState("");
  const panelRef = useRef(null);
  useDialogA11y(panelRef, onClose);

  useEffect(() => {
    listEnquiries().then(setEnquiries);
  }, []);

  const unread = enquiries.filter((e) => !e.read).length;

  const set = (path, value) => {
    setDraft((d) => {
      const next = deepClone(d);
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  /** patch item i of the array at `path` with `{key: value}` */
  const patchItem = (path, i, patch) => {
    const keys = path.split(".");
    let arr = draft;
    for (const k of keys) arr = arr[k];
    const next = arr.map((x, j) => (j === i ? { ...x, ...patch } : x));
    set(path, next);
  };
  const removeItem = (path, i) => {
    const keys = path.split(".");
    let arr = draft;
    for (const k of keys) arr = arr[k];
    set(
      path,
      arr.filter((_, j) => j !== i)
    );
  };

  const flashSave = (ok) => {
    setSaveState(ok ? "saved" : "error");
    setTimeout(() => setSaveState(""), 2200);
  };
  const save = async () => {
    setSaveState("saving");
    flashSave(await onSave(draft));
  };
  const resetDefaults = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    const fresh = deepClone(DEFAULT_CONTENT);
    setDraft(fresh);
    setConfirmReset(false);
    setSaveState("saving");
    flashSave(await onSave(fresh));
  };
  const restoreBackup = async () => {
    const prev = await loadBackup();
    if (!prev) {
      flashSave(false);
      return;
    }
    setDraft(prev);
    setSaveState("saving");
    flashSave(await onSave(prev));
  };

  const toggleRead = async (e) => {
    const ok = await setEnquiryRead(e.id, !e.read);
    if (ok) setEnquiries((list) => list.map((x) => (x.id === e.id ? { ...x, read: !x.read } : x)));
  };
  const remove = async (id) => {
    const ok = await deleteEnquiry(id);
    if (ok) setEnquiries((list) => list.filter((x) => x.id !== id));
  };

  const exportCsv = () => {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [
      ["Date", "Name", "Phone", "Email", "Interest", "Message", "Status"].map(esc).join(","),
      ...enquiries.map((e) =>
        [
          new Date(e.created_at).toLocaleString("en-IN"),
          e.name,
          e.phone,
          e.email,
          e.interest,
          e.message,
          e.read ? "Read" : "New",
        ]
          .map(esc)
          .join(",")
      ),
    ];
    setCsvText(rows.join("\n"));
  };

  const handleSignOut = async () => {
    await signOut();
    onSignedOut();
  };

  return (
    <div className="sv-admin" role="dialog" aria-modal="true" aria-label="Site admin">
      <div className="sv-admin-panel" ref={panelRef}>
        <div className="sv-admin-head">
          <h2>Site admin</h2>
          <button className="sv-admin-close" onClick={onClose} aria-label="Close admin">
            ✕
          </button>
        </div>
        <p className="sv-admin-sub">
          Manage site content, enquiries and settings. Esc closes this panel.
        </p>

        <div className="sv-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === "content"}
            className={`sv-tab ${tab === "content" ? "active" : ""}`}
            onClick={() => setTab("content")}
          >
            Content
          </button>
          <button
            role="tab"
            aria-selected={tab === "enquiries"}
            className={`sv-tab ${tab === "enquiries" ? "active" : ""}`}
            onClick={() => setTab("enquiries")}
          >
            Enquiries{unread > 0 && <span className="sv-badge">{unread}</span>}
          </button>
          <button
            role="tab"
            aria-selected={tab === "settings"}
            className={`sv-tab ${tab === "settings" ? "active" : ""}`}
            onClick={() => setTab("settings")}
          >
            Settings
          </button>
        </div>

        {tab === "content" && (
          <>
            <h3>Hero</h3>
            <Field label="Badge" value={draft.hero.badge} onChange={(v) => set("hero.badge", v)} />
            <Field
              label="Headline — wrap a word in [brackets] to highlight it"
              value={draft.hero.headline}
              onChange={(v) => set("hero.headline", v)}
              textarea
            />
            <Field
              label="Subheadline"
              value={draft.hero.subheadline}
              onChange={(v) => set("hero.subheadline", v)}
              textarea
            />
            <Field
              label="Primary button"
              value={draft.hero.ctaPrimary}
              onChange={(v) => set("hero.ctaPrimary", v)}
            />
            <Field
              label="Secondary button"
              value={draft.hero.ctaSecondary}
              onChange={(v) => set("hero.ctaSecondary", v)}
            />
            {draft.hero.trust.map((t, i) => (
              <div className="sv-admin-card" key={i}>
                <div className="sv-admin-card-head">
                  <b>TRUST CHIP {i + 1}</b>
                  <button
                    className="sv-mini-btn danger"
                    onClick={() => removeItem("hero.trust", i)}
                  >
                    Remove
                  </button>
                </div>
                <Field
                  label="Label"
                  value={t}
                  onChange={(v) =>
                    set(
                      "hero.trust",
                      draft.hero.trust.map((x, j) => (j === i ? v : x))
                    )
                  }
                />
              </div>
            ))}
            <button
              className="sv-mini-btn add"
              onClick={() => set("hero.trust", [...draft.hero.trust, "New badge"])}
            >
              + Add trust chip
            </button>

            <h3>Command-center dashboard (hero visual)</h3>
            <Field
              label="Node name"
              value={draft.dashboard.node}
              onChange={(v) => set("dashboard.node", v)}
            />
            <Field
              label="Status"
              value={draft.dashboard.status}
              onChange={(v) => set("dashboard.status", v)}
            />
            <Field
              label="Revenue value"
              value={draft.dashboard.revenue}
              onChange={(v) => set("dashboard.revenue", v)}
            />
            <Field
              label="Revenue delta"
              value={draft.dashboard.revenueDelta}
              onChange={(v) => set("dashboard.revenueDelta", v)}
            />
            <Field
              label="Ports active"
              value={draft.dashboard.portsActive}
              onChange={(v) => set("dashboard.portsActive", v)}
            />
            <Field
              label="Ports total"
              value={draft.dashboard.portsTotal}
              onChange={(v) => set("dashboard.portsTotal", v)}
            />
            <Field
              label="Load cap"
              value={draft.dashboard.loadCap}
              onChange={(v) => set("dashboard.loadCap", v)}
            />

            <h3>Stats — numeric values count up on scroll</h3>
            {draft.stats.map((s, i) => (
              <div className="sv-admin-card" key={i}>
                <div className="sv-admin-card-head">
                  <b>STAT {i + 1}</b>
                  <button className="sv-mini-btn danger" onClick={() => removeItem("stats", i)}>
                    Remove
                  </button>
                </div>
                <Field
                  label="Value"
                  value={s.value}
                  onChange={(v) => patchItem("stats", i, { value: v })}
                />
                <Field
                  label="Label"
                  value={s.label}
                  onChange={(v) => patchItem("stats", i, { label: v })}
                />
              </div>
            ))}
            <button
              className="sv-mini-btn add"
              onClick={() => set("stats", [...draft.stats, { value: "", label: "" }])}
            >
              + Add stat
            </button>

            <h3>Trusted-by logos</h3>
            {draft.partners.map((p, i) => (
              <div className="sv-admin-card" key={i}>
                <div className="sv-admin-card-head">
                  <b>PARTNER {i + 1}</b>
                  <button className="sv-mini-btn danger" onClick={() => removeItem("partners", i)}>
                    Remove
                  </button>
                </div>
                <Field
                  label="Name"
                  value={p}
                  onChange={(v) =>
                    set(
                      "partners",
                      draft.partners.map((x, j) => (j === i ? v : x))
                    )
                  }
                />
              </div>
            ))}
            <button
              className="sv-mini-btn add"
              onClick={() => set("partners", [...draft.partners, "New partner"])}
            >
              + Add partner
            </button>

            <h3>Commercial solutions</h3>
            <Field
              label="Eyebrow"
              value={draft.solutions.eyebrow}
              onChange={(v) => set("solutions.eyebrow", v)}
            />
            <Field
              label="Headline"
              value={draft.solutions.headline}
              onChange={(v) => set("solutions.headline", v)}
            />
            <Field
              label="Body"
              value={draft.solutions.body}
              onChange={(v) => set("solutions.body", v)}
              textarea
            />
            {draft.solutions.items.map((s, i) => (
              <div className="sv-admin-card" key={i}>
                <div className="sv-admin-card-head">
                  <b>SOLUTION {i + 1}</b>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="sv-mini-btn ok"
                      onClick={() =>
                        set(
                          "solutions.items",
                          draft.solutions.items.map((x, j) => ({
                            ...x,
                            highlight: j === i ? !x.highlight : x.highlight,
                          }))
                        )
                      }
                    >
                      {s.highlight ? "★ High ROI" : "Mark High ROI"}
                    </button>
                    <button
                      className="sv-mini-btn danger"
                      onClick={() => removeItem("solutions.items", i)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <IconSelect
                  label="Icon"
                  value={s.icon}
                  onChange={(v) => patchItem("solutions.items", i, { icon: v })}
                />
                <Field
                  label="Title"
                  value={s.title}
                  onChange={(v) => patchItem("solutions.items", i, { title: v })}
                />
                <Field
                  label="Description"
                  value={s.description}
                  textarea
                  onChange={(v) => patchItem("solutions.items", i, { description: v })}
                />
                <Field
                  label="Link text"
                  value={s.cta}
                  onChange={(v) => patchItem("solutions.items", i, { cta: v })}
                />
              </div>
            ))}
            <button
              className="sv-mini-btn add"
              onClick={() =>
                set("solutions.items", [
                  ...draft.solutions.items,
                  { icon: "zap", title: "", description: "", cta: "Learn more", highlight: false },
                ])
              }
            >
              + Add solution
            </button>

            <h3>Network</h3>
            <Field
              label="Eyebrow"
              value={draft.network.eyebrow}
              onChange={(v) => set("network.eyebrow", v)}
            />
            <Field
              label="Headline"
              value={draft.network.headline}
              onChange={(v) => set("network.headline", v)}
            />
            <Field
              label="Body"
              value={draft.network.body}
              onChange={(v) => set("network.body", v)}
              textarea
            />
            {draft.network.chargerTypes.map((t, i) => (
              <div className="sv-admin-card" key={i}>
                <div className="sv-admin-card-head">
                  <b>CHARGER TYPE {i + 1}</b>
                  <button
                    className="sv-mini-btn danger"
                    onClick={() => removeItem("network.chargerTypes", i)}
                  >
                    Remove
                  </button>
                </div>
                <IconSelect
                  label="Icon"
                  value={t.icon}
                  onChange={(v) => patchItem("network.chargerTypes", i, { icon: v })}
                />
                <Field
                  label="Title"
                  value={t.title}
                  onChange={(v) => patchItem("network.chargerTypes", i, { title: v })}
                />
                <Field
                  label="Description"
                  value={t.description}
                  textarea
                  onChange={(v) => patchItem("network.chargerTypes", i, { description: v })}
                />
              </div>
            ))}
            <button
              className="sv-mini-btn add"
              onClick={() =>
                set("network.chargerTypes", [
                  ...draft.network.chargerTypes,
                  { icon: "zap", title: "", description: "" },
                ])
              }
            >
              + Add charger type
            </button>

            <p className="sv-admin-sub">
              Status sets the map node colour: Headquarters/Live = emerald, In development = amber,
              anything else = grey.
            </p>
            {draft.network.locations.map((l, i) => (
              <div className="sv-admin-card" key={i}>
                <div className="sv-admin-card-head">
                  <b>LOCATION {i + 1}</b>
                  <button
                    className="sv-mini-btn danger"
                    onClick={() => removeItem("network.locations", i)}
                  >
                    Remove
                  </button>
                </div>
                <Field
                  label="Name"
                  value={l.name}
                  onChange={(v) => patchItem("network.locations", i, { name: v })}
                />
                <Field
                  label="Status (Live / Headquarters / In development / Planned)"
                  value={l.status}
                  onChange={(v) => patchItem("network.locations", i, { status: v })}
                />
                <Field
                  label="Detail"
                  value={l.detail}
                  onChange={(v) => patchItem("network.locations", i, { detail: v })}
                />
                <Field
                  label="Speed (e.g. 480kW ultrafast)"
                  value={l.speed ?? ""}
                  onChange={(v) => patchItem("network.locations", i, { speed: v })}
                />
                <Field
                  label="Ports"
                  value={l.ports ?? ""}
                  onChange={(v) => patchItem("network.locations", i, { ports: v })}
                />
                <div className="sv-form-row">
                  <Field
                    label="Latitude"
                    value={l.lat ?? ""}
                    onChange={(v) => patchItem("network.locations", i, { lat: v })}
                  />
                  <Field
                    label="Longitude"
                    value={l.lon ?? ""}
                    onChange={(v) => patchItem("network.locations", i, { lon: v })}
                  />
                </div>
              </div>
            ))}
            <button
              className="sv-mini-btn add"
              onClick={() =>
                set("network.locations", [
                  ...draft.network.locations,
                  {
                    name: "",
                    status: "Planned",
                    detail: "",
                    lat: "15.90",
                    lon: "79.70",
                    speed: "",
                    ports: "",
                  },
                ])
              }
            >
              + Add location
            </button>

            <h3>Driver app</h3>
            <Field
              label="Badge"
              value={draft.driver.badge}
              onChange={(v) => set("driver.badge", v)}
            />
            <Field
              label="Headline"
              value={draft.driver.headline}
              onChange={(v) => set("driver.headline", v)}
            />
            <Field
              label="Body"
              value={draft.driver.body}
              onChange={(v) => set("driver.body", v)}
              textarea
            />
            {draft.driver.features.map((f, i) => (
              <div className="sv-admin-card" key={i}>
                <div className="sv-admin-card-head">
                  <b>FEATURE {i + 1}</b>
                  <button
                    className="sv-mini-btn danger"
                    onClick={() => removeItem("driver.features", i)}
                  >
                    Remove
                  </button>
                </div>
                <Field
                  label="Text"
                  value={f}
                  onChange={(v) =>
                    set(
                      "driver.features",
                      draft.driver.features.map((x, j) => (j === i ? v : x))
                    )
                  }
                />
              </div>
            ))}
            <button
              className="sv-mini-btn add"
              onClick={() => set("driver.features", [...draft.driver.features, "New feature"])}
            >
              + Add feature
            </button>

            <h3>About</h3>
            <Field
              label="Eyebrow"
              value={draft.about.eyebrow}
              onChange={(v) => set("about.eyebrow", v)}
            />
            <Field
              label="Headline"
              value={draft.about.headline}
              onChange={(v) => set("about.headline", v)}
            />
            <Field
              label="Body"
              value={draft.about.body}
              onChange={(v) => set("about.body", v)}
              textarea
            />
            {draft.about.values.map((val, i) => (
              <div className="sv-admin-card" key={i}>
                <div className="sv-admin-card-head">
                  <b>VALUE {i + 1}</b>
                  <button
                    className="sv-mini-btn danger"
                    onClick={() => removeItem("about.values", i)}
                  >
                    Remove
                  </button>
                </div>
                <Field
                  label="Title"
                  value={val.title}
                  onChange={(v) => patchItem("about.values", i, { title: v })}
                />
                <Field
                  label="Text"
                  value={val.text}
                  textarea
                  onChange={(v) => patchItem("about.values", i, { text: v })}
                />
              </div>
            ))}
            <button
              className="sv-mini-btn add"
              onClick={() => set("about.values", [...draft.about.values, { title: "", text: "" }])}
            >
              + Add value
            </button>

            <h3>Contact</h3>
            <Field
              label="Eyebrow"
              value={draft.contact.eyebrow}
              onChange={(v) => set("contact.eyebrow", v)}
            />
            <Field
              label="Headline"
              value={draft.contact.headline}
              onChange={(v) => set("contact.headline", v)}
            />
            <Field
              label="Body"
              value={draft.contact.body}
              onChange={(v) => set("contact.body", v)}
              textarea
            />
            <Field
              label="Email"
              value={draft.contact.email}
              onChange={(v) => set("contact.email", v)}
            />
            <Field
              label="Phone"
              value={draft.contact.phone}
              onChange={(v) => set("contact.phone", v)}
            />
            <Field
              label="Address"
              value={draft.contact.address}
              onChange={(v) => set("contact.address", v)}
            />
          </>
        )}

        {tab === "enquiries" && (
          <>
            <h3>Enquiries ({enquiries.length})</h3>
            {enquiries.length > 0 && (
              <button className="sv-mini-btn ok" onClick={exportCsv}>
                Export CSV
              </button>
            )}
            {csvText && (
              <textarea
                className="sv-csv"
                readOnly
                value={csvText}
                onFocus={(e) => e.target.select()}
                aria-label="CSV export"
              />
            )}
            {enquiries.length === 0 && (
              <p className="sv-empty">
                No enquiries yet. Submissions from the contact form will appear here.
              </p>
            )}
            {enquiries.map((e) => (
              <div className={`sv-enq ${e.read ? "" : "unread"}`} key={e.id}>
                <div className="sv-enq-head">
                  <b>{e.name}</b>
                  <span className="sv-enq-date">
                    {new Date(e.created_at).toLocaleString("en-IN")} · {e.read ? "Read" : "New"}
                  </span>
                </div>
                <div className="sv-enq-meta">
                  {e.interest}
                  {e.phone ? ` · ${e.phone}` : ""}
                  {e.email ? ` · ${e.email}` : ""}
                </div>
                {e.message && <div className="sv-enq-msg">{e.message}</div>}
                <div className="sv-enq-actions">
                  <button className="sv-mini-btn ok" onClick={() => toggleRead(e)}>
                    {e.read ? "Mark unread" : "Mark read"}
                  </button>
                  <button className="sv-mini-btn danger" onClick={() => remove(e.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === "settings" && (
          <>
            <h3>Account</h3>
            <p className="sv-admin-sub">
              You're signed in with your Supabase admin account. Manage admin users from the
              Supabase dashboard → Authentication.
            </p>
            <button className="sv-mini-btn ok" onClick={handleSignOut}>
              Sign out
            </button>

            <h3>Backup &amp; restore</h3>
            <p className="sv-admin-sub">
              Every save keeps one backup of the previous version. Restore brings that version back
              and makes the current one the new backup.
            </p>
            <button className="sv-mini-btn ok" onClick={restoreBackup}>
              Restore previous version
            </button>

            <h3>Reset content</h3>
            <p className="sv-admin-sub">
              Restores all site content to the original defaults. Enquiries and accounts are not
              affected. Your current content is kept as the backup.
            </p>
            <button className="sv-mini-btn danger" onClick={resetDefaults}>
              {confirmReset ? "Tap again to confirm reset" : "Reset content to defaults"}
            </button>
            {confirmReset && (
              <button
                className="sv-mini-btn"
                style={{ marginLeft: 8 }}
                onClick={() => setConfirmReset(false)}
              >
                Cancel
              </button>
            )}
          </>
        )}

        {tab === "content" && (
          <div className="sv-admin-actions">
            <button className="sv-btn sv-btn-solid" onClick={save}>
              {saveState === "saving" ? "Saving…" : "Save changes"}
            </button>
            <button className="sv-btn sv-btn-ghost" onClick={onClose}>
              Close
            </button>
            <span aria-live="polite">
              {saveState === "saved" && <span className="sv-save-note saved">✓ Saved</span>}
              {saveState === "error" && (
                <span className="sv-save-note error">Save failed — try again</span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
