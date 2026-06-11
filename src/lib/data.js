import { createClient } from "@supabase/supabase-js";
import { normalizeContent } from "./content";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Null when env vars aren't set — the site still renders with default content. */
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export const backendConfigured = !!supabase;

/* ── content ──────────────────────────────────────────── */

export async function loadContent() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("site_content")
    .select("content")
    .eq("key", "live")
    .maybeSingle();
  if (error || !data) return null;
  return normalizeContent(data.content);
}

export async function saveContent(content) {
  if (!supabase) return false;
  // keep one backup of the version being replaced
  const { data: live } = await supabase
    .from("site_content")
    .select("content")
    .eq("key", "live")
    .maybeSingle();
  if (live?.content) {
    await supabase.from("site_content").upsert({ key: "backup", content: live.content, updated_at: new Date().toISOString() });
  }
  const { error } = await supabase
    .from("site_content")
    .upsert({ key: "live", content, updated_at: new Date().toISOString() });
  return !error;
}

export async function loadBackup() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("site_content")
    .select("content")
    .eq("key", "backup")
    .maybeSingle();
  if (error || !data) return null;
  return normalizeContent(data.content);
}

/* ── enquiries ────────────────────────────────────────── */

export async function submitEnquiry(entry) {
  if (!supabase) return false;
  const { error } = await supabase.from("enquiries").insert({
    name: entry.name,
    phone: entry.phone,
    email: entry.email,
    interest: entry.interest,
    message: entry.message,
  });
  if (error) return false;
  // fire-and-forget notification; never block the user on it
  fetch("/api/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  }).catch(() => {});
  return true;
}

export async function listEnquiries() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false });
  return error ? [] : data;
}

export async function setEnquiryRead(id, read) {
  if (!supabase) return false;
  const { error } = await supabase.from("enquiries").update({ read }).eq("id", id);
  return !error;
}

export async function deleteEnquiry(id) {
  if (!supabase) return false;
  const { error } = await supabase.from("enquiries").delete().eq("id", id);
  return !error;
}

/* ── auth ─────────────────────────────────────────────── */

export async function signIn(email, password) {
  if (!supabase) return { error: "Backend not configured" };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message || null };
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session || null;
}

export function onAuthChange(cb) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session));
  return () => data.subscription.unsubscribe();
}
