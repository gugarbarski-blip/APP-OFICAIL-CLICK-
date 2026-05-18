import { createHmac } from 'crypto';

const TOKEN_MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12 horas

function getSecret(): string | undefined {
  return process.env.ADMIN_SECRET ?? process.env.SUPABASE_SERVICE_KEY;
}

export function validateAdminToken(token: string | undefined): boolean {
  const secret = getSecret();
  if (!secret || !token) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [ts, hmac] = parts;

  const age = Date.now() - parseInt(ts, 10);
  if (isNaN(age) || age < 0 || age > TOKEN_MAX_AGE_MS) return false;

  const expected = createHmac('sha256', secret).update(ts).digest('hex');
  return hmac === expected;
}

export function getTokenFromRequest(req: any): string | undefined {
  const auth = req.headers?.authorization as string | undefined;
  if (!auth?.startsWith('Bearer ')) return undefined;
  return auth.slice(7);
}
