import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MercadoPagoConfig } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const token = process.env.MP_ACCESS_TOKEN || '';
    const c = new MercadoPagoConfig({ accessToken: token });
    const sb = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_KEY || '');
    res.status(200).json({ ok: true, mp: !!c, sb: !!sb });
  } catch (e: any) {
    res.status(200).json({ ok: false, error: e.message });
  }
}
