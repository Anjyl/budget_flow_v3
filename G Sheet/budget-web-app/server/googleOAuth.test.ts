import { describe, expect, it } from "vitest";
import { ENV } from "./_core/env";

describe("Google OAuth Credentials", () => {
  it("should have valid Google Client ID configured", () => {
    expect(ENV.googleClientId).toBeDefined();
    expect(ENV.googleClientId).not.toBe("");
    // Google Client IDs follow pattern: number-alphanumeric.apps.googleusercontent.com
    expect(ENV.googleClientId).toMatch(/^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/);
  });

  it("should have valid Google Client Secret configured", () => {
    expect(ENV.googleClientSecret).toBeDefined();
    expect(ENV.googleClientSecret).not.toBe("");
    // Google Client Secrets are typically long alphanumeric strings
    expect(ENV.googleClientSecret.length).toBeGreaterThan(20);
  });

  it("should have matching Client ID format", () => {
    const clientId = ENV.googleClientId;
    const parts = clientId.split(".");
    // Format: number-alphanumeric.apps.googleusercontent.com (4 parts when split by dot)
    expect(parts.length).toBe(4);
    expect(parts[1]).toBe("apps");
    expect(parts[2]).toBe("googleusercontent");
    expect(parts[3]).toBe("com");
  });

  it("should have valid OAuth Server URL", () => {
    expect(ENV.oAuthServerUrl).toBeDefined();
    expect(ENV.oAuthServerUrl).not.toBe("");
    expect(ENV.oAuthServerUrl).toMatch(/^https:\/\//);
  });

  it("should have valid App ID", () => {
    expect(ENV.appId).toBeDefined();
    expect(ENV.appId).not.toBe("");
  });
});
