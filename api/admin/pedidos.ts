import { createClient } from '@supabase/supabase-js';
import { createHmac, timingSafeEqual } from 'crypto';

const TOKEN_MAX_AGE_MS = 12 * 60 * 60 * 1000;

function validateAdminToken(token: string | undefined): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || !token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [ts, hmac] = parts;
  const age = Date.now() - parseInt(ts, 10);
  if (isNaN(age) || age < 0 || age > TOKEN_MAX_AGE_MS) return false;
  const expected = createHmac('sha256', secret).update(ts).digest('hex');
  try { return timingSafeEqual(Buffer.from(hmac), Buffer.from(expected)); } catch { return false; }
}

function getTokenFromRequest(req: any): string | undefined {
  const auth = req.headers?.authorization as string | undefined;
  if (!auth?.startsWith('Bearer ')) return undefined;
  return auth.slice(7);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).end();

  if (!validateAdminToken(getTokenFromRequest(req))) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_KEY!;
  const db = createClient(url, key);

  const { data, error } = await db
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ pedidos: data });
}
