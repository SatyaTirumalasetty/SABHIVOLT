import React, { useState, useRef } from "react";
import { INTEREST_OPTIONS } from "../lib/content";
import { submitEnquiry, signIn, backendConfigured } from "../lib/data";
import { useDialogA11y } from "../lib/a11y";

const MIN_SUBMIT_GAP_MS = 30_000;

/* ── public enquiry form ──────────────────────────────── */

export function EnquiryForm({ onOpenPrivacy }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    interest: INTEREST_OPTIONS[0],
    message: "",
    website: "", // honeypot — humans never see or fill this
  });
  const [state, setState] = useState(""); // '', sending, done, err, invalid, slow
  const lastSubmitRef = useRef(0);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (form.website.trim() !== "") {
      setState("done");
      return;
    } // bot trap
    if (!form.name.trim() || (!form.phone.trim() && !form.email.trim())) {
      setState("invalid");
      return;
    }
    const now = Date.now();
    if (now - lastSubmitRef.current < MIN_SUBMIT_GAP_MS) {
      setState("slow");
      return;
    }
    setState("sending");
    const ok = await submitEnquiry({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      interest: form.interest,
      message: form.message.trim(),
    });
    if (ok) {
      lastSubmitRef.current = now;
      setState("done");
    } else {
      setState("err");
    }
  };

  return (
    <div className="sv-form">
      <div aria-live="polite" className="sv-sr-only">
        {state === "done" && "Your enquiry has been received."}
        {state === "err" && "Your enquiry could not be sent. Please try again."}
        {state === "invalid" && "Please add your name and a phone number or email."}
      </div>

      {state === "done" ? (
        <div className="sv-success">
          <span className="tick" aria-hidden="true">
            ✓
          </span>
          <h3>Enquiry received</h3>
          <p>
            Thanks{form.name ? `, ${form.name.split(" ")[0]}` : ""}. We'll get back to you within
            two working days.
          </p>
        </div>
      ) : (
        <>
          <h3>Send an enquiry</h3>
          <div className="sv-form-row">
            <div className="sv-field">
              <label htmlFor="enq-name">Name *</label>
              <input id="enq-name" value={form.name} onChange={set("name")} autoComplete="name" />
            </div>
            <div className="sv-field">
              <label htmlFor="enq-phone">Phone</label>
              <input
                id="enq-phone"
                value={form.phone}
                onChange={set("phone")}
                autoComplete="tel"
                inputMode="tel"
              />
            </div>
          </div>
          <div className="sv-field">
            <label htmlFor="enq-email">Email</label>
            <input
              id="enq-email"
              value={form.email}
              onChange={set("email")}
              autoComplete="email"
              inputMode="email"
            />
          </div>
          <div className="sv-field">
            <label htmlFor="enq-interest">I'm interested in</label>
            <select id="enq-interest" value={form.interest} onChange={set("interest")}>
              {INTEREST_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div className="sv-field">
            <label htmlFor="enq-message">Message</label>
            <textarea
              id="enq-message"
              value={form.message}
              onChange={set("message")}
              placeholder="Tell us about your land, fleet or project…"
            />
          </div>
          <div className="sv-hp" aria-hidden="true">
            <label htmlFor="enq-website">Website</label>
            <input
              id="enq-website"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={set("website")}
            />
          </div>
          <button className="sv-btn sv-btn-solid" onClick={submit} disabled={state === "sending"}>
            {state === "sending" ? "Sending…" : "Send enquiry"}
          </button>
          {state === "invalid" && (
            <p className="sv-form-note err">Add your name and at least a phone number or email.</p>
          )}
          {state === "err" && (
            <p className="sv-form-note err">
              {backendConfigured
                ? "Couldn't send right now — please try again."
                : "The form isn't connected yet — please email or call us instead."}
            </p>
          )}
          {state === "slow" && (
            <p className="sv-form-note err">Please wait a moment before sending another enquiry.</p>
          )}
          <p className="sv-consent">
            By sending this enquiry you agree that SABHIVOLT may use these details to respond to
            you. See our <button onClick={onOpenPrivacy}>privacy &amp; terms</button>.
          </p>
        </>
      )}
    </div>
  );
}

/* ── admin login (Supabase email + password) ──────────── */

export function LoginModal({ onSuccess, onCancel }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);
  useDialogA11y(ref, onCancel);

  const tryLogin = async () => {
    if (busy) return;
    setBusy(true);
    setErr("");
    const { error } = await signIn(email.trim(), password);
    setBusy(false);
    if (error) {
      setErr(
        backendConfigured
          ? "Sign-in failed. Check your email and password."
          : "Backend not configured — set Supabase env vars first."
      );
      setPassword("");
    } else {
      onSuccess();
    }
  };

  return (
    <div className="sv-overlay" role="dialog" aria-modal="true" aria-label="Admin sign in">
      <div className="sv-modal" ref={ref} style={{ width: "min(420px, 100%)" }}>
        <h2>Admin sign in</h2>
        <p>Sign in with your SABHIVOLT admin account to manage content and enquiries.</p>
        <div className="sv-field">
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErr("");
            }}
          />
        </div>
        <div className="sv-field">
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErr("");
            }}
            onKeyDown={(e) => e.key === "Enter" && tryLogin()}
          />
        </div>
        <div aria-live="polite">{err && <p className="err">{err}</p>}</div>
        <div className="sv-modal-row">
          <button className="sv-btn sv-btn-solid" onClick={tryLogin} disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <button className="sv-btn sv-btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
