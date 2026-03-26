import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Request, Response, Application } from "express";
import express from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import * as googleOAuth from "./googleOAuth";

const app: Application = express();

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Application ) {
  // Google OAuth callback handler
  app.get("/api/oauth/google/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    const error = getQueryParam(req, "error");

    // Handle user denial
    if (error) {
      console.error("[Google OAuth] User denied permission:", error);
      return res.redirect(302, `/?error=${error}`);
    }

    if (!code || !state) {
      console.error("[Google OAuth] Missing code or state");
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      // Exchange authorization code for tokens
      const tokens = await googleOAuth.exchangeCodeForTokens(code);

      if (!tokens.access_token) {
        throw new Error("No access token in response");
      }

      // Get user information
      const userInfo = await googleOAuth.getUserInfo(tokens.access_token);

      if (!userInfo.email) {
        res.status(400).json({ error: "Email not provided by Google" });
        return;
      }

      // Create or update user in database
      // Use Google ID as openId for Google OAuth
      const openId = `google-${userInfo.id}`;

      await db.upsertUser({
        openId,
        name: userInfo.name || null,
        email: userInfo.email,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      // Create session token using SDK
      const sessionToken = await sdk.createSessionToken(openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      // Store refresh token if available (for offline access)
      if (tokens.refresh_token) {
        // In production, store this securely in the database
        console.log("[Google OAuth] Refresh token available for offline access");
      }

      // Redirect to home page
      res.redirect(302, "/");
    } catch (error) {
      console.error("[Google OAuth] Callback failed:", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });

  // Legacy Manus OAuth callback handler (kept for backward compatibility)
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
