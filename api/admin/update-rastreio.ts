import { createClient } from '@supabase/supabase-js';
import { validateAdminToken, getTokenFromRequest } from '../../lib/admin-auth';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();

  if (!validateAdminToken(getTokenFromRequest(req))) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const { id, codigo } = req.body || {};
  if (!id || !codigo || typeof codigo !== 'string' || codigo.trim().length === 0) {
    return res.status(400).json({ error: 'Parâmetros inválidos' });
  }

  const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
  const { error } = await db
    .from('pedidos')
    .update({ codigo_rastreio: codigo.trim(), status: 'enviado' })
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true });
}
