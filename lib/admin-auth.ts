import { createHmac, timingSafeEqual } from 'crypto';

const TOKEN_MAX_AGE_MS = 12 * 60 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error('ADMIN_SECRET não configurado');
  return secret;
}

export function validateAdminToken(token: string | undefined): boolean {
  let secret: string;
  try {
    secret = getSecret();
  } catch {
    console.error('CRITICAL: ADMIN_SECRET não configurado — acesso admin bloqueado');
    return false;
  }
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [ts, hmac] = parts;

  const age = Date.now() - parseInt(ts, 10);
  if (isNaN(age) || age < 0 || age > TOKEN_MAX_AGE_MS) return false;

  const expected = createHmac('sha256', secret).update(ts).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(hmac), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function getTokenFromRequest(req: any): string | undefined {
  const auth = req.headers?.authorization as string | undefined;
  if (!auth?.startsWith('Bearer ')) return undefined;
  return auth.slice(7);
}
