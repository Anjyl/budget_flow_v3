# API Permissions & Scopes Reference

This document provides a detailed reference for all API permissions and OAuth scopes used by the Budget Web App.

## OAuth 2.0 Scopes

### Core Authentication Scopes

#### 1. Google Drive API Scopes

| Scope | URL | Permission Level | Use Case |
|-------|-----|------------------|----------|
| Drive Read-Only | `https://www.googleapis.com/auth/drive.readonly` | Read | List and read user's Google Drive files |
| Drive File | `https://www.googleapis.com/auth/drive.file` | Read/Write | Create, modify, and delete files created by app |
| Drive Full | `https://www.googleapis.com/auth/drive` | Full Access | Complete access to all Drive files (not recommended) |

**Recommended:** Use `drive.readonly` + `drive.file` for least privilege access.

#### 2. Google Sheets API Scopes

| Scope | URL | Permission Level | Use Case |
|-------|-----|------------------|----------|
| Sheets Read-Only | `https://www.googleapis.com/auth/spreadsheets.readonly` | Read | Read spreadsheet data and structure |
| Sheets | `https://www.googleapis.com/auth/spreadsheets` | Read/Write | Read and modify spreadsheet data |

**Recommended:** Use `spreadsheets` for full functionality (read and write operations).

#### 3. User Profile Scopes

| Scope | URL | Permission Level | Use Case |
|-------|-----|------------------|----------|
| Email | `https://www.googleapis.com/auth/userinfo.email` | Read | Access user's email address |
| Profile | `https://www.googleapis.com/auth/userinfo.profile` | Read | Access user's name and profile picture |
| OpenID | `openid` | Read | OpenID Connect authentication |

**Recommended:** Include both `email` and `profile` for complete user identification.

---

## Scope Implementation

### Authorization Request

When initiating OAuth flow, the app requests the following scopes:

```javascript
const scopes = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

// Scopes are joined with spaces in the authorization URL
const scopeString = scopes.join(' ');
```

### Consent Screen

Users will see a consent screen displaying:

```
BudgetFlow wants access to:
- View and manage your Google Drive files
- View and manage Google Sheets you have access to
- See your email address
- See your personal info
```

---

## API Endpoints & Permissions

### Google Drive API Endpoints

#### List Files

**Endpoint:** `GET https://www.googleapis.com/drive/v3/files`

**Required Scope:** `drive.readonly` or `drive.file`

**Request:**
```javascript
{
  q: "mimeType='application/vnd.google-apps.spreadsheet'",
  spaces: 'drive',
  pageSize: 10,
  fields: 'files(id, name, mimeType, modifiedTime, owners, webViewLink)'
}
```

**Response:**
```javascript
{
  files: [
    {
      id: "file_id",
      name: "Budget 2024",
      mimeType: "application/vnd.google-apps.spreadsheet",
      modifiedTime: "2024-03-13T10:30:00.000Z",
      owners: [{ displayName: "User", emailAddress: "user@example.com" }],
      webViewLink: "https://docs.google.com/spreadsheets/d/file_id/edit"
    }
  ]
}
```

#### Get File Metadata

**Endpoint:** `GET https://www.googleapis.com/drive/v3/files/{fileId}`

**Required Scope:** `drive.readonly` or `drive.file`

**Response:**
```javascript
{
  id: "file_id",
  name: "Budget Spreadsheet",
  mimeType: "application/vnd.google-apps.spreadsheet",
  createdTime: "2024-01-01T00:00:00.000Z",
  modifiedTime: "2024-03-13T10:30:00.000Z",
  size: "1024",
  owners: [{ displayName: "User", emailAddress: "user@example.com" }]
}
```

### Google Sheets API Endpoints

#### Get Spreadsheet Metadata

**Endpoint:** `GET https://www.googleapis.com/sheets/v4/spreadsheets/{spreadsheetId}`

**Required Scope:** `spreadsheets.readonly` or `spreadsheets`

**Response:**
```javascript
{
  spreadsheetId: "sheet_id",
  properties: {
    title: "Budget 2024",
    locale: "en_US",
    autoRecalc: "ON_CHANGE",
    timeZone: "America/New_York"
  },
  sheets: [
    {
      properties: {
        sheetId: 0,
        title: "January",
        index: 0,
        gridProperties: { rowCount: 1000, columnCount: 26 }
      }
    },
    {
      properties: {
        sheetId: 1,
        title: "February",
        index: 1,
        gridProperties: { rowCount: 1000, columnCount: 26 }
      }
    }
  ]
}
```

#### Get Sheet Data

**Endpoint:** `GET https://www.googleapis.com/sheets/v4/spreadsheets/{spreadsheetId}/values/{range}`

**Required Scope:** `spreadsheets.readonly` or `spreadsheets`

**Request:**
```
GET /sheets/v4/spreadsheets/sheet_id/values/Sheet1!A1:Z1000
```

**Response:**
```javascript
{
  spreadsheetId: "sheet_id",
  range: "Sheet1!A1:Z1000",
  majorDimension: "ROWS",
  values: [
    ["Date", "Description", "Amount", "Category"],
    ["2024-03-01", "Groceries", "50.00", "Food"],
    ["2024-03-02", "Gas", "45.00", "Transport"]
  ]
}
```

#### Update Sheet Data

**Endpoint:** `PUT https://www.googleapis.com/sheets/v4/spreadsheets/{spreadsheetId}/values/{range}`

**Required Scope:** `spreadsheets`

