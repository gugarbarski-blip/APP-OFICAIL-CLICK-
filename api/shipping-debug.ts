import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = process.env.MELHOR_ENVIO_TOKEN;
  const baseUrl = process.env.MELHOR_ENVIO_SANDBOX === 'true'
    ? 'https://sandbox.melhorenvio.com.br'
    : 'https://www.melhorenvio.com.br';

  if (!token) {
    return res.status(200).json({ error: 'MELHOR_ENVIO_TOKEN não está definido no ambiente' });
  }

  const body = {
    from: { postal_code: '91430221' },
    to:   { postal_code: '01310100' },
    package: { height: 36, width: 33, length: 45, weight: 6.11 },
    options: { receipt: false, own_hand: false },
  };

  try {
    const resp = await fetch(`${baseUrl}/api/v2/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'ImpreBrindes contato@imprebrindes.com.br',
      },
      body: JSON.stringify(body),
    });

    const text = await resp.text();
    let json: unknown;
    try { json = JSON.parse(text); } catch { json = text; }

    return res.status(200).json({
      tokenPrefix: token.slice(0, 8) + '...',
      baseUrl,
      requestBody: body,
      meStatus: resp.status,
      meHeaders: Object.fromEntries(resp.headers.entries()),
      meResponse: json,
    });
  } catch (err) {
    return res.status(200).json({ fetchError: String(err) });
  }
}
