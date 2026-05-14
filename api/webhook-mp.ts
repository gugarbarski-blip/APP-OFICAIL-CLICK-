import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

function getDb() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Supabase env vars missing');
  return createClient(url, key);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();

  const { type, data } = req.body || {};
  if (type !== 'payment') return res.status(200).end();

  try {
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
    const payment = new Payment(client);
    const mp = await payment.get({ id: data.id });

    if (mp.status !== 'approved') return res.status(200).end();

    const meta = mp.metadata || {};
    await getDb().from('pedidos').insert({
      mp_payment_id: String(mp.id),
      status: 'pago',
      nome: mp.payer?.first_name ? `${mp.payer.first_name} ${mp.payer.last_name || ''}`.trim() : meta.buyer_name || '',
      email: mp.payer?.email || meta.buyer_email || '',
      produto: meta.product_name || '',
      quantidade: Number(meta.quantity) || 0,
      valor_total: mp.transaction_amount,
      endereco: meta.address || '',
      tipo_personalizacao: meta.customization_type || '',
      cor_serigrafia: meta.serigrafia_color || '',
      created_at: new Date().toISOString(),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).end();
  }
}
