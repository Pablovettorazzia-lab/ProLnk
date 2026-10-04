import { verifyRequestOrigin } from '@netlify/identity';

export function checkOrigin(request: Request) {
  if (request.method === 'GET') return null;
  try {
    verifyRequestOrigin(request);
    return null;
  } catch {
    return Response.json({ error: 'Origen de la solicitud no permitido.' }, { status: 403 });
  }
}
