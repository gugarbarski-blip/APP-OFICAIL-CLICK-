'use strict';

const PRICES = {
  'copo-475': { serigrafia: 23.00, laser: 28.00 },
  'cuia-320':  { serigrafia: 23.00, laser: 28.00 },
};

function getServerPrice(productId, customizationType) {
  const product = PRICES[productId];
  if (!product) return null;
  return product[customizationType] ?? product['serigrafia'] ?? null;
}

function getDb() {
  const { createClient } = require('@supabase/supabase-js');
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Supabase env vars missing');
  return createClient(url, key);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) return res.status(500).json({ error: 'MP_ACCESS_TOKEN not configured' });

  const {
    productId, productName, quantity, buyerName, buyerEmail, buyerPhone,
    buyerCpfCnpj, address, customizationType, serigrafiaColor, artUrl, shippingPrice,
  } = req.body || {};

  if (!productId || !productName || !quantity || !buyerEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const unitPrice = getServerPrice(productId, customizationType || 'serigrafia');
  if (!unitPrice) return res.status(400).json({ error: 'Produto inválido' });

  const qty = Math.max(1, Math.floor(Number(quantity)));
  const shipping = Math.max(0, Math.round(Number(shippingPrice) * 100) / 100) || 0;
  const total = Math.round((unitPrice * qty + shipping) * 100) / 100;

  let pedidoId = null;
  try {
    const db = getDb();
    const { data } = await db.from('pedidos').insert({
      status: 'aguardando_cartao',
      nome: buyerName || '',
      email: buyerEmail,
      telefone: buyerPhone || '',
      cpf_cnpj: buyerCpfCnpj || '',
      produto: productName,
      quantidade: qty,
      valor_total: total,
      endereco: address || '',
      tipo_personalizacao: customizationType || '',
      cor_serigrafia: serigrafiaColor || '',
      arte_url: artUrl || null,
      created_at: new Date().toISOString(),
    }).select('id').single();
    pedidoId = data?.id ?? null;
  } catch (dbErr) {
    console.error('Supabase insert error:', dbErr);
  }

  try {
    const { MercadoPagoConfig, Preference } = require('mercadopago');
    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const items = [
      { id: productId, title: productName, quantity: qty, unit_price: unitPrice, currency_id: 'BRL' },
    ];
    if (shipping > 0) {
      items.push({ id: 'frete', title: 'Frete', quantity: 1, unit_price: shipping, currency_id: 'BRL' });
    }

    const result = await preference.create({
      body: {
        items,
        payer: { name: buyerName, email: buyerEmail },
        metadata: {
          pedido_id: pedidoId,
          product_name: productName,
          quantity: String(qty),
          buyer_name: buyerName,
          buyer_email: buyerEmail,
          buyer_phone: buyerPhone || '',
          buyer_cpf_cnpj: buyerCpfCnpj || '',
          address: address || '',
          customization_type: customizationType || '',
          serigrafia_color: serigrafiaColor || '',
          art_url: artUrl || '',
        },
        notification_url: 'https://imprebrindes.impresul.com.br/api/webhook-mp',
        back_urls: {
          success: `https://imprebrindes.impresul.com.br/pedido-confirmado${pedidoId ? `?pedido_id=${pedidoId}` : ''}`,
          failure: 'https://imprebrindes.impresul.com.br/?pagamento=erro',
          pending: 'https://imprebrindes.impresul.com.br/?pagamento=pendente',
        },
        payment_methods: {
          excluded_payment_types: [{ id: 'ticket' }],
          installments: 12,
        },
        auto_return: 'approved',
        statement_descriptor: 'IMPREBRINDES',
      },
    });

    return res.status(200).json({ checkoutUrl: result.init_point });
  } catch (err) {
    if (pedidoId) {
      try { await getDb().from('pedidos').delete().eq('id', pedidoId); } catch {}
    }
    console.error('MP preference error:', err);
    return res.status(500).json({ error: 'Falha ao criar preferência de pagamento' });
  }
};
