# Budget Web App - Project TODO

## Architecture & Setup
- [x] Initialize web-db-user project scaffold
- [ ] Design system and color palette (clean, financial-focused)
- [ ] Set up global styles and Tailwind configuration

## Database Schema
- [ ] Create transactions table (id, userId, amount, description, date, categoryId)
- [ ] Create categories table (id, name, color, icon)
- [ ] Create budgets table (id, userId, categoryId, limit, month)
- [ ] Create recurring_transactions table (id, userId, templateName, amount, categoryId, frequency, nextDueDate)
- [ ] Create google_sheets_sync table (id, userId, spreadsheetId, lastSyncedAt)
- [ ] Run migrations and verify schema

## Backend - Core Features
- [ ] Implement transaction CRUD procedures (create, read, update, delete, list)
- [ ] Implement category CRUD procedures
- [ ] Implement budget CRUD procedures
- [ ] Implement recurring transaction procedures
- [ ] Add transaction filtering and search procedure
- [ ] Add monthly budget summary calculation procedure
- [ ] Add spending breakdown by category procedure
- [ ] Write vitest tests for transaction procedures
- [ ] Write vitest tests for budget calculation procedures

## Frontend - Landing Page & Authentication
- [x] Create landing page with login button only (no login form)
- [x] Landing page redirects to OAuth login
- [x] After login, redirect to file chooser page
- [x] Create file chooser page to browse Google Drive
- [x] Add spreadsheet selection and preview
- [x] Apply economics-themed aesthetics to Document Editor
- [ ] Store selected spreadsheet in user session/database

## Frontend - Dashboard & Layout
- [x] Design dashboard layout with sidebar navigation
- [x] Create DashboardLayout component with user profile
- [x] Implement navigation menu with links to main features
- [x] Create dashboard home page showing key metrics (only after file selected)
- [x] Add responsive design for mobile and tablet
- [x] Protect dashboard route - only accessible after file selection

## Frontend - Transaction Management
- [ ] Create transaction entry form component
- [ ] Implement form validation (amount, date, category required)
- [ ] Create transaction history list component
- [ ] Implement filtering by category and date range
- [ ] Implement search functionality
- [ ] Add edit/delete transaction functionality
- [ ] Create transaction detail view

## Frontend - Categories & Budgets
- [ ] Create category management page
- [ ] Implement add/edit/delete category functionality
- [ ] Create budget setup page
- [ ] Implement budget limit management
- [ ] Add budget alert when spending exceeds limit

## Frontend - Analytics & Charts
- [ ] Create monthly summary dashboard with key metrics
- [ ] Implement pie chart for expense distribution by category
- [ ] Implement bar chart for spending trends over time
- [ ] Add monthly comparison view
- [ ] Create category-wise spending breakdown view

## Frontend - Recurring Transactions
- [ ] Create recurring transaction template page
- [ ] Implement template creation form
- [ ] Add auto-generation of transactions from templates
- [ ] Create template management (edit, delete, pause)
- [ ] Add frequency options (weekly, biweekly, monthly, yearly)

## Frontend - AI Assistant
- [ ] Create AI chat interface component
- [ ] Implement message history display
- [ ] Add input field with send button
- [ ] Integrate with backend LLM service
- [ ] Implement streaming response display
- [ ] Add context about user's budget data to AI prompts
- [ ] Create sample prompts for common questions

## Google Sheets Integration
- [x] Set up Google OAuth credentials for Drive API
- [ ] Implement Google Sheets API authentication flow
- [ ] Create backend procedure to list user's spreadsheets
- [x] Build multi-sheet parser for selected file
- [x] Create spreadsheet editor component with cell editing
- [ ] Implement write data back to Google Sheets
- [ ] Create sync status tracking in database
- [ ] Link selected spreadsheet to user account
- [ ] Display selected sheet data in dashboard
- [ ] Add manual sync and refresh functionality

## Testing & Quality
- [ ] Test transaction CRUD operations
- [ ] Test budget calculations and summaries
- [ ] Test category filtering and search
- [ ] Test Google Sheets sync functionality
- [ ] Test AI assistant responses
- [ ] Test recurring transaction generation
- [ ] Test responsive design on mobile/tablet
- [ ] Test form validation and error handling
- [ ] Test authentication and authorization

## Deployment & Mobile Integration
- [x] Add CORS configuration for mobile app access
- [x] Create API documentation for mobile app developers
- [x] Implement API authentication tokens for app-to-web communication
- [x] Add Vercel deployment configuration (vercel.json)
- [x] Add Azure deployment configuration (.azure/config.json)
- [x] Create environment variable templates for both platforms
- [ ] Implement mobile-friendly responsive design
- [ ] Add API rate limiting and security headers
- [x] Create deployment documentation
- [x] Create mobile integration guide
- [x] Create GitHub Actions CI/CD workflow

## UI/UX Enhancements
- [x] Add sign out button to all pages
- [x] Create header/navbar component with user profile and logout

## Final Testing & Deployment
- [ ] Review all features and UI
- [ ] Fix any identified bugs
- [ ] Test mobile app integration
- [ ] Optimize performance
- [ ] Create final checkpoint
- [ ] Prepare for publishing
