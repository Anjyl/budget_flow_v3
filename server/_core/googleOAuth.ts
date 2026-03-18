import { OAuth2Client } from "google-auth-library";
import { ENV } from "./env";

// Initialize Google OAuth2 Client
// Note: The redirect URI must match exactly what's configured in Google Cloud Console
const oauth2Client = new OAuth2Client(
  ENV.googleClientId,
  ENV.googleClientSecret,
  process.env.GOOGLE_OAUTH_REDIRECT_URI || "http://localhost:3000/api/oauth/google/callback"
);

/**
 * Generate Google OAuth authorization URL
 * @param state - CSRF protection state
 * @returns Authorization URL for redirecting user to Google
 */
export function getGoogleAuthUrl(state: string): string {
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets",
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    state: state,
    prompt: "consent",
  });

  return url;
}

/**
 * Exchange authorization code for tokens
 * @param code - Authorization code from Google
 * @returns Token response with access token and user info
 */
export async function exchangeCodeForTokens(code: string) {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error("[Google OAuth] Failed to exchange code for tokens:", error);
    throw new Error("Failed to exchange authorization code");
  }
}

/**
 * Get user information from Google using access token
 * @param accessToken - Google access token
 * @returns User information (email, name, picture)
 */
export async function getUserInfo(accessToken: string) {
  try {
    const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.statusText}`);
    }

    const userInfo = await response.json();
    return {
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      id: userInfo.id,
    };
  } catch (error) {
    console.error("[Google OAuth] Failed to get user info:", error);
    throw new Error("Failed to retrieve user information");
  }
}

/**
 * Verify and decode ID token
 * @param idToken - ID token from Google
 * @returns Decoded token payload
 */
export async function verifyIdToken(idToken: string) {
  try {
    const ticket = await oauth2Client.verifyIdToken({
      idToken: idToken,
      audience: ENV.googleClientId,
    });

    const payload = ticket.getPayload();
    return payload;
  } catch (error) {
    console.error("[Google OAuth] Failed to verify ID token:", error);
    throw new Error("Failed to verify ID token");
  }
}

/**
 * Refresh access token using refresh token
 * @param refreshToken - Refresh token from Google
 * @returns New access token
 */
export async function refreshAccessToken(refreshToken: string) {
  try {
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials.access_token;
  } catch (error) {
    console.error("[Google OAuth] Failed to refresh access token:", error);
    throw new Error("Failed to refresh access token");
  }
}

export { oauth2Client };
