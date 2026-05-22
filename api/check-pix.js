'use strict';

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  try {
    const { MercadoPagoConfig, Payment } = require('mercadopago');
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const payment = new Payment(client);
    const result = await payment.get({ id: String(id) });
    return res.status(200).json({ status: result.status });
  } catch (err) {
    console.error('check-pix error:', err);
    return res.status(500).json({ error: 'Falha ao verificar pagamento' });
  }
};
