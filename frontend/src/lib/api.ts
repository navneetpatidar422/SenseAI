const API_BASE = '/api';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: { message: 'Network response was not ok' } }));
    throw new Error(errorData.error?.message || 'API request failed');
  }

  return res.json();
}

export async function streamApi(
  endpoint: string,
  body: any,
  onToken: (token: string) => void,
  onDone?: (fullText: string) => void,
  onError?: (err: Error) => void
) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulated = '';
    let buffer = '';

    if (!reader) throw new Error('Response body reader unreadable');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('event: token')) {
          const dataMatch = line.match(/data: (.*)/);
          if (dataMatch) {
            try {
              const parsed = JSON.parse(dataMatch[1]);
              accumulated += parsed.token;
              onToken(parsed.token);
            } catch (e) {
              console.error('SSE token parse error:', e);
            }
          }
        } else if (line.startsWith('event: done')) {
          if (onDone) onDone(accumulated);
        } else if (line.startsWith('event: error')) {
          const dataMatch = line.match(/data: (.*)/);
          if (dataMatch) {
            const parsed = JSON.parse(dataMatch[1]);
            throw new Error(parsed.message || 'Stream error');
          }
        }
      }
    }

    if (onDone) onDone(accumulated);
  } catch (err: any) {
    console.error('Streaming error:', err);
    if (onError) onError(err);
  }
}
