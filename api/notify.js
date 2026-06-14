// Vercel serverless function: emails you when a *verified* enquiry arrives.
//
// Security model: the browser only sends the new enquiry's `id`. This function
// looks the row up in Supabase using the service-role key and emails its
// DB-stored contents. That means the endpoint can't be abused to send arbitrary
// spam — a payload only results in an email if it corresponds to a real row that
// was just inserted under Supabase's row-level-security policies.
//
// Required env (set in Vercel): RESEND_API_KEY, NOTIFY_EMAIL, SUPABASE_URL,
// SUPABASE_SERVICE_ROLE_KEY. Optional: NOTIFY_FROM, ALLOWED_ORIGIN.

const RATE_WINDOW_MS = 10_000;
const lastSeen = new Map(); // best-effort, per warm instance

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key || !to || !supabaseUrl || !serviceKey) {
    return res.status(200).json({ skipped: "notification not configured" });
  }

  // Optional origin allowlist (comma-separated).
  const allowed = (process.env.ALLOWED_ORIGIN || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const origin = req.headers.origin || "";
  if (allowed.length && origin && !allowed.some((a) => origin === a)) {
    return res.status(403).json({ error: "Forbidden origin" });
  }

  const { id } = req.body || {};
  if (!id || typeof id !== "string") return res.status(400).json({ error: "Missing enquiry id" });

  // crude per-instance rate limit
  const now = Date.now();
  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  const prev = lastSeen.get(ip) || 0;
  if (now - prev < RATE_WINDOW_MS) return res.status(429).json({ error: "Too many requests" });
  lastSeen.set(ip, now);

  try {
    // Verify the enquiry exists; trust DB contents, not the request body.
    const lookup = await fetch(
      `${supabaseUrl}/rest/v1/enquiries?id=eq.${encodeURIComponent(id)}&select=name,phone,email,interest,message,created_at`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    );
    if (!lookup.ok) throw new Error(`Supabase ${lookup.status}`);
    const rows = await lookup.json();
    const enq = Array.isArray(rows) ? rows[0] : null;
    if (!enq) return res.status(404).json({ error: "Enquiry not found" });

    const html = `
      <h2>New SABHIVOLT enquiry</h2>
      <p><b>Name:</b> ${escapeHtml(enq.name)}</p>
      <p><b>Phone:</b> ${escapeHtml(enq.phone)}</p>
      <p><b>Email:</b> ${escapeHtml(enq.email)}</p>
      <p><b>Interest:</b> ${escapeHtml(enq.interest)}</p>
      <p><b>Message:</b><br/>${escapeHtml(enq.message).replace(/\n/g, "<br/>")}</p>
    `;

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM || "SABHIVOLT Website <onboarding@resend.dev>",
        to: [to],
        subject: `New enquiry: ${enq.interest || "General"} — ${enq.name}`,
        html,
      }),
    });
    if (!r.ok) throw new Error(`Resend ${r.status}`);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("notify failed", e);
    return res.status(200).json({ ok: false });
  }
}

function escapeHtml(s) {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}
