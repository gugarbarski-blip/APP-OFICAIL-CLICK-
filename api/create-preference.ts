import { MercadoPagoConfig, Preference } from 'mercadopago';
import { getSupabaseAdmin } from '../lib/supabase-admin';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { productName, quantity, unitPrice, buyerName, buyerEmail, address, customizationType, serigrafiaColor } = req.body;

  if (!productName || !quantity || !unitPrice || !buyerEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let pedidoId: string | undefined;
  try {
    const { data: pedido } = await getSupabaseAdmin().from('pedidos').insert({
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
    console.error('Supabase insert error (non-fatal):', dbErr);
  }

  try {
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [{
          id: 'copo-termico',
          title: productName,
          quantity: Number(quantity),
          unit_price: Number(unitPrice),
          currency_id: 'BRL',
        }],
        payer: { name: buyerName, email: buyerEmail },
        metadata: {
          pedido_id: pedidoId,
          product_name: productName,
          quantity: String(quantity),
          buyer_name: buyerName,
          buyer_email: buyerEmail,
          address: address || '',
          customization_type: customizationType || '',
          serigrafia_color: serigrafiaColor || '',
        },
        notification_url: 'https://app-oficail-click.vercel.app/api/webhook-mp',
        back_urls: {
          success: 'https://app-oficail-click.vercel.app/?pagamento=sucesso',
          failure: 'https://app-oficail-click.vercel.app/?pagamento=erro',
          pending: 'https://app-oficail-click.vercel.app/?pagamento=pendente',
        },
        auto_return: 'approved',
        statement_descriptor: 'CLICK BRINDES',
      },
    });

    return res.status(200).json({ checkoutUrl: result.init_point });
  } catch (err: unknown) {
    console.error('MP error:', err);
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    return res.status(500).json({ error: 'Failed to create payment preference', detail: msg });
  }
}
