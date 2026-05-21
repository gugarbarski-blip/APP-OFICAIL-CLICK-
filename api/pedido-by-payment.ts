import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).end();

  const paymentId = req.query?.payment_id as string | undefined;
  const pedidoId  = req.query?.pedido_id  as string | undefined;

  if (!paymentId && !pedidoId) {
    return res.status(400).json({ error: 'payment_id or pedido_id required' });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return res.status(500).end();

  const db = createClient(url, key);

  const col = pedidoId ? 'id' : 'mp_payment_id';
  const val = pedidoId ?? paymentId!;

  const { data } = await db
    .from('pedidos')
    .select('nome, email, produto, quantidade, valor_total, tipo_personalizacao, cor_serigrafia')
    .eq(col, val)
    .maybeSingle();

  if (!data) return res.status(404).json({ error: 'not found' });
  return res.status(200).json(data);
}
