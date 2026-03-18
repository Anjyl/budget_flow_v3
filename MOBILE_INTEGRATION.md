# Mobile App Integration Guide

This guide explains how to integrate the Budget Web App with your mobile application (iOS, Android, React Native, Flutter, etc.).

## Overview

The Budget Web App provides a complete REST/tRPC API that can be consumed by any mobile application. You can either:

1. **Embed as WebView** - Display the web app directly in your mobile app
2. **Use Native UI with API** - Build native mobile UI and call the API endpoints
3. **Hybrid Approach** - Mix native UI with WebView components

## Option 1: WebView Integration (Easiest)

### React Native Example

```javascript
import { WebView } from 'react-native-webview';
import { useAuth } from './contexts/AuthContext';

export function BudgetWebView() {
  const { authToken } = useAuth();

  return (
    <WebView
      source={{ uri: 'https://your-domain.com' }}
      startInLoadingState={true}
      injectedJavaScript={`
        window.authToken = '${authToken}';
        window.mobileApp = true;
      `}
      onMessage={(event) => {
        // Handle messages from web app
        const data = JSON.parse(event.nativeEvent.data);
        console.log('Message from web:', data);
      }}
    />
  );
}
```

### Flutter Example

```dart
import 'package:flutter_webview_plugin/flutter_webview_plugin.dart';

class BudgetWebView extends StatefulWidget {
  @override
  _BudgetWebViewState createState() => _BudgetWebViewState();
}

class _BudgetWebViewState extends State<BudgetWebView> {
  final flutterWebViewPlugin = FlutterWebviewPlugin();

  @override
  void initState() {
    super.initState();
    flutterWebViewPlugin.onUrlChanged.listen((String url) {
      // Handle URL changes
    });
  }

  @override
  Widget build(BuildContext context) {
    return WebviewScaffold(
      url: 'https://your-domain.com',
      appBar: AppBar(title: Text('Budget')),
      withJavascript: true,
      withLocalStorage: true,
      withZoom: true,
    );
  }
}
```

### Native iOS (Swift) Example

```swift
import WebKit

class BudgetWebViewController: UIViewController, WKNavigationDelegate {
    var webView: WKWebView!
    let authToken: String = "your-auth-token"

    override func viewDidLoad() {
        super.viewDidLoad()

        let webConfiguration = WKWebViewConfiguration()
        webConfiguration.allowsInlineMediaPlayback = true
        
        webView = WKWebView(frame: .zero, configuration: webConfiguration)
        webView.navigationDelegate = self
        view = webView

        var request = URLRequest(url: URL(string: "https://your-domain.com")!)
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        
        webView.load(request)
    }
}
```

### Native Android (Kotlin) Example

```kotlin
import android.webkit.WebView
import android.webkit.WebViewClient

class BudgetWebViewActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_webview)

        val webView: WebView = findViewById(R.id.webview)
        webView.webViewClient = WebViewClient()
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
        }

        val authToken = "your-auth-token"
        val headers = mapOf("Authorization" to "Bearer $authToken")
        
        webView.loadUrl("https://your-domain.com", headers)
    }
}
```

## Option 2: Native UI with API Calls

### React Native Example

```javascript
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';

const API_BASE = 'https://your-domain.com/api/trpc';

export function TransactionsScreen() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const authToken = useAuthToken(); // Get from your auth context

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.post(
        `${API_BASE}/transactions.list`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setTransactions(response.data.result.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (amount, description, categoryId) => {
    try {
      await axios.post(
        `${API_BASE}/transactions.create`,
        {
          json: {
            amount: Math.round(amount * 100),
            description,
            date: new Date().toISOString().split('T')[0],
            categoryId,
            type: 'expense',
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      fetchTransactions(); // Refresh list
    } catch (error) {
      console.error('Failed to add transaction:', error);
    }
  };

  return (
    <View>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View>
              <Text>{item.description}</Text>
              <Text>${(item.amount / 100).toFixed(2)}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
```

