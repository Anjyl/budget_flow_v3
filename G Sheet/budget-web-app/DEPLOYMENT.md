# Deployment Guide

This guide covers deploying the Budget Web App to Vercel and Azure, with support for mobile app integration.

## Table of Contents

- [Vercel Deployment](#vercel-deployment)
- [Azure Deployment](#azure-deployment)
- [Mobile App Integration](#mobile-app-integration)
- [Environment Variables](#environment-variables)
- [CORS Configuration](#cors-configuration)
- [API Documentation](#api-documentation)

---

## Vercel Deployment

### Prerequisites

- Vercel account (https://vercel.com)
- GitHub repository connected to Vercel
- Environment variables configured

### Steps

1. **Connect Repository**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select the project root directory

2. **Configure Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add all required variables from `.env.example`:
     - `DATABASE_URL`
     - `JWT_SECRET`
     - `VITE_APP_ID`
     - `OAUTH_SERVER_URL`
     - `VITE_OAUTH_PORTAL_URL`
     - `OWNER_OPEN_ID`
     - `OWNER_NAME`
     - `BUILT_IN_FORGE_API_URL`
     - `BUILT_IN_FORGE_API_KEY`
     - `VITE_FRONTEND_FORGE_API_KEY`
     - `VITE_FRONTEND_FORGE_API_URL`

3. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app
   - Your app will be available at `https://your-project.vercel.app`

4. **Custom Domain** (Optional)
   - Go to Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

### Vercel-Specific Configuration

The `vercel.json` file includes:
- Build command: `pnpm build`
- Output directory: `dist`
- CORS headers for API routes
- Environment variable mappings
- Function memory and timeout settings

---

## Azure Deployment

### Prerequisites

- Azure account (https://azure.microsoft.com)
- Azure CLI installed
- Node.js 18+ runtime

### Steps

1. **Create Azure App Service**
   ```bash
   az group create --name budget-web-app-rg --location eastus
   az appservice plan create --name budget-web-app-plan --resource-group budget-web-app-rg --sku B1 --is-linux
   az webapp create --resource-group budget-web-app-rg --plan budget-web-app-plan --name budget-web-app --runtime "NODE|18"
   ```

2. **Configure Environment Variables**
   ```bash
   az webapp config appsettings set --resource-group budget-web-app-rg --name budget-web-app --settings \
     DATABASE_URL="your-database-url" \
     JWT_SECRET="your-secret" \
     VITE_APP_ID="your-app-id" \
     NODE_ENV="production" \
     PORT="8080"
   ```

3. **Deploy Code**
   ```bash
   # Using Git deployment
   az webapp deployment source config-local-git --resource-group budget-web-app-rg --name budget-web-app
   
   # Or using ZIP deployment
   zip -r app.zip . -x "node_modules/*" ".git/*"
   az webapp deployment source config-zip --resource-group budget-web-app-rg --name budget-web-app --src-path app.zip
   ```

4. **Install Dependencies and Build**
   - Azure will automatically run `npm install` and your build command
   - Ensure `package.json` has the correct build script

5. **Access Your App**
   - Your app will be available at `https://budget-web-app.azurewebsites.net`

### Azure-Specific Configuration

The `.azure/config.json` file includes:
- App Service plan settings
- Runtime configuration
- CORS settings
- Environment variable templates
- Startup command

---

## Mobile App Integration

### API Endpoints

The Budget Web App provides tRPC endpoints accessible from mobile apps:

**Base URL:** `https://your-domain.com/api/trpc`

### Authentication

Mobile apps can authenticate using:

1. **OAuth Flow** (Recommended)
   - Redirect to `VITE_OAUTH_PORTAL_URL` for login
   - Receive authentication token
   - Include token in API requests

2. **Session Cookies**
   - Automatic cookie management for web-based mobile views
   - Configure CORS to allow your mobile app domain

### CORS Configuration

The app is configured to accept requests from mobile apps:

```json
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  "Access-Control-Allow-Headers": "X-CSRF-Token, X-Requested-With, Accept, Authorization"
}
```

For production, restrict `Access-Control-Allow-Origin` to your specific mobile app domain.

### Making API Calls from Mobile App

**Example: Fetch Transactions**

```javascript
const response = await fetch('https://your-domain.com/api/trpc/transactions.list', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`, // If using token auth
  },
  credentials: 'include', // For cookie-based auth
});

const data = await response.json();
```

**Example: Create Transaction**

```javascript
const response = await fetch('https://your-domain.com/api/trpc/transactions.create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
  },
  body: JSON.stringify({
    amount: 5000,
    description: 'Grocery shopping',
    date: new Date(),
    categoryId: 1,
    type: 'expense',
  }),
  credentials: 'include',
});

const result = await response.json();
```

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL database connection string | `mysql://user:pass@host/db` |
| `JWT_SECRET` | Secret key for session signing | `your-secret-key` |
| `VITE_APP_ID` | OAuth application ID | `app-id-from-oauth-provider` |
| `OAUTH_SERVER_URL` | OAuth server base URL | `https://api.manus.im` |
| `VITE_OAUTH_PORTAL_URL` | OAuth login portal URL | `https://manus.im/login` |
| `OWNER_OPEN_ID` | Owner's OpenID | `owner-id` |
| `OWNER_NAME` | Owner's display name | `John Doe` |
| `BUILT_IN_FORGE_API_URL` | Forge API URL | `https://api.manus.im/forge` |
| `BUILT_IN_FORGE_API_KEY` | Forge API key | `api-key` |
| `VITE_FRONTEND_FORGE_API_KEY` | Frontend Forge API key | `frontend-key` |
| `VITE_FRONTEND_FORGE_API_URL` | Frontend Forge API URL | `https://api.manus.im/forge` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `3000` |
| `CORS_ORIGIN` | Allowed CORS origins | `*` |
| `LOG_LEVEL` | Logging level | `info` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

---

## CORS Configuration

### For Vercel

CORS headers are automatically configured in `vercel.json` for all `/api/*` routes.

### For Azure

Update CORS settings in Azure Portal:

1. Go to App Service → CORS
2. Add your mobile app domain(s)
3. Configure allowed methods and headers

### For Local Development

CORS is handled by the Express server in `server/_core/index.ts`.

---

## API Documentation

### Available Endpoints

#### Transactions
- `GET /api/trpc/transactions.list` - List all transactions
- `POST /api/trpc/transactions.create` - Create transaction
- `POST /api/trpc/transactions.update` - Update transaction
- `POST /api/trpc/transactions.delete` - Delete transaction

#### Categories
- `GET /api/trpc/categories.list` - List all categories
- `POST /api/trpc/categories.create` - Create category
- `POST /api/trpc/categories.update` - Update category
- `POST /api/trpc/categories.delete` - Delete category

#### Budgets
- `GET /api/trpc/budgets.list` - List budgets
- `POST /api/trpc/budgets.create` - Create budget
- `POST /api/trpc/budgets.update` - Update budget
- `POST /api/trpc/budgets.delete` - Delete budget

#### Recurring Transactions
- `GET /api/trpc/recurringTransactions.list` - List recurring transactions
- `POST /api/trpc/recurringTransactions.create` - Create recurring transaction
- `POST /api/trpc/recurringTransactions.update` - Update recurring transaction
- `POST /api/trpc/recurringTransactions.delete` - Delete recurring transaction

#### Summary & Analytics
- `GET /api/trpc/summary.monthly` - Get monthly summary

---

## Troubleshooting

### Vercel Deployment Issues

**Build fails with "Command not found"**
- Ensure `pnpm` is installed: Add `npm install -g pnpm` to build settings

**Environment variables not loading**
- Verify variables are set in Vercel dashboard
- Check variable names match exactly (case-sensitive)

**CORS errors from mobile app**
- Verify mobile app domain is allowed in CORS headers
- Check browser console for specific error messages

### Azure Deployment Issues

**App won't start**
- Check startup command in `package.json`
- Verify all environment variables are set
- Review application logs in Azure Portal

**Database connection fails**
- Verify `DATABASE_URL` is correct
- Check database firewall rules allow Azure IP
- Ensure database user has correct permissions

**Port binding error**
- Ensure app listens on port `8080` (Azure standard)
- Check `PORT` environment variable is set to `8080`

---

## Security Considerations

1. **Environment Variables**: Never commit secrets to version control
2. **CORS**: Restrict to specific domains in production
3. **Database**: Use strong passwords and enable encryption
4. **SSL/TLS**: Both platforms provide free HTTPS
5. **Rate Limiting**: Implement to prevent abuse
6. **Authentication**: Always validate tokens on the server

---

## Support

For issues or questions:
- Check application logs in your deployment platform
- Review error messages in browser console
- Verify environment variables are correctly set
- Test API endpoints using tools like Postman or curl
