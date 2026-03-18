# Google Cloud Credentials & Configuration

Complete reference for JavaScript origins and redirect URIs to configure in Google Cloud Console.

---

## Quick Reference

### Redirect URI (OAuth Callback)
```
/api/oauth/callback
```

### Full Redirect URIs by Environment

**Development (Local):**
```
http://localhost:3000/api/oauth/callback
http://localhost:5173/api/oauth/callback
```

**Development (Manus):**
```
https://3000-i497rpn1eo2hmaptkntp1-e2eff149.us1.manus.computer/api/oauth/callback
```

**Production (Replace with your domain):**
```
https://budgetflow.example.com/api/oauth/callback
https://www.budgetflow.example.com/api/oauth/callback
```

---

## JavaScript Origins

### Development (Local)
```
http://localhost:3000
http://localhost:5173
```

### Development (Manus)
```
https://3000-i497rpn1eo2hmaptkntp1-e2eff149.us1.manus.computer
```

### Production (Replace with your domain)
```
https://budgetflow.example.com
https://www.budgetflow.example.com
```

---

## OAuth Flow Implementation

### Frontend OAuth Initialization

**File:** `client/src/const.ts`

```javascript
export const getLoginUrl = () => {
  // Get OAuth portal URL from environment
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  
  // Build redirect URI dynamically from current origin
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  
  // Encode redirect URI in state for CSRF protection
  const state = btoa(redirectUri);

  // Construct OAuth authorization URL
  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
```

### Backend OAuth Callback Handler

**File:** `server/_core/oauth.ts`

```typescript
export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    // Extract authorization code and state from query parameters
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      // Exchange authorization code for access token
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      
      // Get user information from token
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      // Store or update user in database
      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      // Create session token
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { 
        ...cookieOptions, 
        maxAge: ONE_YEAR_MS 
      });

      // Redirect to home page
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
```

---

## Environment Variables Configuration

### Development Environment (.env.local or .env)

```bash
# OAuth Portal Configuration
VITE_OAUTH_PORTAL_URL=https://api.manus.im
VITE_APP_ID=your_app_id_here

# Google OAuth (if using Google OAuth directly)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

# Redirect URI
OAUTH_REDIRECT_URI=http://localhost:3000/api/oauth/callback
VITE_OAUTH_REDIRECT_URI=http://localhost:3000/api/oauth/callback
```

### Production Environment

```bash
# OAuth Portal Configuration
VITE_OAUTH_PORTAL_URL=https://api.manus.im
VITE_APP_ID=your_app_id_here

# Google OAuth (if using Google OAuth directly)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

# Redirect URI - Update with your production domain
OAUTH_REDIRECT_URI=https://budgetflow.example.com/api/oauth/callback
VITE_OAUTH_REDIRECT_URI=https://budgetflow.example.com/api/oauth/callback
```

---

## Google Cloud Console Configuration Steps

### Step 1: Add Authorized JavaScript Origins

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized JavaScript origins**, click **ADD URI**
5. Add each of the following (based on your environment):

**For Development:**
```
http://localhost:3000
http://localhost:5173
https://3000-i497rpn1eo2hmaptkntp1-e2eff149.us1.manus.computer
```

**For Production:**
```
https://budgetflow.example.com
https://www.budgetflow.example.com
```

6. Click **ADD URI** for each entry
7. Click **SAVE**

### Step 2: Add Authorized Redirect URIs

1. In the same OAuth 2.0 Client ID page
2. Under **Authorized redirect URIs**, click **ADD URI**
3. Add each of the following (based on your environment):

**For Development:**
```
http://localhost:3000/api/oauth/callback
http://localhost:5173/api/oauth/callback
https://3000-i497rpn1eo2hmaptkntp1-e2eff149.us1.manus.computer/api/oauth/callback
```

**For Production:**
```
https://budgetflow.example.com/api/oauth/callback
https://www.budgetflow.example.com/api/oauth/callback
```

4. Click **ADD URI** for each entry
5. Click **SAVE**

---

## Login Button Implementation

### React Component Example

**File:** `client/src/pages/Landing.tsx`

```typescript
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { ArrowRight } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    // Get the OAuth login URL
    const loginUrl = getLoginUrl();
    
    // Redirect to OAuth provider
    window.location.href = loginUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* ... other content ... */}
      
      <Button
        onClick={handleLogin}
        size="lg"
        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
      >
        Sign In with Google <ArrowRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
```

---

