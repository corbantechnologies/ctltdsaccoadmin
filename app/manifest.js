import { getSaccoConfig } from "@/lib/sacco-settings-server";

export default async function manifest() {
  const SACCO_CONFIG = await getSaccoConfig();
  return {
    name: SACCO_CONFIG.name,
    short_name: SACCO_CONFIG.shortName,
    description: SACCO_CONFIG.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: SACCO_CONFIG.primaryColor,
    icons: [
      {
        src: SACCO_CONFIG.logoSmallUrl,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: SACCO_CONFIG.logoUrl,
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
