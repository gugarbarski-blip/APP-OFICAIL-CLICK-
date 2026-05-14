import { createClient } from '@supabase/supabase-js';

function getDb() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Supabase env vars missing');
  return createClient(url, key);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const email = req.query.email as string;
  if (!email) return res.status(400).json({ error: 'Email obrigatório' });

  try {
    const { data, error } = await getDb()
      .from('pedidos')
      .select('id, status, produto, quantidade, valor_total, created_at, codigo_rastreio, tipo_personalizacao')
      .eq('email', email.toLowerCase().trim())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ pedidos: data || [] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
