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

// Lists are paged at 1,000 rows by the API. For lists a page needs in full
// (members, savings accounts, loans), read every page. Pages are requested
// by number rather than through the `next` link, which can come back as
// http:// behind the hosting proxy.
export async function getAllPages(url, token, params = {}) {
  const pageSize = 1000;
  const all = [];
  for (let page = 1; page < 200; page++) {
    const response = await apiActions.get(url, {
      ...token,
      params: { ...params, page, page_size: pageSize },
    });
    const data = response?.data;
    const rows = Array.isArray(data) ? data : data?.results || [];
    all.push(...rows);
    if (Array.isArray(data) || !data?.next || rows.length < pageSize) break;
  }
  return all;
}
