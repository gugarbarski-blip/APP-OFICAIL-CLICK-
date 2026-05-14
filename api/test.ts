import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MercadoPagoConfig } from 'mercadopago';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const token = process.env.MP_ACCESS_TOKEN || 'NO_TOKEN';
    const c = new MercadoPagoConfig({ accessToken: token });
    res.status(200).json({ ok: true, mp: !!c, token_set: token !== 'NO_TOKEN' });
  } catch (e: any) {
    res.status(200).json({ ok: false, error: e.message });
  }
}
