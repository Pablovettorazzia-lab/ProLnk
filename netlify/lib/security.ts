import { verifyRequestOrigin } from '@netlify/identity';

export function checkOrigin(request: Request) {
  if (request.method === 'GET') return null;
  try {
    verifyRequestOrigin(request);
    return null;
  } catch {
    return Response.json({ error: 'This request origin is not allowed.' }, { status: 403 });
  }
}
