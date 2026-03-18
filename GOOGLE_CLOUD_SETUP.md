# Google Cloud Project Setup - Step by Step

Complete guide to set up Google Cloud Project with OAuth 2.0 and API permissions for Budget Web App.

## Prerequisites

- Google account (personal or workspace)
- Access to [Google Cloud Console](https://console.cloud.google.com/)
- Budget Web App project files

---

## Part 1: Create Google Cloud Project

### Step 1: Access Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Accept terms of service if prompted

### Step 2: Create New Project

1. Click the **Project** dropdown at the top of the page
2. Click **NEW PROJECT**
3. Fill in project details:
   - **Project name:** `BudgetFlow` (or your preferred name)
   - **Organization:** Leave blank (or select your organization)
   - **Location:** Select your location
4. Click **CREATE**
5. Wait for project creation (usually 1-2 minutes)

### Step 3: Verify Project Creation

1. The new project should appear in the project selector dropdown
2. Click on the project name to ensure you're in the correct project
3. You should see the project ID in the project selector

---

## Part 2: Enable Required APIs

### Step 1: Access APIs & Services

1. In the Google Cloud Console, click the **hamburger menu** (≡) in the top-left
2. Go to **APIs & Services** > **Library**

### Step 2: Enable Google Drive API

1. In the search bar, type `Google Drive API`
2. Click on **Google Drive API** from the results
3. Click the **ENABLE** button
4. Wait for the API to be enabled (usually 30 seconds)
5. You should see "API enabled" confirmation

### Step 3: Enable Google Sheets API

1. Go back to **APIs & Services** > **Library**
2. In the search bar, type `Google Sheets API`
3. Click on **Google Sheets API** from the results
4. Click the **ENABLE** button
5. Wait for the API to be enabled

### Step 4: Verify Enabled APIs

1. Go to **APIs & Services** > **Enabled APIs & services**
2. You should see:
   - Google Drive API
   - Google Sheets API
   - Google Cloud Resource Manager API (auto-enabled)

---

## Part 3: Configure OAuth Consent Screen

### Step 1: Access OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** as the user type (for testing/development)
3. Click **CREATE**

### Step 2: Fill App Information

**Screen 1: OAuth consent screen**

1. **App name:** `BudgetFlow`
2. **User support email:** Your email address
3. **App logo:** (Optional) Upload a logo
4. Click **SAVE AND CONTINUE**

### Step 3: Add Required Scopes

**Screen 2: Scopes**

1. Click **ADD OR REMOVE SCOPES**
2. In the search box, paste each scope one at a time:

**Scope 1: Google Drive Read-Only**
```
https://www.googleapis.com/auth/drive.readonly
```
- Click the checkbox
- Click **UPDATE**

**Scope 2: Google Drive File**
```
https://www.googleapis.com/auth/drive.file
```
- Click the checkbox
- Click **UPDATE**

**Scope 3: Google Sheets**
```
https://www.googleapis.com/auth/spreadsheets
```
- Click the checkbox
- Click **UPDATE**

**Scope 4: User Email**
```
https://www.googleapis.com/auth/userinfo.email
```
- Click the checkbox
- Click **UPDATE**

**Scope 5: User Profile**
```
https://www.googleapis.com/auth/userinfo.profile
```
- Click the checkbox
- Click **UPDATE**

3. Verify all scopes are selected
4. Click **SAVE AND CONTINUE**

### Step 4: Add Test Users

**Screen 3: Test users**

1. Click **ADD USERS**
2. Enter your Google account email address
3. Click **ADD**
4. Your email should appear in the test users list
5. Click **SAVE AND CONTINUE**

### Step 5: Review & Finish

**Screen 4: Summary**

1. Review all information
2. Click **BACK TO DASHBOARD**

---

## Part 4: Create OAuth 2.0 Credentials

### Step 1: Access Credentials Page

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** at the top
3. Select **OAuth client ID**

### Step 2: Select Application Type

1. If prompted to configure OAuth consent screen first, you're already done
2. Select **Web application** as the application type
3. Enter a name: `BudgetFlow Web App`

### Step 3: Add Authorized JavaScript Origins

1. Under **Authorized JavaScript origins**, click **ADD URI**
2. Add the following URIs:

**For Development (Local):**
```
http://localhost:3000
http://localhost:5173
```

**For Development (Manus):**
```
https://3000-i497rpn1eo2hmaptkntp1-e2eff149.us1.manus.computer
```

**For Production (Update with your domain):**
```
https://budgetflow.example.com
https://www.budgetflow.example.com
```

3. Click **ADD URI** for each URL

### Step 4: Add Authorized Redirect URIs

1. Under **Authorized redirect URIs**, click **ADD URI**
2. Add the following URIs:

**For Development (Local):**
```
http://localhost:3000/api/oauth/callback
http://localhost:5173/api/oauth/callback
```

**For Development (Manus):**
```
https://3000-i497rpn1eo2hmaptkntp1-e2eff149.us1.manus.computer/api/oauth/callback
```

**For Production (Update with your domain):**
```
https://budgetflow.example.com/api/oauth/callback
https://www.budgetflow.example.com/api/oauth/callback
```

3. Click **ADD URI** for each URL

### Step 5: Create Credentials

1. Click **CREATE**
2. A dialog will appear showing your credentials
3. **IMPORTANT:** Copy and save the following:
   - **Client ID**
   - **Client Secret**

### Step 6: Download Credentials (Optional)

1. Click **DOWNLOAD JSON** to save credentials file
2. Store this file securely (do NOT commit to version control)

---

## Part 5: Configure Environment Variables

### Step 1: Create .env File

1. In the Budget Web App project root, create a file named `.env`
2. Add the following variables:

```bash
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here

# OAuth Redirect URL
OAUTH_REDIRECT_URI=http://localhost:3000/api/oauth/callback

# Frontend Configuration
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
VITE_OAUTH_REDIRECT_URI=http://localhost:3000/api/oauth/callback
```

### Step 2: Replace Placeholder Values

1. Replace `your_client_id_here.apps.googleusercontent.com` with your actual Client ID
2. Replace `your_client_secret_here` with your actual Client Secret
3. Save the file

### Step 3: Verify Environment Variables

```bash
# Test that environment variables are loaded
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET
```

---

## Part 6: Test OAuth Flow

### Step 1: Start Development Server

```bash
cd /home/ubuntu/budget-web-app
pnpm install  # If not already installed
pnpm dev
```

### Step 2: Open Application

1. Open browser and go to `http://localhost:3000`
2. You should see the BudgetFlow landing page
3. Click **Sign In with Google** button

### Step 3: Authorize Application

1. You'll be redirected to Google's consent screen
2. Review the requested permissions:
   - View and manage your Google Drive files
   - View and manage Google Sheets
   - See your email address
   - See your personal info
3. Click **Allow** to authorize

### Step 4: Verify Login

1. After authorization, you should be redirected to Document Editor page
2. You should see your user information in the sidebar
3. Verify that you can see the "Sign Out" button

### Step 5: Test Sign Out

1. Click the **Sign Out** button
2. Verify you're redirected to the landing page
3. Verify the session is cleared

---

## Part 7: Production Deployment

### Step 1: Update Redirect URIs

1. Go to **APIs & Services** > **Credentials**
2. Click on your OAuth 2.0 Client ID
3. Update **Authorized JavaScript origins** with your production domain:
   ```
   https://budgetflow.example.com
   https://www.budgetflow.example.com
   ```
4. Update **Authorized redirect URIs** with your production callback:
   ```
   https://budgetflow.example.com/api/oauth/callback
   https://www.budgetflow.example.com/api/oauth/callback
   ```
5. Click **SAVE**

### Step 2: Update Environment Variables

1. Update your production `.env` file:
   ```bash
   OAUTH_REDIRECT_URI=https://budgetflow.example.com/api/oauth/callback
   VITE_OAUTH_REDIRECT_URI=https://budgetflow.example.com/api/oauth/callback
   ```

### Step 3: Deploy Application

Follow your deployment platform's instructions:
- For Vercel: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- For Azure: See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## Troubleshooting

### Issue: "Client ID not found"

**Solution:**
1. Verify Client ID is copied correctly from Google Cloud Console
2. Check that `.env` file is in the project root
3. Restart the development server after updating `.env`

### Issue: "Redirect URI mismatch"

**Solution:**
1. Go to Google Cloud Console > Credentials
2. Click on your OAuth 2.0 Client ID
3. Verify the redirect URI matches exactly:
   - Development: `http://localhost:3000/api/oauth/callback`
   - Production: `https://your-domain.com/api/oauth/callback`
4. Include the full path including `/api/oauth/callback`

### Issue: "Invalid scope"

**Solution:**
1. Go to OAuth consent screen
2. Verify all required scopes are added
3. Use full scope URLs: `https://www.googleapis.com/auth/drive.readonly`
4. Separate multiple scopes with spaces

### Issue: "Access denied" after clicking Allow

**Solution:**
1. Verify you're listed as a test user in OAuth consent screen
2. Go to **APIs & Services** > **OAuth consent screen**
3. Add your email address to test users
4. Try again

### Issue: "API not enabled"

**Solution:**
1. Go to **APIs & Services** > **Enabled APIs & services**
2. Verify Google Drive API and Google Sheets API are enabled
3. If not, go to Library and enable them

---

## Security Checklist

- [ ] Client Secret is stored securely in `.env` (not committed to git)
- [ ] Redirect URIs are updated for production domain
- [ ] Only necessary scopes are requested
- [ ] Test users are added for development
- [ ] HTTPS is used for production URLs
- [ ] Session cookies have `secure` and `httpOnly` flags
- [ ] CSRF protection is enabled
- [ ] Rate limiting is implemented

---

## Next Steps

1. **Test OAuth Flow** - Follow Part 6 above
2. **Implement Google Drive Integration** - See `server/googleDrive.ts`
3. **Implement Google Sheets Integration** - See `server/googleSheets.ts`
4. **Deploy to Production** - See `DEPLOYMENT.md`

---

## Support

For issues or questions:
1. Check [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
2. Review [Google Drive API Documentation](https://developers.google.com/drive/api/v3/about-sdk)
3. Check [Google Sheets API Documentation](https://developers.google.com/sheets/api)
4. Contact support or check project issues
