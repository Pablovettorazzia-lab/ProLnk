export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    signal: options.signal ?? AbortSignal.timeout(55000),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || 'The request could not be completed. Please try again.');
  if (data === null) throw new Error('The service is unavailable. Please try again.');
  return data as T;
}
