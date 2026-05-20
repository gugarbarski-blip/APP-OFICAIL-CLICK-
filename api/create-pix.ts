import { MercadoPagoConfig, Payment } from 'mercadopago';

const PRICES: Record<string, Record<string, number>> = {
  'copo-475': { serigrafia: 23.00, laser: 28.00 },
  'cuia-320': { serigrafia: 23.00, laser: 28.00 },
};

function getServerPrice(productId: string, customizationType: string): number | null {
  const product = PRICES[productId];
  if (!product) return null;
  return product[customizationType] ?? product['serigrafia'] ?? null;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) return res.status(500).json({ error: 'MP_ACCESS_TOKEN not configured' });

  const { productId, productName, quantity, buyerName, buyerEmail, buyerPhone, buyerCpfCnpj, address, customizationType, serigrafiaColor, artUrl } = req.body || {};

  if (!productId || !productName || !quantity || !buyerEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const unitPrice = getServerPrice(productId, customizationType || 'serigrafia');
  if (!unitPrice) return res.status(400).json({ error: 'Produto inválido' });

  const qty = Math.max(1, Math.floor(Number(quantity)));
  const total = unitPrice * qty;

  try {
    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);

    const nameParts = (buyerName || 'Cliente').split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    const result = await payment.create({
      body: {
        payment_method_id: 'pix',
        transaction_amount: total,
        description: productName,
        payer: { email: buyerEmail, first_name: firstName, last_name: lastName },
        metadata: {
          product_name: productName,
          quantity: String(qty),
          buyer_name: buyerName || '',
          buyer_email: buyerEmail,
          buyer_phone: buyerPhone || '',
          buyer_cpf_cnpj: buyerCpfCnpj || '',
          address: address || '',
          customization_type: customizationType || '',
          serigrafia_color: serigrafiaColor || '',
          art_url: artUrl || '',
        },
        notification_url: 'https://imprebrindes.clickimpresso.com.br/api/webhook-mp',
      },
    });

    const txData = (result as any).point_of_interaction?.transaction_data;
    return res.status(200).json({
      paymentId: result.id,
      qrCode: txData?.qr_code,
      qrCodeBase64: txData?.qr_code_base64,
      expiresAt: (result as any).date_of_expiration,
    });
  } catch (err: any) {
    console.error('MP PIX error:', err);
    return res.status(500).json({ error: 'Falha ao criar PIX' });
  }
}
