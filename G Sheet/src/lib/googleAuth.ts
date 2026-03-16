export type GoogleToken = {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
};

declare global {
  interface Window {
    google?: any;
  }
}

const GIS_SRC = "https://accounts.google.com/gsi/client";
const GAPI_SRC = "https://apis.google.com/js/api.js";

function loadScriptOnce(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }

    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed loading script: ${src}`));
    document.head.appendChild(s);
  });
}

export async function ensureGoogleScripts() {
  await Promise.all([loadScriptOnce(GIS_SRC), loadScriptOnce(GAPI_SRC)]);
}

export type GoogleConfig = {
  clientId: string;
  apiKey?: string;
  appId?: string;
};

export const GOOGLE_SCOPES = {
  driveReadonly: "https://www.googleapis.com/auth/drive.readonly",
  sheets: "https://www.googleapis.com/auth/spreadsheets",
};

export async function requestAccessToken(args: {
  clientId: string;
  scope: string;
}): Promise<GoogleToken> {
  await ensureGoogleScripts();

  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: args.clientId,
      scope: args.scope,
      callback: (resp: any) => {
        if (resp?.error) reject(new Error(resp.error));
        else resolve(resp as GoogleToken);
      },
      error_callback: (err: any) => reject(err instanceof Error ? err : new Error(String(err))),
    });

    tokenClient.requestAccessToken({ prompt: "consent" });
  });
}

export function revokeToken(token: string) {
  if (!window.google?.accounts?.oauth2?.revoke) return;
  window.google.accounts.oauth2.revoke(token, () => {});
}