### Flutter Example

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class BudgetService {
  static const String baseUrl = 'https://your-domain.com/api/trpc';
  final String authToken;

  BudgetService(this.authToken);

  Future<List<Transaction>> getTransactions() async {
    final response = await http.post(
      Uri.parse('$baseUrl/transactions.list'),
      headers: {
        'Authorization': 'Bearer $authToken',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final transactions = (data['result']['data'] as List)
          .map((t) => Transaction.fromJson(t))
          .toList();
      return transactions;
    } else {
      throw Exception('Failed to load transactions');
    }
  }

  Future<void> createTransaction({
    required double amount,
    required String description,
    required int categoryId,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/transactions.create'),
      headers: {
        'Authorization': 'Bearer $authToken',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'json': {
          'amount': (amount * 100).toInt(),
          'description': description,
          'date': DateTime.now().toIso8601String().split('T')[0],
          'categoryId': categoryId,
          'type': 'expense',
        }
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to create transaction');
    }
  }
}

class TransactionsScreen extends StatefulWidget {
  @override
  _TransactionsScreenState createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends State<TransactionsScreen> {
  late BudgetService budgetService;
  late Future<List<Transaction>> futureTransactions;

  @override
  void initState() {
    super.initState();
    budgetService = BudgetService(getAuthToken()); // Get from your auth
    futureTransactions = budgetService.getTransactions();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Transaction>>(
      future: futureTransactions,
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          return ListView.builder(
            itemCount: snapshot.data!.length,
            itemBuilder: (context, index) {
              final transaction = snapshot.data![index];
              return ListTile(
                title: Text(transaction.description),
                subtitle: Text(transaction.date),
                trailing: Text('\$${(transaction.amount / 100).toStringAsFixed(2)}'),
              );
            },
          );
        } else if (snapshot.hasError) {
          return Text('Error: ${snapshot.error}');
        }
        return CircularProgressIndicator();
      },
    );
  }
}
```

## Authentication

### OAuth Flow for Mobile Apps

1. **Initiate Login**
   ```javascript
   // Open OAuth portal in browser or WebView
   const oauthUrl = `${OAUTH_PORTAL_URL}?redirect_uri=${encodeURIComponent(redirectUri)}`;
   // Open URL in browser
   ```

2. **Handle Redirect**
   ```javascript
   // Your app receives callback with auth token
   // Store token securely (use secure storage)
   ```

3. **Use Token in API Calls**
   ```javascript
   const headers = {
     'Authorization': `Bearer ${authToken}`,
     'Content-Type': 'application/json',
   };
   ```

### Secure Token Storage

**React Native:**
```javascript
import * as SecureStore from 'expo-secure-store';

// Save token
await SecureStore.setItemAsync('authToken', token);

// Retrieve token
const token = await SecureStore.getItemAsync('authToken');

// Delete token
await SecureStore.deleteItemAsync('authToken');
```

**Flutter:**
```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final storage = FlutterSecureStorage();

// Save token
await storage.write(key: 'authToken', value: token);

// Retrieve token
final token = await storage.read(key: 'authToken');

// Delete token
await storage.delete(key: 'authToken');
```

## CORS Configuration for Mobile Apps

The API is configured to accept requests from mobile apps. For production, you may want to restrict CORS:

```javascript
// In server configuration
const allowedOrigins = [
  'https://your-domain.com',
  'capacitor://localhost',  // Ionic/Capacitor
  'http://localhost:8080',  // Local development
];
```

## Error Handling

Always implement proper error handling:

```javascript
async function apiCall(endpoint, data) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      // Token expired, refresh or redirect to login
      handleTokenExpired();
    } else if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API Error');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    // Show error to user
    showErrorMessage(error.message);
  }
}
```

## Performance Optimization

### Caching

```javascript
// React Native with AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

async function getCachedTransactions() {
  const cached = await AsyncStorage.getItem('transactions');
  if (cached) {
    return JSON.parse(cached);
  }
  
  const fresh = await fetchTransactions();
  await AsyncStorage.setItem('transactions', JSON.stringify(fresh));
  return fresh;
}
```

### Pagination

```javascript
// Fetch transactions with pagination
async function getTransactionsPaginated(page = 1, limit = 20) {
  const response = await fetch(
    `${API_BASE}/transactions.list?page=${page}&limit=${limit}`,
    {
      headers: { 'Authorization': `Bearer ${authToken}` },
    }
  );
  return response.json();
}
```

## Testing

### Unit Tests

```javascript
// Jest example
describe('BudgetService', () => {
  it('should fetch transactions', async () => {
    const service = new BudgetService('test-token');
    const transactions = await service.getTransactions();
    expect(transactions).toBeInstanceOf(Array);
  });

  it('should create transaction', async () => {
    const service = new BudgetService('test-token');
    const result = await service.createTransaction({
      amount: 50,
      description: 'Test',
      categoryId: 1,
    });
    expect(result).toBeDefined();
  });
});
```

### Integration Tests

```javascript
// Test against staging API
const STAGING_API = 'https://staging.your-domain.com/api/trpc';

describe('API Integration', () => {
  it('should work end-to-end', async () => {
    // Create transaction
    const createResponse = await fetch(`${STAGING_API}/transactions.create`, {
      method: 'POST',
      body: JSON.stringify({
        json: {
          amount: 5000,
          description: 'Test transaction',
          date: new Date().toISOString().split('T')[0],
          categoryId: 1,
          type: 'expense',
        },
      }),
    });
    expect(createResponse.ok).toBe(true);

    // Fetch transactions
    const listResponse = await fetch(`${STAGING_API}/transactions.list`, {
      method: 'POST',
    });
    expect(listResponse.ok).toBe(true);
  });
});
```

## Troubleshooting

### CORS Errors

**Problem:** "Access to XMLHttpRequest blocked by CORS policy"

**Solution:**
1. Verify API domain is allowed in CORS headers
2. Check Authorization header is included
3. Ensure credentials are set correctly

### Authentication Failures

**Problem:** "401 Unauthorized"

**Solution:**
1. Verify auth token is valid and not expired
2. Check token is included in Authorization header
3. Ensure token format is `Bearer {token}`

### Network Issues

**Problem:** "Network request failed"

**Solution:**
1. Check internet connectivity
2. Verify API endpoint URL is correct
3. Check firewall/proxy settings
4. Test with curl: `curl -X POST https://your-domain.com/api/trpc/auth.me`

## Support

For integration issues:
- Check [API Documentation](./API.md)
- Review [Deployment Guide](./DEPLOYMENT.md)
- Check application logs
- Test endpoints with Postman or curl

---

**Last Updated:** March 2026
