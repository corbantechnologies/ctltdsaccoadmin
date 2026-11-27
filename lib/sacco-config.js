export const SACCO_CONFIG = {
  name: process.env.NEXT_PUBLIC_SACCO_NAME || "Wananchi Mali",
  shortName: process.env.NEXT_PUBLIC_SACCO_SHORT_NAME || "Wananchi Mali",
  tagline: process.env.NEXT_PUBLIC_SACCO_TAGLINE || "Empowerment through equity, inclusion, and governance",
  supportEmail: process.env.NEXT_PUBLIC_SACCO_SUPPORT_EMAIL || "support@wananchimali.com",
  logoUrl: process.env.NEXT_PUBLIC_SACCO_LOGO_URL || "/wananchiLogoNoBg.png",
  logoSmallUrl: process.env.NEXT_PUBLIC_SACCO_LOGO_SMALL_URL || "/wananchiLogoNoBg.png",
  primaryColor: process.env.NEXT_PUBLIC_SACCO_PRIMARY_COLOR || "#174271",
  accentColor: process.env.NEXT_PUBLIC_SACCO_ACCENT_COLOR || "#236c2e",
  primaryHoverColor: process.env.NEXT_PUBLIC_SACCO_PRIMARY_HOVER_COLOR || "#12345a",
  accentHoverColor: process.env.NEXT_PUBLIC_SACCO_ACCENT_HOVER_COLOR || "#1a5222",
  memberUrl: process.env.NEXT_PUBLIC_MEMBER_URL || "",
  adminUrl: process.env.NEXT_PUBLIC_ADMIN_URL || "",
  superuserUrl: process.env.NEXT_PUBLIC_SUPERUSER_URL || "",
  // M-Pesa STK Push is opt-in: most SACCOs have the treasurer record payments.
  // Set NEXT_PUBLIC_MPESA_ENABLED=true only for SACCOs with a Daraja paybill
  // (and MPESA_ENABLED=True on the API). NEXT_PUBLIC_ENABLE_MPESA is the old name.
  enableMpesa:
    process.env.NEXT_PUBLIC_MPESA_ENABLED === "true" ||
    process.env.NEXT_PUBLIC_ENABLE_MPESA === "true",
  // Savings withdrawals are opt-in, because many SACCOs don't allow them.
  // Pair with SAVINGS_WITHDRAWALS_ENABLED=True on the API.
  enableWithdrawals: process.env.NEXT_PUBLIC_WITHDRAWALS_ENABLED === "true",
  // Advanced accounting screens (month-end, suspense, periods, dividends,
  // opening balances, reconciliation, settings) are opt-in per SACCO, because
  // several of them post to the GL. Set NEXT_PUBLIC_ACCOUNTING_ENABLED=true
  // only after the SACCO has been set up and its staff shown how to use them.
  enableAccounting: process.env.NEXT_PUBLIC_ACCOUNTING_ENABLED === "true",
};

// ---------------------------------------------------------------------------
// SACCO Settings from the API. The values above come from Vercel env vars and
// are only the fallback: the root layout loads /api/v1/settings/public/ and
// applySaccoSettings() overwrites them with whatever is set on the SACCO
// Settings page. A setting left empty there keeps the env value.
// ---------------------------------------------------------------------------
// The API's own defaults. A new database starts with these, so they must not
// replace a real value that is still only set in Vercel.
const API_DEFAULTS = { sacco_name: "Wananchi Mali", support_email: "support@wananchimali.com" };

const TEXT_KEYS = {
  sacco_name: "name",
  short_name: "shortName",
  tagline: "tagline",
  support_email: "supportEmail",
  support_phone: "supportPhone",
  physical_address: "physicalAddress",
  website_url: "websiteUrl",
  primary_color: "primaryColor",
  accent_color: "accentColor",
  primary_hover_color: "primaryHoverColor",
  accent_hover_color: "accentHoverColor",
  member_portal_url: "memberUrl",
  admin_portal_url: "adminUrl",
  superuser_portal_url: "superuserUrl",
};

const SWITCH_KEYS = {
  mpesa_enabled: "enableMpesa",
  withdrawals_enabled: "enableWithdrawals",
  accounting_enabled: "enableAccounting",
};

// The API builds logo links from the request it received, which can come out
// as http:// behind Railway's proxy. Rebuild them on the public API address.
function apiLogoUrl(url) {
  if (!url) return null;
  const base = (process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/+$/, "");
  try {
    const parsed = new URL(url, base || "http://localhost");
    return base ? `${base}${parsed.pathname}${parsed.search}` : url;
  } catch {
    return null;
  }
}

// The env values, kept so a setting cleared on the settings page goes back to them.
const ENV_CONFIG = { ...SACCO_CONFIG };
let appliedFrom = null;

function darken(hex, amount = 0.15) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const channel = (shift) => Math.round(((n >> shift) & 255) * (1 - amount));
  return "#" + [16, 8, 0].map((shift) => channel(shift).toString(16).padStart(2, "0")).join("");
}

export function applySaccoSettings(settings) {
  if (!settings || typeof settings !== "object" || appliedFrom === settings) return SACCO_CONFIG;
  appliedFrom = settings;
  Object.assign(SACCO_CONFIG, ENV_CONFIG);
  for (const [apiKey, configKey] of Object.entries(TEXT_KEYS)) {
    const value = settings[apiKey];
    if (typeof value !== "string" || !value.trim()) continue;
    if (API_DEFAULTS[apiKey] === value && ENV_CONFIG[configKey] !== value) continue;
    SACCO_CONFIG[configKey] = value.trim();
  }
  for (const [apiKey, configKey] of Object.entries(SWITCH_KEYS)) {
    if (typeof settings[apiKey] === "boolean") SACCO_CONFIG[configKey] = settings[apiKey];
  }
  // A colour set without its hover shade gets a darker shade of itself.
  if (settings.primary_color && !settings.primary_hover_color) {
    SACCO_CONFIG.primaryHoverColor = darken(SACCO_CONFIG.primaryColor);
  }
  if (settings.accent_color && !settings.accent_hover_color) {
    SACCO_CONFIG.accentHoverColor = darken(SACCO_CONFIG.accentColor);
  }
  const full = apiLogoUrl(settings.logo_full_url);
  const small = apiLogoUrl(settings.logo_small_url);
  if (full) SACCO_CONFIG.logoUrl = full;
  if (small || full) SACCO_CONFIG.logoSmallUrl = small || full;
  return SACCO_CONFIG;
}
