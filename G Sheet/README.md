# Google Sheets CRUD Viewer

A small, modern web app that:
- Connects to Google via OAuth (in-browser)
- Lets you select a **shared** Google Sheet (Picker) or paste a Spreadsheet ID
- Loads the sheet into an editable table (add/edit/delete rows & columns)
- Auto-detects **budget-style** columns and shows totals + currency formatting
- Saves changes **back into the same Google Sheet** via the Google Sheets API (no export/import)

## 1) Prerequisites (Google Cloud)

You need a Google Cloud project with:
- **Google Sheets API** enabled
- **Google Drive API** enabled (for the Picker / shared files discovery)
- OAuth consent screen configured

### Create credentials

1. **OAuth Client ID**
   - Type: **Web application**
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - (add your production origin later)

2. **API Key**
   - Restrict it to:
     - Google Sheets API
     - Google Drive API
   - Optionally restrict by HTTP referrer (origins)

3. **App ID** (optional; only for Google Picker)
   - In Google Cloud Console: the numeric project/app id used by Picker.
   - Not required if you use the app’s built-in **Browse Drive** dialog.

## 2) Configure env

Copy `.env.example` to `.env.local` and fill in values.

```bash
cp .env.example .env.local
```

## 3) Run locally

```bash
pnpm install
pnpm dev
```

Open: http://localhost:5173

## Notes / limitations

- This implementation uses **client-side OAuth** (Google Identity Services) and calls APIs directly from the browser.
  - Good for single-user/internal tools.
  - If you need multi-user, central token storage, or strict security controls, add a backend.
- Save behavior:
  - The app first clears values on the target sheet, then writes the table starting at `A1`.
  - This removes stale values from deleted rows/columns.
  - Formatting is preserved (values-only operations).

## Env vars

- `VITE_GOOGLE_CLIENT_ID` (optional): OAuth web client ID (a default is baked in; override if you prefer)
- `VITE_GOOGLE_API_KEY` (required): API key used by gapi client
- `VITE_GOOGLE_APP_ID` (optional): only required for the Google Picker button (the app also has a built-in Drive browser that works without it)

## Troubleshooting

- **Picker button disabled**: you’re missing `VITE_GOOGLE_APP_ID`. You can still use **Browse Drive**.
- **"Missing VITE_GOOGLE_API_KEY"**: the app can’t call Sheets API without it.
- **OAuth errors**: ensure the origin matches your OAuth Client’s allowed JavaScript origins.
