import { SACCO_CONFIG, applySaccoSettings } from "@/lib/sacco-config";

// How often the portal re-reads SACCO Settings from the API, in seconds.
// A change on the settings page shows within about two minutes (this plus the
// API's own one-minute cache).
export const SETTINGS_REVALIDATE_SECONDS = 60;

// Loads the public SACCO settings (name, logo, colours, contacts, feature
// switches) from the API on the server. Never throws: if the API can't be
// reached, the portal keeps its Vercel env values.
export async function loadSaccoSettings() {
  const base = (process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/+$/, "");
  if (!base) return null;
  try {
    const response = await fetch(`${base}/api/v1/settings/public/`, {
      next: { revalidate: SETTINGS_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const settings = await response.json();
    applySaccoSettings(settings);
    return settings;
  } catch {
    return null;
  }
}

export async function getSaccoConfig() {
  await loadSaccoSettings();
  return SACCO_CONFIG;
}
