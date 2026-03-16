# Budget Web App - API Documentation

This document provides comprehensive API documentation for integrating the Budget Web App with mobile applications and third-party services.

## Overview

The Budget Web App uses **tRPC** for type-safe API communication. All endpoints are accessible via HTTP POST requests to `/api/trpc/{procedure}`.

## Base URL

```
https://your-domain.com/api/trpc
```

## Authentication

### OAuth Flow (Recommended)

1. Redirect user to OAuth portal: `{VITE_OAUTH_PORTAL_URL}`
2. User logs in and is redirected back with authentication token
3. Include token in subsequent requests

### Session Cookies

The API automatically manages session cookies. Include `credentials: 'include'` in fetch requests.

## Request Format

All requests should include:

```javascript
{
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer {token}" // Optional, if using token auth
  },
  "credentials": "include" // For cookie-based auth
}
```

## Response Format

All responses follow this format:

```javascript
{
  "result": {
    "data": { /* response data */ },
    "error": null
  }
}
```

Errors:

```javascript
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "User not authenticated",
    "data": {}
  }
}
```

---

## Transactions API

### List Transactions

**Endpoint:** `POST /api/trpc/transactions.list`

**Request:**
```javascript
{
  "json": {
    "categoryId": 1,           // Optional: Filter by category
    "startDate": "2026-03-01", // Optional: Start date (ISO format)
    "endDate": "2026-03-31"    // Optional: End date (ISO format)
  }
}
```

**Response:**
```javascript
{
  "result": {
    "data": [
      {
        "id": 1,
        "userId": 1,
        "amount": 5000,              // In cents ($50.00)
        "description": "Grocery shopping",
        "date": "2026-03-13T10:30:00Z",
        "categoryId": 1,
        "type": "expense",           // "expense" or "income"
        "googleSheetsRowId": null,
        "createdAt": "2026-03-13T10:30:00Z",
        "updatedAt": "2026-03-13T10:30:00Z"
      }
    ]
  }
}
```

### Create Transaction

**Endpoint:** `POST /api/trpc/transactions.create`

**Request:**
```javascript
{
  "json": {
    "amount": 5000,                    // Required: In cents
    "description": "Grocery shopping", // Optional
    "date": "2026-03-13",              // Required: ISO date format
    "categoryId": 1,                   // Required
    "type": "expense"                  // Required: "expense" or "income"
  }
}
```

**Response:**
```javascript
{
  "result": {
    "data": {
      "insertId": 1,
      "affectedRows": 1
    }
  }
}
```

### Update Transaction

**Endpoint:** `POST /api/trpc/transactions.update`

**Request:**
```javascript
{
  "json": {
    "id": 1,                           // Required
    "data": {
      "amount": 7500,                  // Optional
      "description": "Updated desc",   // Optional
      "date": "2026-03-14",            // Optional
      "categoryId": 2,                 // Optional
      "type": "income"                 // Optional
    }
  }
}
```

**Response:**
```javascript
{
  "result": {
    "data": {
      "affectedRows": 1
    }
  }
}
```

### Delete Transaction

**Endpoint:** `POST /api/trpc/transactions.delete`

**Request:**
```javascript
{
  "json": {
    "id": 1  // Required
  }
}
```

**Response:**
```javascript
{
  "result": {
    "data": {
      "affectedRows": 1
    }
  }
}
```

---

## Categories API

### List Categories

**Endpoint:** `POST /api/trpc/categories.list`

**Request:** No parameters required

**Response:**
```javascript
{
  "result": {
    "data": [
      {
        "id": 1,
        "userId": 1,
        "name": "Food",
        "color": "#FF6B6B",
        "icon": "utensils",
        "createdAt": "2026-03-13T10:30:00Z",
        "updatedAt": "2026-03-13T10:30:00Z"
      }
    ]
  }
}
```

### Create Category

**Endpoint:** `POST /api/trpc/categories.create`

**Request:**
```javascript
{
  "json": {
    "name": "Food",           // Required
    "color": "#FF6B6B",       // Optional: Hex color code
    "icon": "utensils"        // Optional: Lucide icon name
  }
}
```

