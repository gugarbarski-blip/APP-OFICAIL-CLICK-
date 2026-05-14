import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const url = process.env.SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_KEY || '';
    res.status(200).json({
      ok: true,
      supabase_url_set: !!url,
      supabase_key_set: !!key,
      can_import: true,
    });
  } catch (e: any) {
    res.status(200).json({ ok: false, error: e.message });
  }
}
