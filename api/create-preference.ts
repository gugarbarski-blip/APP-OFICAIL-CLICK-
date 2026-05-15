import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

function getDb() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Supabase env vars missing');
  return createClient(url, key);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) return res.status(500).json({ error: 'MP_ACCESS_TOKEN not configured' });

  const body = req.body || {};
  const { productName, quantity, unitPrice, buyerName, buyerEmail, address, customizationType, serigrafiaColor, preferPix } = body;

  if (!productName || !quantity || !unitPrice || !buyerEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let pedidoId: string | undefined;
  try {
    const { data: pedido } = await getDb().from('pedidos').insert({
      status: 'pendente',
      nome: buyerName || '',
      email: buyerEmail,
      produto: productName,
      quantidade: Number(quantity),
      valor_total: Number(unitPrice) * Number(quantity),
      endereco: address || '',
      tipo_personalizacao: customizationType || '',
      cor_serigrafia: serigrafiaColor || '',
      created_at: new Date().toISOString(),
    }).select('id').single();
    pedidoId = pedido?.id;
  } catch (dbErr) {
    console.error('Supabase error (non-fatal):', dbErr);
  }

  try {
    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [{ id: 'copo-termico', title: productName, quantity: Number(quantity), unit_price: Number(unitPrice), currency_id: 'BRL' }],
        payer: { name: buyerName, email: buyerEmail },
        metadata: { pedido_id: pedidoId, product_name: productName, quantity: String(quantity), buyer_name: buyerName, buyer_email: buyerEmail, address: address || '', customization_type: customizationType || '', serigrafia_color: serigrafiaColor || '' },
        notification_url: 'https://imprebrindes.com.br/api/webhook-mp',
        back_urls: {
          success: 'https://imprebrindes.com.br/?pagamento=sucesso',
          failure: 'https://imprebrindes.com.br/?pagamento=erro',
          pending: 'https://imprebrindes.com.br/?pagamento=pendente',
        },
        payment_methods: {
          excluded_payment_types: [],
          installments: 12,
        },
        auto_return: 'approved',
        statement_descriptor: 'CLICK BRINDES',
      },
    });
    return res.status(200).json({ checkoutUrl: result.init_point });
  } catch (err: any) {
    console.error('MP error:', err);
    return res.status(500).json({ error: 'Falha ao criar preferência', detail: err?.message });
  }
}