**Response:**
```javascript
{
  "result": {
    "data": {
      "insertId": 1,
      "affectedRows": 1
    }
  }
}
```

### Update Category

**Endpoint:** `POST /api/trpc/categories.update`

**Request:**
```javascript
{
  "json": {
    "id": 1,
    "data": {
      "name": "Groceries",    // Optional
      "color": "#4ECDC4",     // Optional
      "icon": "shopping-cart" // Optional
    }
  }
}
```

### Delete Category

**Endpoint:** `POST /api/trpc/categories.delete`

**Request:**
```javascript
{
  "json": {
    "id": 1  // Required
  }
}
```

---

## Budgets API

### List Budgets

**Endpoint:** `POST /api/trpc/budgets.list`

**Request:**
```javascript
{
  "json": {
    "month": "2026-03"  // Optional: Format YYYY-MM
  }
}
```

**Response:**
```javascript
{
  "result": {
    "data": [
      {
        "id": 1,
        "userId": 1,
        "categoryId": 1,
        "limit": 50000,        // In cents ($500.00)
        "month": "2026-03",
        "createdAt": "2026-03-13T10:30:00Z",
        "updatedAt": "2026-03-13T10:30:00Z"
      }
    ]
  }
}
```

### Create Budget

**Endpoint:** `POST /api/trpc/budgets.create`

**Request:**
```javascript
{
  "json": {
    "categoryId": 1,      // Required
    "limit": 50000,       // Required: In cents
    "month": "2026-03"    // Required: Format YYYY-MM
  }
}
```

### Update Budget

**Endpoint:** `POST /api/trpc/budgets.update`

**Request:**
```javascript
{
  "json": {
    "id": 1,
    "data": {
      "categoryId": 2,    // Optional
      "limit": 75000,     // Optional
      "month": "2026-04"  // Optional
    }
  }
}
```

### Delete Budget

**Endpoint:** `POST /api/trpc/budgets.delete`

**Request:**
```javascript
{
  "json": {
    "id": 1  // Required
  }
}
```

---

## Recurring Transactions API

### List Recurring Transactions

**Endpoint:** `POST /api/trpc/recurringTransactions.list`

**Response:**
```javascript
{
  "result": {
    "data": [
      {
        "id": 1,
        "userId": 1,
        "templateName": "Monthly Rent",
        "amount": 100000,           // In cents
        "categoryId": 5,
        "frequency": "monthly",     // "weekly", "biweekly", "monthly", "yearly"
        "nextDueDate": "2026-04-01T00:00:00Z",
        "isActive": 1,
        "createdAt": "2026-03-13T10:30:00Z",
        "updatedAt": "2026-03-13T10:30:00Z"
      }
    ]
  }
}
```

### Create Recurring Transaction

**Endpoint:** `POST /api/trpc/recurringTransactions.create`

**Request:**
```javascript
{
  "json": {
    "templateName": "Monthly Rent",    // Required
    "amount": 100000,                  // Required: In cents
    "categoryId": 5,                   // Required
    "frequency": "monthly",            // Required: "weekly", "biweekly", "monthly", "yearly"
    "nextDueDate": "2026-04-01"        // Required: ISO date format
  }
}
```

### Update Recurring Transaction

**Endpoint:** `POST /api/trpc/recurringTransactions.update`

**Request:**
```javascript
{
  "json": {
    "id": 1,
    "data": {
      "templateName": "Rent Payment",  // Optional
      "amount": 120000,                // Optional
      "categoryId": 5,                 // Optional
      "frequency": "monthly",          // Optional
      "nextDueDate": "2026-04-01",     // Optional
      "isActive": 1                    // Optional: 0 or 1
    }
  }
}
```

### Delete Recurring Transaction

**Endpoint:** `POST /api/trpc/recurringTransactions.delete`

**Request:**
```javascript
{
  "json": {
    "id": 1  // Required
  }
}
```

---

## Summary & Analytics API

