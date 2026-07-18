import "./globals.css";
import TanstackQueryProvider from "@/providers/TanstackQueryProvider";
import NextAuthProvider from "@/providers/NextAuthProvider";
import { Toaster } from "react-hot-toast";
import { Theme } from "@radix-ui/themes";
import { Analytics } from "@vercel/analytics/next";
import { SACCO_CONFIG } from "@/lib/sacco-config";

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={{
      '--primary': SACCO_CONFIG.primaryColor,
      '--primary-hover': SACCO_CONFIG.primaryHoverColor,
      '--accent': SACCO_CONFIG.accentColor,
      '--accent-hover': SACCO_CONFIG.accentHoverColor,
      '--ring': SACCO_CONFIG.primaryColor,
      '--sidebar-primary': SACCO_CONFIG.primaryColor,
      '--sidebar-ring': SACCO_CONFIG.primaryColor,
      '--admin-primary': SACCO_CONFIG.primaryColor,
      '--admin-ring': SACCO_CONFIG.primaryColor,
    }}>
      <head>
        <title>{SACCO_CONFIG.name}</title>
        <meta name="description" content={SACCO_CONFIG.tagline} />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content={SACCO_CONFIG.primaryColor} />
        <link rel="apple-touch-icon" href={SACCO_CONFIG.logoUrl} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={SACCO_CONFIG.shortName} />
      </head>
      <body>
        <Toaster position="top-center" />
        <Analytics />
        <NextAuthProvider>
          <TanstackQueryProvider>
            <Theme>{children}</Theme>
          </TanstackQueryProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
