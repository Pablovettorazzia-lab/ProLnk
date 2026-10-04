export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    signal: options.signal ?? AbortSignal.timeout(55000),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || 'No se pudo completar la solicitud. Inténtalo de nuevo.');
  if (data === null) throw new Error('El servicio no está disponible. Inténtalo de nuevo.');
  return data as T;
}
