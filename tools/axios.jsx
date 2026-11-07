import axios from "axios";
import { signOut } from "next-auth/react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// The API's login tokens expire (TOKEN_TTL_HOURS on the API, 7 days by
// default) and are renewed on password change, but the portal session can
// outlive them. When the API says the token is no longer valid, sign the user
// out once and send them to the login page instead of leaving every screen
// failing with "Failed to load".
let signingOut = false;

function handleExpiredSession(error) {
  const status = error?.response?.status;
  const detail = String(error?.response?.data?.detail || "").toLowerCase();
  // Pages can fire requests before the session has loaded, sending
  // "Token undefined". Those are retried once the session is ready, so only a
  // real token being rejected means the session is over.
  const sentHeader = String(error?.config?.headers?.Authorization || "");
  const sentRealToken =
    sentHeader.startsWith("Token ") && !/^Token\s*(undefined|null)?\s*$/.test(sentHeader);
  const tokenRejected =
    status === 401 &&
    sentRealToken &&
    (detail.includes("session expired") || detail.includes("invalid token"));

  if (tokenRejected && typeof window !== "undefined" && !signingOut) {
    const onLoginPage = window.location.pathname.startsWith("/login");
    if (!onLoginPage) {
      signingOut = true;
      signOut({ callbackUrl: "/login" });
    }
  }
  return Promise.reject(error);
}

function withSessionHandling(instance) {
  instance.interceptors.response.use((response) => response, handleExpiredSession);
  return instance;
}

export default withSessionHandling(
  axios?.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  })
);

export const apiActions = withSessionHandling(
  axios?.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  })
);

export const apiMultipartActions = withSessionHandling(
  axios?.create({
    baseURL: BASE_URL,
    withCredentials: true,
  })
);