**Request:**
```javascript
{
  range: "Sheet1!A1:D100",
  majorDimension: "ROWS",
  values: [
    ["Date", "Description", "Amount", "Category"],
    ["2024-03-01", "Groceries", "50.00", "Food"]
  ]
}
```

**Response:**
```javascript
{
  spreadsheetId: "sheet_id",
  updatedRange: "Sheet1!A1:D100",
  updatedRows: 2,
  updatedColumns: 4,
  updatedCells: 8
}
```

---

## Permission Hierarchy

### Scope Permissions (Least to Most Privileged)

```
1. userinfo.email (Read-only)
   └─ Access user's email address

2. userinfo.profile (Read-only)
   └─ Access user's name and profile picture

3. drive.readonly (Read-only)
   └─ List and read all Google Drive files

4. drive.file (Read/Write)
   └─ Create, read, update, delete files created by app

5. spreadsheets.readonly (Read-only)
   └─ Read spreadsheet data

6. spreadsheets (Read/Write)
   └─ Read and modify spreadsheet data

7. drive (Full Access - NOT RECOMMENDED)
   └─ Complete access to all Drive files
```

---

## Incremental Authorization

The app supports incremental authorization, allowing users to grant additional permissions over time.

### Initial Authorization

```javascript
const initialScopes = [
  'userinfo.email',
  'userinfo.profile',
  'drive.readonly'
];
```

### Additional Scopes (On Demand)

When user attempts to edit a spreadsheet:

```javascript
const additionalScopes = [
  'drive.file',
  'spreadsheets'
];

// Request additional authorization
// User will see consent screen only for new scopes
```

---

## Rate Limiting

### Google Drive API Rate Limits

- **Queries per 100 seconds:** 1,000
- **Queries per 100 seconds per user:** 100
- **Batch requests:** Up to 100 requests per batch

### Google Sheets API Rate Limits

- **Requests per minute:** 500
- **Requests per minute per user:** 100
- **Read requests:** Higher limit than write requests

### Handling Rate Limits

When rate limit is exceeded, API returns:

```javascript
{
  error: {
    code: 429,
    message: "Rate Limit Exceeded",
    errors: [
      {
        domain: "global",
        reason: "rateLimitExceeded",
        message: "Rate Limit Exceeded"
      }
    ]
  }
}
```

**Recommended Response:**
```javascript
// Implement exponential backoff
const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s, 8s...
setTimeout(() => retryRequest(), delay);
```

---

## Error Handling

### Common Permission Errors

#### 403 Forbidden - Insufficient Permissions

```javascript
{
  error: {
    code: 403,
    message: "The user does not have sufficient permissions for this file.",
    errors: [
      {
        domain: "global",
        reason: "insufficientPermissions",
        message: "Insufficient Permission"
      }
    ]
  }
}
```

**Solution:** Request additional scopes through incremental authorization.

#### 401 Unauthorized - Invalid Token

```javascript
{
  error: {
    code: 401,
    message: "Invalid Credentials",
    errors: [
      {
        domain: "global",
        reason: "authError",
        message: "Invalid Credentials"
      }
    ]
  }
}
```

**Solution:** Refresh access token or re-authenticate user.

#### 404 Not Found - File Not Accessible

```javascript
{
  error: {
    code: 404,
    message: "File not found: file_id",
    errors: [
      {
        domain: "global",
        reason: "notFound",
        message: "File not found"
      }
    ]
  }
}
```

**Solution:** Verify file ID and user has access to the file.

---

## Testing Permissions

### Manual Testing

1. **Test Drive Access:**
   ```bash
   curl -H "Authorization: Bearer ACCESS_TOKEN" \
     "https://www.googleapis.com/drive/v3/files?pageSize=5"
   ```

2. **Test Sheets Access:**
   ```bash
   curl -H "Authorization: Bearer ACCESS_TOKEN" \
     "https://www.googleapis.com/sheets/v4/spreadsheets/SHEET_ID"
   ```

3. **Test User Info:**
   ```bash
   curl -H "Authorization: Bearer ACCESS_TOKEN" \
     "https://www.googleapis.com/oauth2/v1/userinfo"
   ```

### Automated Testing

See `server/googleSheets.test.ts` for automated permission tests.

---

## Revoking Permissions

### User Revokes Access

Users can revoke app permissions at:
- [Google Account Permissions](https://myaccount.google.com/permissions)
- [Google Drive Settings](https://drive.google.com/drive/settings)

### App Revokes Token

```javascript
// Revoke access token
const revokeUrl = `https://oauth2.googleapis.com/revoke?token=${accessToken}`;
await fetch(revokeUrl, { method: 'POST' });
```

---

## Compliance & Privacy

### Data Access

- The app only accesses files explicitly selected by the user
- The app does not access files in shared drives without permission
- The app respects file-level permissions set by file owners

### Data Storage

- User data is stored securely in encrypted database
- Access tokens are stored with encryption
- Refresh tokens are rotated regularly

### GDPR Compliance

- Users can request data export
- Users can request data deletion
- Privacy policy available at `/privacy`

---

## Additional Resources

- [Google OAuth 2.0 Scopes](https://developers.google.com/identity/protocols/oauth2/scopes)
- [Google Drive API Scopes](https://developers.google.com/drive/api/guides/auth-scopes)
- [Google Sheets API Scopes](https://developers.google.com/sheets/api/guides/authorizing-requests)
- [OAuth 2.0 Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)
