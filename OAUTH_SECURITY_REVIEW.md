# OAuth Security Review and User Data Handling

## Overview

This document outlines the OAuth implementation, user data handling, and security considerations for the Budget Flow v3 application.

## OAuth Scopes Analysis

### Current Scopes Requested

The application requests the following Google OAuth scopes:

```typescript
const scopes = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/spreadsheets",
];
```

### Scope Justification

| Scope | Purpose | Necessity | Risk Level |
|-------|---------|-----------|-----------|
| `userinfo.email` | Retrieve user's email address for account identification | **Essential** | Low |
| `userinfo.profile` | Retrieve user's name and profile picture for display | **Necessary** | Low |
| `drive` | List and access Google Drive files for spreadsheet selection | **Essential** | Medium |
| `spreadsheets` | Read and write data to Google Sheets | **Essential** | Medium |

### Scope Assessment: ✅ APPROPRIATE

All requested scopes are **appropriate and necessary** for the application's functionality:

1. **Email & Profile** - Required for user identification and display
2. **Drive Access** - Required to let users select which spreadsheets to work with
3. **Sheets Access** - Required to read and update spreadsheet data

**No excessive or unnecessary scopes are requested.**

## User Data Collection and Storage

### Data Collected at Sign-In

When a user signs in via Google OAuth, the following information is collected:

```typescript
{
  email: string;        // User's email address
  name: string;         // User's full name
  picture: string;      // User's profile picture URL
  id: string;           // Google's unique user ID
}
```

### Database Storage

The application stores the following user information in the database:

```typescript
interface User {
  id: number;                    // Database primary key
  openId: string;                // Google ID (prefixed with "google-")
  email: string | null;          // User's email
  name: string | null;           // User's display name
  loginMethod: string;           // "google" or "manus"
  role: "user" | "admin";        // User role
  createdAt: Date;               // Account creation timestamp
  updatedAt: Date;               // Last update timestamp
  lastSignedIn: Date | null;     // Last login timestamp
}
```

### Data Usage Policy

✅ **Data is used only for:**
- User identification and authentication
- Displaying user information in the UI (name, email, avatar)
- Accessing Google Drive and Sheets on behalf of the user
- Audit logging (last sign-in timestamp)

❌ **Data is NOT used for:**
- Selling or sharing with third parties
- Marketing or advertising
- Profiling or tracking
- Any purpose beyond application functionality

## Security Best Practices Implemented

### 1. **OAuth 2.0 Authorization Code Flow**
- Uses the secure authorization code flow (not implicit flow)
- Includes CSRF protection via state parameter
- Tokens are exchanged server-side, not exposed to client

### 2. **Token Management**
- Access tokens are stored securely in HTTP-only cookies
- Refresh tokens are used to obtain new access tokens
- Token expiration is enforced
- Tokens are cleared on logout

### 3. **Session Security**
```typescript
// Session cookies are configured as:
const cookieOptions = {
  httpOnly: true,      // Not accessible from JavaScript
  secure: true,        // Only sent over HTTPS
  sameSite: "strict",  // CSRF protection
  maxAge: ONE_YEAR_MS, // Expiration time
};
```

### 4. **User Authentication**
- Every API request validates the user's session
- Protected procedures require authentication
- Unauthorized access is rejected with proper error codes

### 5. **Data Access Control**
- Users can only access their own data
- All database queries filter by `userId`
- Admin operations require admin role

### 6. **Input Validation**
- All user inputs are validated with Zod schemas
- API parameters are type-checked
- Invalid requests are rejected

## Privacy Considerations

### User Consent
✅ Users explicitly consent to OAuth scopes during sign-in
✅ Google's consent screen clearly displays what data is being requested
✅ Users can revoke access at any time from their Google account settings

### Data Retention
- User data is retained for account functionality
- Users can request data deletion (implement GDPR compliance if needed)
- Deleted accounts should have associated data removed

### Third-Party Access
- No third-party services have access to user data
- Google APIs are used only for their intended purposes
- No data is shared with external services

## Recommendations for Enhanced Security

### 1. **Implement Incremental Authorization**
If new scopes are needed in the future, use incremental authorization:
```typescript
// Request only the scopes needed at that moment
const newScopes = ["https://www.googleapis.com/auth/calendar"];
```

### 2. **Add Rate Limiting**
Implement rate limiting on authentication endpoints to prevent brute force attacks.

### 3. **Implement Audit Logging**
Log all authentication events:
- Sign-in attempts
- Sign-out events
- Failed authentication
- Scope changes

### 4. **Add Two-Factor Authentication (2FA)**
Consider implementing 2FA for enhanced security:
```typescript
// Example: TOTP-based 2FA
const twoFactorEnabled = user.twoFactorEnabled;
```

### 5. **Implement Account Recovery**
Add secure account recovery mechanisms:
- Email verification
- Security questions
- Recovery codes

### 6. **Regular Security Audits**
- Review OAuth token usage
- Monitor for suspicious authentication patterns
- Update dependencies regularly

### 7. **GDPR Compliance**
If serving EU users, implement:
- Data export functionality
- Right to be forgotten (data deletion)
- Privacy policy updates
- Consent management

## User Data Display in UI

### Profile Information Shown
The application displays the following user information in the navigation:

```typescript
// In DashboardLayout.tsx
<Avatar>
  <AvatarImage src={profileImageUrl} alt={userName} />
  <AvatarFallback>{userInitial}</AvatarFallback>
</Avatar>
<p className="text-sm font-medium">{userName}</p>
<p className="text-xs text-muted-foreground">{userEmail}</p>
```

### Privacy-Respecting Display
✅ Only essential information is displayed
✅ No sensitive data is exposed in the UI
✅ User can see what information is being stored
✅ Sign-out is easily accessible

## Compliance Checklist

- [x] OAuth scopes are appropriate and necessary
- [x] User data collection is minimal and justified
- [x] Data storage is secure and encrypted
- [x] User consent is obtained before data collection
- [x] Session security is properly implemented
- [x] Access control is enforced
- [x] Input validation is in place
- [x] Tokens are managed securely
- [x] User data is displayed transparently
- [x] Sign-out functionality is available
- [ ] GDPR compliance (if needed)
- [ ] Privacy policy is published
- [ ] Terms of service are published

## Conclusion

The Budget Flow v3 application implements OAuth 2.0 securely with:
- ✅ Appropriate scope requests
- ✅ Secure token management
- ✅ Proper access control
- ✅ User data privacy
- ✅ Transparent data usage

**The current implementation is secure and privacy-respecting.**

## References

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [OWASP OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [Google API Scopes](https://developers.google.com/identity/protocols/oauth2/scopes)
