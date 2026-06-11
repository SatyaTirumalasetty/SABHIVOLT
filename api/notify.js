// Vercel serverless function: emails you when an enquiry arrives.
// Set RESEND_API_KEY and NOTIFY_EMAIL in Vercel project env vars.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!key || !to) return res.status(200).json({ skipped: "notification not configured" });

  const { name = "", phone = "", email = "", interest = "", message = "" } = req.body || {};
  if (!name) return res.status(400).json({ error: "Missing name" });

  const html = `
    <h2>New SABHIVOLT enquiry</h2>
    <p><b>Name:</b> ${escapeHtml(name)}</p>
    <p><b>Phone:</b> ${escapeHtml(phone)}</p>
    <p><b>Email:</b> ${escapeHtml(email)}</p>
    <p><b>Interest:</b> ${escapeHtml(interest)}</p>
    <p><b>Message:</b><br/>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
  `;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from: "SABHIVOLT Website <onboarding@resend.dev>",
        to: [to],
        subject: `New enquiry: ${interest || "General"} — ${name}`,
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
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
