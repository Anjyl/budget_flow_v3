# Quick Reference - Copy & Paste Ready

## For Google Cloud Console Configuration

### Authorized JavaScript Origins

Copy and paste these into Google Cloud Console > Credentials > OAuth 2.0 Client ID > Authorized JavaScript origins:

**Development (Local):**
```
http://localhost:3000
http://localhost:5173
```

**Development (Manus Sandbox):**
```
https://3000-i497rpn1eo2hmaptkntp1-e2eff149.us1.manus.computer
```

**Production (Replace `example.com` with your domain):**
```
https://budgetflow.example.com
https://www.budgetflow.example.com
```

---

### Authorized Redirect URIs

Copy and paste these into Google Cloud Console > Credentials > OAuth 2.0 Client ID > Authorized redirect URIs:

**Development (Local):**
```
http://localhost:3000/api/oauth/callback
http://localhost:5173/api/oauth/callback
```

**Development (Manus Sandbox):**
```
https://3000-i497rpn1eo2hmaptkntp1-e2eff149.us1.manus.computer/api/oauth/callback
```

**Production (Replace `example.com` with your domain):**
```
https://budgetflow.example.com/api/oauth/callback
https://www.budgetflow.example.com/api/oauth/callback
```

---

## Environment Variables

### Development (.env or .env.local)

```bash
VITE_OAUTH_PORTAL_URL=https://api.manus.im
VITE_APP_ID=your_app_id_here
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
OAUTH_REDIRECT_URI=http://localhost:3000/api/oauth/callback
VITE_OAUTH_REDIRECT_URI=http://localhost:3000/api/oauth/callback
```

### Production

```bash
VITE_OAUTH_PORTAL_URL=https://api.manus.im
VITE_APP_ID=your_app_id_here
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
OAUTH_REDIRECT_URI=https://budgetflow.example.com/api/oauth/callback
VITE_OAUTH_REDIRECT_URI=https://budgetflow.example.com/api/oauth/callback
```

---

## OAuth Scopes

Copy and paste these into Google Cloud Console > OAuth consent screen > Scopes:

```
https://www.googleapis.com/auth/drive.readonly
https://www.googleapis.com/auth/drive.file
https://www.googleapis.com/auth/spreadsheets
https://www.googleapis.com/auth/userinfo.email
https://www.googleapis.com/auth/userinfo.profile
```

---

## Frontend JavaScript Code

### Login Button Click Handler

```javascript
import { getLoginUrl } from "@/const";

const handleLogin = () => {
  const loginUrl = getLoginUrl();
  window.location.href = loginUrl;
};
```

### Get Login URL

```javascript
// File: client/src/const.ts
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
```

---

## Backend OAuth Callback Route

### Endpoint
```
GET /api/oauth/callback
```

### Query Parameters
```
code=authorization_code_from_oauth_provider
state=encoded_redirect_uri
```

### Response (Success)
```javascript
{
  success: true,
  user: {
    id: "user_id",
    email: "user@example.com",
    name: "User Name"
  }
}
```

### Response (Error)
```javascript
{
  error: "error_message"
}
```

---

## Testing Commands

### Test Development Server
```bash
curl -I http://localhost:3000
```

### Test OAuth Callback Endpoint
```bash
curl -I http://localhost:3000/api/oauth/callback
```

### Test Environment Variables
```bash
echo $VITE_OAUTH_PORTAL_URL
echo $VITE_APP_ID
echo $GOOGLE_CLIENT_ID
```

---

## Step-by-Step Setup

1. **Create Google Cloud Project**
   - Go to https://console.cloud.google.com/
   - Create new project named "BudgetFlow"

2. **Enable APIs**
   - Enable Google Drive API
   - Enable Google Sheets API

3. **Configure OAuth Consent Screen**
   - Go to APIs & Services > OAuth consent screen
   - Select "External"
   - Fill in app information
   - Add scopes (see OAuth Scopes section above)
   - Add test users

4. **Create OAuth Credentials**
   - Go to APIs & Services > Credentials
   - Create OAuth 2.0 Client ID (Web application)
   - Add JavaScript origins (see Authorized JavaScript Origins above)
   - Add redirect URIs (see Authorized Redirect URIs above)
   - Copy Client ID and Client Secret

5. **Configure Environment Variables**
   - Create `.env` file in project root
   - Add variables (see Environment Variables section above)
   - Replace placeholder values with your actual credentials

6. **Test OAuth Flow**
   - Start dev server: `pnpm dev`
   - Open http://localhost:3000
   - Click "Sign In with Google"
   - Verify redirect to OAuth provider
   - Verify redirect back to app after authorization

---

## Troubleshooting

### "Redirect URI Mismatch"
- Check that redirect URI in Google Cloud Console matches exactly
- Include full path: `/api/oauth/callback`
- Check protocol (http vs https)
- Check domain (localhost vs 127.0.0.1)

### "Invalid JavaScript Origin"
- Add origin without path
- Include protocol and port
- Example: `http://localhost:3000`

### "Invalid Client ID"
- Verify Client ID in environment variables
- Check that it's for Web application type
- Restart dev server after updating .env

### "Environment Variables Not Loading"
- Restart development server
- Check .env file is in project root
- Verify variable names match exactly
- Check for typos in variable names

---

## File Locations

- **Frontend OAuth Code:** `client/src/const.ts`
- **Backend OAuth Handler:** `server/_core/oauth.ts`
- **Login Button:** `client/src/pages/Landing.tsx`
- **Environment Variables:** `.env` (root directory)
- **OAuth Setup Guide:** `OAUTH_SETUP.md`
- **API Permissions:** `API_PERMISSIONS.md`
- **Google Cloud Setup:** `GOOGLE_CLOUD_SETUP.md`

---

## Important Notes

⚠️ **Never commit `.env` file to version control**
- Add `.env` to `.gitignore`
- Use `.env.example` for template

⚠️ **Keep Client Secret secure**
- Never share Client Secret
- Never expose in frontend code
- Only use on backend

⚠️ **Update for production**
- Change redirect URIs to production domain
- Update environment variables
- Verify HTTPS is enabled
- Test OAuth flow in production

---

## Support

For detailed information, see:
- `OAUTH_SETUP.md` - Complete OAuth setup guide
- `GOOGLE_CLOUD_SETUP.md` - Step-by-step Google Cloud configuration
- `API_PERMISSIONS.md` - Detailed API permissions reference
- `GOOGLE_CLOUD_CREDENTIALS.md` - Credentials and configuration details
