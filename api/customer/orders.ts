import { createClient } from '@supabase/supabase-js';

function getDb() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Supabase env vars missing');
  return createClient(url, key);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization as string | undefined;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  const token = authHeader.slice(7);
  const db = getDb();

  const { data: { user }, error: authError } = await db.auth.getUser(token);
  if (authError || !user?.email) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }

  try {
    const { data, error } = await db
      .from('pedidos')
      .select('id, status, produto, quantidade, valor_total, created_at, codigo_rastreio, tipo_personalizacao')
      .eq('email', user.email.toLowerCase().trim())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ pedidos: data || [] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
