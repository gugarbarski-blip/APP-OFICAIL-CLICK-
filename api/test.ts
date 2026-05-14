import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { getSupabaseAdmin } from '../lib/supabase-admin';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const token = process.env.MP_ACCESS_TOKEN || '';
    const c = new MercadoPagoConfig({ accessToken: token });
    const sb = getSupabaseAdmin();
    res.status(200).json({ ok: true, mp: !!c, sb: !!sb });
  } catch (e: any) {
    res.status(200).json({ ok: false, error: e.message });
  }
}
