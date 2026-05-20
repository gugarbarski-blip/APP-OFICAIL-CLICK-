import { MercadoPagoConfig, Preference } from 'mercadopago';

// Tabela de preços autoritativa — nunca confiar no valor vindo do cliente
const PRICES: Record<string, Record<string, number>> = {
  'copo-475': { serigrafia: 23.00, laser: 28.00 },
  'cuia-320': { serigrafia: 23.00, laser: 28.00 },
};

function getServerPrice(productId: string, customizationType: string): number | null {
  const product = PRICES[productId];
  if (!product) return null;
  const price = product[customizationType] ?? product['serigrafia'];
  return price ?? null;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) return res.status(500).json({ error: 'MP_ACCESS_TOKEN not configured' });

  const body = req.body || {};
  const { productId, productName, quantity, buyerName, buyerEmail, buyerPhone, buyerCpfCnpj, address, customizationType, serigrafiaColor, artUrl } = body;

  if (!productId || !productName || !quantity || !buyerEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Preço calculado no servidor — jamais usar valor do cliente
  const unitPrice = getServerPrice(productId, customizationType || 'serigrafia');
  if (!unitPrice) {
    return res.status(400).json({ error: 'Produto inválido' });
  }

  const qty = Math.max(1, Math.floor(Number(quantity)));
  const totalPrice = unitPrice * qty;

  try {
    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [{ id: productId, title: productName, quantity: qty, unit_price: unitPrice, currency_id: 'BRL' }],
        payer: { name: buyerName, email: buyerEmail },
        metadata: { product_name: productName, quantity: String(qty), buyer_name: buyerName, buyer_email: buyerEmail, buyer_phone: buyerPhone || '', buyer_cpf_cnpj: buyerCpfCnpj || '', address: address || '', customization_type: customizationType || '', serigrafia_color: serigrafiaColor || '', art_url: artUrl || '' },
        notification_url: 'https://imprebrindes.clickimpresso.com.br/api/webhook-mp',
        back_urls: {
          success: 'https://imprebrindes.clickimpresso.com.br/pedido-confirmado',
          failure: 'https://imprebrindes.clickimpresso.com.br/?pagamento=erro',
          pending: 'https://imprebrindes.clickimpresso.com.br/?pagamento=pendente',
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
  } catch (err: any) {
    console.error('MP error:', err);
    return res.status(500).json({ error: 'Falha ao criar preferência' });
  }
}
