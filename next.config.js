import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

// Logos uploaded on the SACCO Settings page are served by the API.
let apiImageHost = [];
try {
  const api = new URL(process.env.NEXT_PUBLIC_BASE_URL || "");
  apiImageHost = [{ protocol: api.protocol.replace(":", ""), hostname: api.hostname, pathname: "/api/v1/settings/logo/**" }];
} catch {
  apiImageHost = [];
}

const nextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      ...apiImageHost,
      {
        protocol: "https",
        hostname: "files.wananchimali.com",
      },
    ],
  },
};

export default withPWA(nextConfig);
