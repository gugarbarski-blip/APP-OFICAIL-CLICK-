import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productName, quantity, unitPrice, buyerName, buyerEmail } = req.body;

  if (!productName || !quantity || !unitPrice || !buyerEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: 'copo-termico',
            title: productName,
            quantity: Number(quantity),
            unit_price: Number(unitPrice),
            currency_id: 'BRL',
          },
        ],
        payer: {
          name: buyerName,
          email: buyerEmail,
        },
        back_urls: {
          success: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173'}/?pagamento=sucesso`,
          failure: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173'}/?pagamento=erro`,
          pending: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173'}/?pagamento=pendente`,
        },
        auto_return: 'approved',
        statement_descriptor: 'CLICK BRINDES',
      },
    });

    return res.status(200).json({ checkoutUrl: result.init_point });
  } catch (err: unknown) {
    console.error('MP error:', err);
    return res.status(500).json({ error: 'Failed to create payment preference' });
  }
}
