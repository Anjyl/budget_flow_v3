export { COOKIE_NAME, ONE_YEAR_MS } from "./shared/const";

/**
 * Generate Google OAuth login URL
 * Uses the dynamic window.location.origin to ensure the redirect URI
 * matches the current domain (works across dev, staging, and production)
 */
export const getLoginUrl = () => {
  // Get Google OAuth configuration from environment
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    throw new Error("VITE_GOOGLE_CLIENT_ID is not configured");
  }

  // Build redirect URI dynamically from current origin
  // This ensures it works across all environments
  const redirectUri = `${window.location.origin}/api/oauth/google/callback`;
  
  // Generate CSRF protection state
  const state = btoa(JSON.stringify({
    redirectUri,
    timestamp: Date.now(),
  }));

  // Google OAuth 2.0 authorization endpoint
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  
  // Required parameters
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets",
  ].join(" "));
  url.searchParams.set("state", state);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");

  return url.toString();
};
