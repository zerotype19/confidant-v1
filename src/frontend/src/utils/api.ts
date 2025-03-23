import { API_URL } from '../config';

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

export async function apiRequest(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, headers = {} } = options;

  // Add /api prefix to all endpoints
  const path = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
  const url = `${API_URL}${path}`;

  // Get the auth token from the cookie
  const cookies = document.cookie.split(';');
  const authToken = cookies.find(cookie => cookie.trim().startsWith('auth_token='))?.split('=')[1];

  console.log('API Request:', {
    url,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
      ...headers,
    },
    hasBody: !!body,
  });

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        ...headers,
      },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });

    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
      console.error('API Error:', errorData);
      throw new Error(errorData.error || `Request failed (${response.status})`);
    }

    const data = await response.json();
    console.log('API Success:', data);
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
} 