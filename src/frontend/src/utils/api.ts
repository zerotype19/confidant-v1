interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

export async function apiRequest(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, headers = {} } = options;

  // Add /api prefix to all endpoints
  const path = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;

  const response = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
    throw new Error(errorData.error || `Request failed (${response.status})`);
  }

  return response.json();
} 