import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export default async function handler(req: any, res: any) {
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
    return res.status(500).json({ error: 'Failed to create payment preference' });
  }
}
