import { createClient } from '@supabase/supabase-js';
import { validateAdminToken, getTokenFromRequest } from '../../lib/admin-auth';

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
