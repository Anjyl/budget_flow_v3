# OAuth & API Permissions Setup Guide

This document provides detailed instructions for configuring OAuth 2.0 and API permissions for the Budget Web App to access Google Drive and Google Sheets.

## Table of Contents

1. [Google Cloud Project Setup](#google-cloud-project-setup)
2. [OAuth 2.0 Configuration](#oauth-20-configuration)
3. [API Permissions](#api-permissions)
4. [Environment Variables](#environment-variables)
5. [Testing OAuth Flow](#testing-oauth-flow)
6. [Troubleshooting](#troubleshooting)

---

## Google Cloud Project Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **NEW PROJECT**
4. Enter project name: `BudgetFlow` (or your preferred name)
5. Click **CREATE**
6. Wait for the project to be created (may take a few moments)

### Step 2: Enable Required APIs

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for and enable the following APIs:
   - **Google Drive API** - For accessing user's Google Drive files
   - **Google Sheets API** - For reading and writing spreadsheet data
   - **Google OAuth 2.0** - Already enabled by default

**Steps to enable each API:**
1. Search for the API name in the search bar
2. Click on the API
3. Click **ENABLE**
4. Wait for confirmation

---

## OAuth 2.0 Configuration

### Step 1: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS**
3. Select **OAuth client ID**
4. If prompted, configure the OAuth consent screen first (see Step 2)

### Step 2: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** as the user type
3. Click **CREATE**
4. Fill in the following information:

#### App Information
- **App name**: `BudgetFlow`
- **User support email**: Your email address
- **Developer contact information**: Your email address

#### Scopes
Click **ADD OR REMOVE SCOPES** and add the following scopes:

**Required Scopes:**
```
https://www.googleapis.com/auth/drive.readonly
https://www.googleapis.com/auth/drive.file
https://www.googleapis.com/auth/spreadsheets
https://www.googleapis.com/auth/userinfo.email
https://www.googleapis.com/auth/userinfo.profile
```

**Scope Descriptions:**
- `drive.readonly` - Read access to user's Google Drive files
- `drive.file` - Access to files created or opened by the app
- `spreadsheets` - Read and write access to Google Sheets
- `userinfo.email` - Access to user's email address
- `userinfo.profile` - Access to user's profile information

#### Test Users (for development)
1. Click **ADD USERS**
2. Add your Google account email address
3. This allows you to test the OAuth flow before publishing

5. Click **SAVE AND CONTINUE**
6. Review the summary and click **BACK TO DASHBOARD**

### Step 3: Create OAuth 2.0 Client ID

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Select **Web application**
4. Fill in the following:

#### Application Name
```
BudgetFlow Web App
```

#### Authorized JavaScript Origins
Add the following URLs (adjust for your deployment):

**For Development:**
```
http://localhost:3000
http://localhost:5173
https://3000-*.manus.computer
```

**For Production:**
```
https://your-domain.com
https://www.your-domain.com
https://*.manus.space
```

#### Authorized Redirect URIs
Add the following URLs:

**For Development:**
```
http://localhost:3000/api/oauth/callback
http://localhost:5173/api/oauth/callback
https://3000-*.manus.computer/api/oauth/callback
```

**For Production:**
```
https://your-domain.com/api/oauth/callback
https://www.your-domain.com/api/oauth/callback
https://*.manus.space/api/oauth/callback
```

5. Click **CREATE**
6. A dialog will appear with your credentials
7. Click **DOWNLOAD JSON** to save the credentials file
8. Copy the **Client ID** and **Client Secret** for use in environment variables

---

## API Permissions

### Google Drive API Permissions

The app requires the following permissions to access Google Drive:

| Permission | Scope | Purpose |
|-----------|-------|---------|
| Read Drive Files | `drive.readonly` | List and read user's Google Drive files |
| Create/Modify Files | `drive.file` | Create and modify files created by the app |
| File Metadata | `drive.readonly` | Access file names, modification dates, owners |

### Google Sheets API Permissions

The app requires the following permissions for Google Sheets:

| Permission | Scope | Purpose |
|-----------|-------|---------|
| Read Sheets | `spreadsheets.readonly` | Read spreadsheet data and structure |
| Write Sheets | `spreadsheets` | Modify spreadsheet data |
| Read/Write Range | `spreadsheets` | Update specific cell ranges |

### User Profile Permissions

| Permission | Scope | Purpose |
|-----------|-------|---------|
| Email Address | `userinfo.email` | Identify user and link to account |
| Profile Info | `userinfo.profile` | Display user name and profile picture |

---

## Environment Variables

### Required Environment Variables

Add the following to your `.env` file:

```bash
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here

# OAuth Redirect URL
OAUTH_REDIRECT_URI=http://localhost:3000/api/oauth/callback

# Frontend OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
VITE_OAUTH_REDIRECT_URI=http://localhost:3000/api/oauth/callback
```

### Production Environment Variables

For production deployment, update these variables:

```bash
# Production URLs
OAUTH_REDIRECT_URI=https://your-domain.com/api/oauth/callback
VITE_OAUTH_REDIRECT_URI=https://your-domain.com/api/oauth/callback
```

---

## Testing OAuth Flow

### Step 1: Start Development Server

```bash
cd /home/ubuntu/budget-web-app
pnpm dev
```

### Step 2: Test Landing Page

1. Open http://localhost:3000
2. You should see the landing page with "Sign In with Google" button
3. Click the button to initiate OAuth flow

### Step 3: Google Consent Screen

1. You'll be redirected to Google's consent screen
2. Review the requested permissions
3. Click **Allow** to authorize the app

### Step 4: Callback Verification

1. After authorization, you should be redirected back to the app
2. Check that you're redirected to the Document Editor page
3. Verify that your user information is displayed in the sidebar

### Step 5: Test Sign Out

1. Click the "Sign Out" button
2. Verify you're redirected to the landing page
3. Verify the session cookie is cleared

---

## API Routing Configuration

### Backend OAuth Callback Route

The app uses the following route for OAuth callbacks:

```
POST /api/oauth/callback
```

**Request Parameters:**
```javascript
{
  code: "authorization_code_from_google",
  state: "state_parameter_for_csrf_protection"
}
```

**Response:**
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

### tRPC API Routes

The app uses tRPC for all API communication:

```
POST /api/trpc/[procedure]
```

**Example Procedures:**
```
/api/trpc/auth.me
/api/trpc/auth.logout
/api/trpc/drive.listFiles
/api/trpc/sheets.getSheetData
```

### CORS Configuration

The app is configured with CORS headers to allow:

```
Access-Control-Allow-Origin: https://your-domain.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

---

## Troubleshooting

### Issue: "Invalid Client ID"

**Solution:**
1. Verify the Client ID in `.env` matches Google Cloud Console
2. Ensure the Client ID hasn't been regenerated
3. Check that the Client ID is for a Web application, not a Desktop app

### Issue: "Redirect URI Mismatch"

**Solution:**
1. Go to Google Cloud Console > Credentials
2. Click on your OAuth 2.0 Client ID
3. Verify the Authorized Redirect URIs match your app's callback URL
4. Include the full path: `https://your-domain.com/api/oauth/callback`

### Issue: "Permission Denied" or "Insufficient Permissions"

**Solution:**
1. Go to OAuth Consent Screen
2. Verify all required scopes are added:
   - `drive.readonly`
   - `drive.file`
   - `spreadsheets`
   - `userinfo.email`
   - `userinfo.profile`
3. Re-authorize the app after adding scopes

### Issue: "Invalid Scope"

**Solution:**
1. Ensure scopes are written exactly as specified
2. Use full scope URLs: `https://www.googleapis.com/auth/drive.readonly`
3. Separate multiple scopes with spaces in the authorization request

### Issue: Session Not Persisting

**Solution:**
1. Verify cookies are enabled in browser
2. Check that the session cookie name matches: `manus-session`
3. Ensure `httpOnly` and `secure` flags are set for production
4. For development, `secure` flag can be disabled

### Issue: CORS Errors

**Solution:**
1. Verify CORS headers are properly configured in `server/_core/index.ts`
2. Ensure the frontend origin is whitelisted
3. Check that credentials are included in fetch requests: `credentials: 'include'`

---

## Security Best Practices

### 1. Store Secrets Securely

- Never commit `.env` files to version control
- Use environment variables for all sensitive data
- Rotate Client Secret regularly

### 2. CSRF Protection

- The app uses state parameter in OAuth flow
- Verify state parameter matches before processing callback
- This prevents CSRF attacks

### 3. HTTPS in Production

- Always use HTTPS for production URLs
- Set `secure` flag on session cookies
- Use `SameSite=Lax` or `SameSite=Strict` for cookies

### 4. Scope Limitation

- Only request necessary scopes
- Current app requests: `drive.readonly`, `drive.file`, `spreadsheets`
- Remove unused scopes to reduce security risk

### 5. Token Expiration

- Access tokens expire after 1 hour
- Implement refresh token rotation
- Handle token expiration gracefully

---

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Drive API Documentation](https://developers.google.com/drive/api/v3/about-sdk)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review Google's official documentation
3. Check the project's GitHub issues
4. Contact the development team
