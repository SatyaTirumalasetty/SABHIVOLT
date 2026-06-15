import React, { useState, useEffect, useRef } from "react";
import { DEFAULT_CONTENT, deepClone } from "../lib/content";
import {
  listEnquiries, setEnquiryRead, deleteEnquiry,
  loadBackup, signOut,
} from "../lib/data";
import { useDialogA11y } from "../lib/a11y";
import { Field } from "./widgets";

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
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (key === "__proto__" || key === "constructor") return next;
        obj = obj[key];
      }
      const lastKey = keys[keys.length - 1];
      if (lastKey === "__proto__" || lastKey === "constructor") return next;
      obj[lastKey] = value;
      return next;
    });
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
    if (!confirmReset) { setConfirmReset(true); return; }
    const fresh = deepClone(DEFAULT_CONTENT);
    setDraft(fresh);
    setConfirmReset(false);
    setSaveState("saving");
    flashSave(await onSave(fresh));
  };

  const restoreBackup = async () => {
    const prev = await loadBackup();
    if (!prev) { flashSave(false); return; }
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
          e.name, e.phone, e.email, e.interest, e.message,
          e.read ? "Read" : "New",
        ].map(esc).join(",")
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
          <button className="sv-admin-close" onClick={onClose} aria-label="Close admin">✕</button>
        </div>
        <p className="sv-admin-sub">Manage site content, enquiries and settings. Esc closes this panel.</p>

        <div className="sv-tabs" role="tablist">
          <button role="tab" aria-selected={tab === "content"} className={`sv-tab ${tab === "content" ? "active" : ""}`} onClick={() => setTab("content")}>Content</button>
          <button role="tab" aria-selected={tab === "enquiries"} className={`sv-tab ${tab === "enquiries" ? "active" : ""}`} onClick={() => setTab("enquiries")}>
            Enquiries{unread > 0 && <span className="sv-badge">{unread}</span>}
          </button>
          <button role="tab" aria-selected={tab === "settings"} className={`sv-tab ${tab === "settings" ? "active" : ""}`} onClick={() => setTab("settings")}>Settings</button>
        </div>

        {tab === "content" && (
          <>
            <h3>Hero</h3>
            <Field label="Eyebrow" value={draft.hero.eyebrow} onChange={(v) => set("hero.eyebrow", v)} />
            <Field label="Headline — wrap a word in [brackets] to highlight it in teal" value={draft.hero.headline} onChange={(v) => set("hero.headline", v)} textarea />
            <Field label="Subheadline" value={draft.hero.subheadline} onChange={(v) => set("hero.subheadline", v)} textarea />
            <Field label="Primary button" value={draft.hero.ctaPrimary} onChange={(v) => set("hero.ctaPrimary", v)} />
            <Field label="Secondary button" value={draft.hero.ctaSecondary} onChange={(v) => set("hero.ctaSecondary", v)} />

            <h3>Stats — numeric values count up on scroll</h3>
            {draft.stats.map((s, i) => (
              <div className="sv-admin-card" key={i}>
                <div className="sv-admin-card-head">
                  <b>STAT {i + 1}</b>
                  <button className="sv-mini-btn danger" onClick={() => set("stats", draft.stats.filter((_, j) => j !== i))}>Remove</button>
                </div>
                <Field label="Value" value={s.value} onChange={(v) => { const a = [...draft.stats]; a[i] = { ...a[i], value: v }; set("stats", a); }} />
                <Field label="Label" value={s.label} onChange={(v) => { const a = [...draft.stats]; a[i] = { ...a[i], label: v }; set("stats", a); }} />
              </div>
            ))}
            <button className="sv-mini-btn add" onClick={() => set("stats", [...draft.stats, { value: "", label: "" }])}>+ Add stat</button>

            <h3>Services / verticals</h3>
            {draft.services.map((s, i) => (
              <div className="sv-admin-card" key={i}>
                <div className="sv-admin-card-head">
                  <b>{s.code || `SERVICE ${i + 1}`}</b>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="sv-mini-btn ok"
                      onClick={() => {
                        const a = draft.services.map((x, j) => ({ ...x, flagship: j === i ? !x.flagship : false }));
                        set("services", a);
                      }}
                    >
                      {s.flagship ? "★ Flagship" : "Make flagship"}
                    </button>
                    <button className="sv-mini-btn danger" onClick={() => set("services", draft.services.filter((_, j) => j !== i))}>Remove</button>
                  </div>
                </div>
                <Field label="Code (e.g. EV-01)" value={s.code} onChange={(v) => { const a = [...draft.services]; a[i] = { ...a[i], code: v }; set("services", a); }} />
                <Field label="Title" value={s.title} onChange={(v) => { const a = [...draft.services]; a[i] = { ...a[i], title: v }; set("services", a); }} />
                <Field label="Description" value={s.description} textarea onChange={(v) => { const a = [...draft.services]; a[i] = { ...a[i], description: v }; set("services", a); }} />
              </div>
            ))}
            <button className="sv-mini-btn add" onClick={() => set("services", [...draft.services, { code: `XX-0${draft.services.length + 1}`, title: "", description: "" }])}>+ Add service</button>

            <h3>Energy flow diagram</h3>
            <Field label="Eyebrow" value={draft.flow.eyebrow} onChange={(v) => set("flow.eyebrow", v)} />
            <Field label="Headline" value={draft.flow.headline} onChange={(v) => set("flow.headline", v)} />
            <Field label="Body" value={draft.flow.body} onChange={(v) => set("flow.body", v)} textarea />
            {draft.flow.steps.map((s, i) => (
              <div className="sv-admin-card" key={i}>
                <div className="sv-admin-card-head">
                  <b>STEP {i + 1} — {["SOLAR", "STORAGE", "CHARGING", "REVENUE"][i]}</b>
                </div>
                <Field label="Title" value={s.title} onChange={(v) => { const a = [...draft.flow.steps]; a[i] = { ...a[i], title: v }; set("flow.steps", a); }} />
                <Field label="Text" value={s.text} onChange={(v) => { const a = [...draft.flow.steps]; a[i] = { ...a[i], text: v }; set("flow.steps", a); }} />
              </div>
            ))}

            <h3>Network map</h3>
            <Field label="Eyebrow" value={draft.network.eyebrow} onChange={(v) => set("network.eyebrow", v)} />
            <Field label="Headline" value={draft.network.headline} onChange={(v) => set("network.headline", v)} />
            <Field label="Body" value={draft.network.body} onChange={(v) => set("network.body", v)} textarea />
            <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 12 }}>
              Status sets the node colour: Headquarters/Live = teal, In development = amber,
              anything else = grey. Coordinates place the node on the AP map.
            </p>
            {draft.network.locations.map((l, i) => (
              <div className="sv-admin-card" key={i}>
                <div className="sv-admin-card-head">
                  <b>LOCATION {i + 1}</b>
                  <button className="sv-mini-btn danger" onClick={() => set("network.locations", draft.network.locations.filter((_, j) => j !== i))}>Remove</button>
                </div>
                <Field label="Name" value={l.name} onChange={(v) => { const a = [...draft.network.locations]; a[i] = { ...a[i], name: v }; set("network.locations", a); }} />
                <Field label="Status (Live / Headquarters / In development / Planned)" value={l.status} onChange={(v) => { const a = [...draft.network.locations]; a[i] = { ...a[i], status: v }; set("network.locations", a); }} />
                <Field label="Detail" value={l.detail} onChange={(v) => { const a = [...draft.network.locations]; a[i] = { ...a[i], detail: v }; set("network.locations", a); }} />
                <div className="sv-field-row">
                  <Field label="Latitude (e.g. 16.43)" value={l.lat ?? ""} onChange={(v) => { const a = [...draft.network.locations]; a[i] = { ...a[i], lat: v }; set("network.locations", a); }} />
                  <Field label="Longitude (e.g. 80.55)" value={l.lon ?? ""} onChange={(v) => { const a = [...draft.network.locations]; a[i] = { ...a[i], lon: v }; set("network.locations", a); }} />
                </div>
              </div>
            ))}
            <button
              className="sv-mini-btn add"
              onClick={() => set("network.locations", [...draft.network.locations, { name: "", status: "Planned", detail: "", lat: "15.90", lon: "79.70" }])}
            >
              + Add location
            </button>

            <h3>About</h3>
            <Field label="Eyebrow" value={draft.about.eyebrow} onChange={(v) => set("about.eyebrow", v)} />
            <Field label="Headline" value={draft.about.headline} onChange={(v) => set("about.headline", v)} />
            <Field label="Body" value={draft.about.body} onChange={(v) => set("about.body", v)} textarea />
            {draft.about.values.map((val, i) => (
              <div className="sv-admin-card" key={i}>
                <div className="sv-admin-card-head">
                  <b>VALUE {i + 1}</b>
                  <button className="sv-mini-btn danger" onClick={() => set("about.values", draft.about.values.filter((_, j) => j !== i))}>Remove</button>
                </div>
                <Field label="Title" value={val.title} onChange={(v) => { const a = [...draft.about.values]; a[i] = { ...a[i], title: v }; set("about.values", a); }} />
                <Field label="Text" value={val.text} textarea onChange={(v) => { const a = [...draft.about.values]; a[i] = { ...a[i], text: v }; set("about.values", a); }} />
              </div>
            ))}
            <button className="sv-mini-btn add" onClick={() => set("about.values", [...draft.about.values, { title: "", text: "" }])}>+ Add value</button>

            <h3>Contact</h3>
            <Field label="Eyebrow" value={draft.contact.eyebrow} onChange={(v) => set("contact.eyebrow", v)} />
            <Field label="Headline" value={draft.contact.headline} onChange={(v) => set("contact.headline", v)} />
            <Field label="Body" value={draft.contact.body} onChange={(v) => set("contact.body", v)} textarea />
            <Field label="Email" value={draft.contact.email} onChange={(v) => set("contact.email", v)} />
            <Field label="Phone" value={draft.contact.phone} onChange={(v) => set("contact.phone", v)} />
            <Field label="Address" value={draft.contact.address} onChange={(v) => set("contact.address", v)} />
          </>
        )}

        {tab === "enquiries" && (
          <>
            <h3>Enquiries ({enquiries.length})</h3>
            {enquiries.length > 0 && (
              <button className="sv-mini-btn ok" onClick={exportCsv}>Export CSV</button>
            )}
            {csvText && (
              <div className="sv-csv-box">
                <p style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--muted)", marginBottom: 6 }}>
                  Select all and copy — paste into Excel or Google Sheets.
                </p>
                <textarea readOnly value={csvText} onFocus={(e) => e.target.select()} />
              </div>
            )}
            {enquiries.length === 0 && (
              <p className="sv-empty">No enquiries yet. Submissions from the contact form will appear here.</p>
            )}
            {enquiries.map((e) => (
              <div className={`sv-enquiry ${e.read ? "" : "unread"}`} key={e.id}>
                <div className="meta">
                  <span>{new Date(e.created_at).toLocaleString("en-IN")}</span>
                  <span>{e.read ? "READ" : "● NEW"}</span>
                </div>
                <div className="who">{e.name}</div>
                <div className="int">{e.interest}</div>
                {(e.phone || e.email) && (
                  <div className="msg">
                    {e.phone && <>📞 {e.phone}{"  "}</>}
                    {e.email && <>✉ {e.email}</>}
                  </div>
                )}
                {e.message && <div className="msg">{e.message}</div>}
                <div className="row">
                  <button className="sv-mini-btn ok" onClick={() => toggleRead(e)}>
                    {e.read ? "Mark unread" : "Mark read"}
                  </button>
                  <button className="sv-mini-btn danger" onClick={() => remove(e.id)}>Delete</button>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === "settings" && (
          <>
            <h3>Account</h3>
            <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 12 }}>
              You're signed in with your Supabase admin account. Manage admin users (add, remove,
              reset passwords) from the Supabase dashboard → Authentication.
            </p>
            <button className="sv-mini-btn ok" onClick={handleSignOut}>Sign out</button>

            <h3>Backup &amp; restore</h3>
            <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 12 }}>
              Every save keeps one backup of the previous version. Restore brings that version back
              and makes the current one the new backup.
            </p>
            <button className="sv-mini-btn ok" onClick={restoreBackup}>Restore previous version</button>

            <h3>Reset content</h3>
            <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 12 }}>
              Restores all site content to the original defaults. Enquiries and accounts are not
              affected. Your current content is kept as the backup, so this can be undone once via
              Restore.
            </p>
            <button className="sv-mini-btn danger" onClick={resetDefaults}>
              {confirmReset ? "Tap again to confirm reset" : "Reset content to defaults"}
            </button>
            {confirmReset && (
              <button className="sv-mini-btn" style={{ marginLeft: 8 }} onClick={() => setConfirmReset(false)}>Cancel</button>
            )}
          </>
        )}

        {tab === "content" && (
          <div className="sv-admin-actions">
            <button className="sv-btn sv-btn-solid" onClick={save}>
              {saveState === "saving" ? "Saving…" : "Save changes"}
            </button>
            <button className="sv-btn sv-btn-ghost" onClick={onClose}>Close</button>
            <span aria-live="polite">
              {saveState === "saved" && <span className="sv-save-note">✓ Saved</span>}
              {saveState === "error" && <span className="sv-save-note err">Save failed — try again</span>}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