### Get Monthly Summary

**Endpoint:** `POST /api/trpc/summary.monthly`

**Request:**
```javascript
{
  "json": {
    "month": "2026-03"  // Required: Format YYYY-MM
  }
}
```

**Response:**
```javascript
{
  "result": {
    "data": [
      {
        "categoryId": 1,
        "categoryName": "Food",
        "categoryColor": "#FF6B6B",
        "categoryIcon": "utensils",
        "total": 25000,    // In cents
        "count": 5         // Number of transactions
      }
    ]
  }
}
```

---

## Authentication API

### Get Current User

**Endpoint:** `POST /api/trpc/auth.me`

**Response:**
```javascript
{
  "result": {
    "data": {
      "id": 1,
      "openId": "user-open-id",
      "name": "John Doe",
      "email": "john@example.com",
      "loginMethod": "manus",
      "role": "user",  // "user" or "admin"
      "createdAt": "2026-03-13T10:30:00Z",
      "updatedAt": "2026-03-13T10:30:00Z",
      "lastSignedIn": "2026-03-13T10:30:00Z"
    }
  }
}
```

### Logout

**Endpoint:** `POST /api/trpc/auth.logout`

**Response:**
```javascript
{
  "result": {
    "data": {
      "success": true
    }
  }
}
```

---

## Error Codes

| Code | Description | HTTP Status |
|------|-------------|------------|
| `UNAUTHORIZED` | User not authenticated | 401 |
| `FORBIDDEN` | User lacks permission | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `BAD_REQUEST` | Invalid request parameters | 400 |
| `INTERNAL_SERVER_ERROR` | Server error | 500 |
| `UNPROCESSABLE_CONTENT` | Validation error | 422 |

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Window:** 15 minutes (900 seconds)
- **Limit:** 100 requests per window per IP
- **Headers:**
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

---

## Code Examples

### JavaScript/TypeScript

```javascript
// Fetch transactions
async function getTransactions() {
  const response = await fetch('https://your-domain.com/api/trpc/transactions.list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  const { result } = await response.json();
  return result.data;
}

// Create transaction
async function createTransaction(amount, description, categoryId) {
  const response = await fetch('https://your-domain.com/api/trpc/transactions.create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      json: {
        amount: Math.round(amount * 100), // Convert to cents
        description,
        date: new Date().toISOString().split('T')[0],
        categoryId,
        type: 'expense',
      },
    }),
    credentials: 'include',
  });
  
  const { result } = await response.json();
  return result.data;
}
```

### Python

```python
import requests
import json
from datetime import datetime

BASE_URL = 'https://your-domain.com/api/trpc'

# Get transactions
def get_transactions():
    response = requests.post(
        f'{BASE_URL}/transactions.list',
        headers={'Content-Type': 'application/json'},
        json={}
    )
    return response.json()['result']['data']

# Create transaction
def create_transaction(amount, description, category_id):
    response = requests.post(
        f'{BASE_URL}/transactions.create',
        headers={'Content-Type': 'application/json'},
        json={
            'json': {
                'amount': int(amount * 100),  # Convert to cents
                'description': description,
                'date': datetime.now().isoformat().split('T')[0],
                'categoryId': category_id,
                'type': 'expense'
            }
        }
    )
    return response.json()['result']['data']
```

### cURL

```bash
# Get transactions
curl -X POST https://your-domain.com/api/trpc/transactions.list \
  -H "Content-Type: application/json" \
  -d '{}'

# Create transaction
curl -X POST https://your-domain.com/api/trpc/transactions.create \
  -H "Content-Type: application/json" \
  -d '{
    "json": {
      "amount": 5000,
      "description": "Grocery shopping",
      "date": "2026-03-13",
      "categoryId": 1,
      "type": "expense"
    }
  }'
```

---

## Support

For API issues or questions, please refer to:
- [Deployment Guide](./DEPLOYMENT.md)
- [Project Documentation](./README.md)
- GitHub Issues

---

**Last Updated:** March 2026
**API Version:** 1.0