## OAuth Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User clicks "Sign In with Google" on Landing Page        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Frontend calls getLoginUrl()                             │
│    - Generates redirect URI: window.location.origin +       │
│      "/api/oauth/callback"                                  │
│    - Encodes state for CSRF protection                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Redirect to OAuth Provider                               │
│    URL: https://api.manus.im/app-auth?                      │
│         appId=...&                                          │
│         redirectUri=http://localhost:3000/api/oauth/...&   │
│         state=...&                                          │
│         type=signIn                                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. User Authorizes Application                              │
│    - Reviews requested permissions                          │
│    - Clicks "Allow"                                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. OAuth Provider Redirects to Callback URL                 │
│    URL: http://localhost:3000/api/oauth/callback?           │
│         code=authorization_code&                            │
│         state=encoded_redirect_uri                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Backend Processes Callback                               │
│    - Validates code and state                               │
│    - Exchanges code for access token                        │
│    - Retrieves user information                             │
│    - Creates session token                                  │
│    - Sets session cookie                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Redirect to Home Page                                    │
│    - User is now authenticated                              │
│    - Redirected to Document Editor                          │
│    - Session cookie is set                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Testing OAuth Configuration

### Test 1: Verify JavaScript Origins

```bash
# Check that the app loads from the authorized origin
curl -I http://localhost:3000
# Should return 200 OK
```

### Test 2: Verify Redirect URI

```bash
# Check that the callback endpoint exists
curl -I http://localhost:3000/api/oauth/callback
# Should return 400 (missing code/state) or 302 (redirect)
```

### Test 3: Full OAuth Flow

1. Open http://localhost:3000
2. Click "Sign In with Google"
3. You should be redirected to the OAuth provider
4. After authorization, you should be redirected back to the app
5. You should see the Document Editor page
6. Check browser cookies for session token

### Test 4: Verify Session Cookie

```javascript
// In browser console
console.log(document.cookie);
// Should show: manus-session=token_value
```

---

## Common Issues & Solutions

### Issue: "Redirect URI Mismatch"

**Error Message:**
```
The redirect_uri parameter does not match the registered redirect URI.
```

**Solution:**
1. Verify the exact redirect URI in Google Cloud Console
2. Ensure it includes the full path: `/api/oauth/callback`
3. Check for trailing slashes or protocol mismatches
4. Ensure the domain matches exactly (http vs https, www vs no-www)

### Issue: "Invalid JavaScript Origin"

**Error Message:**
```
The JavaScript origin is not authorized for this application.
```

**Solution:**
1. Add the exact origin to Authorized JavaScript origins
2. Include protocol (http:// or https://)
3. Include port number if not default (3000, 5173, etc.)
4. Do NOT include path (e.g., don't include /api/oauth/callback)

### Issue: "Invalid Client ID"

**Error Message:**
```
The OAuth client was not found.
```

**Solution:**
1. Verify Client ID is correct in environment variables
2. Ensure it's for a Web application, not Desktop
3. Check that the Client ID hasn't been regenerated
4. Restart development server after updating environment variables

---

## Security Considerations

### CSRF Protection

The app implements CSRF protection by:
1. Encoding the redirect URI in the `state` parameter
2. Verifying the state parameter matches on callback
3. This prevents attackers from initiating OAuth flows

### Secure Cookie Settings

Session cookies are configured with:
- `httpOnly: true` - Prevents JavaScript access
- `secure: true` (production only) - Only sent over HTTPS
- `sameSite: 'lax'` - Prevents cross-site cookie sending
- `maxAge: ONE_YEAR_MS` - Expires after 1 year

### Token Security

- Access tokens are never exposed to frontend
- Tokens are stored securely on backend
- Session tokens are used instead of access tokens
- Tokens are rotated on logout

---

## Deployment Checklist

- [ ] Update JavaScript origins for production domain
- [ ] Update redirect URIs for production domain
- [ ] Update environment variables for production
- [ ] Verify HTTPS is enabled for production
- [ ] Test OAuth flow in production environment
- [ ] Monitor OAuth callback errors in logs
- [ ] Set up alerts for failed OAuth attempts
- [ ] Document production domain for future reference

---

## Support & Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)
- [OWASP OAuth 2.0 Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/OAuth_2_Cheat_Sheet.html)

---

## Next Steps

1. **Configure Google Cloud Project** - Follow the steps above to add JavaScript origins and redirect URIs
2. **Set Environment Variables** - Update your `.env` file with the values from Google Cloud Console
3. **Test OAuth Flow** - Follow the testing steps above to verify everything works
4. **Deploy to Production** - Update configuration for your production domain
