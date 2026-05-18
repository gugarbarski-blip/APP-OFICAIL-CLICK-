import { createHmac, createHash } from 'crypto';
import { getSupabaseAdmin } from '../lib/supabase-admin';

function getSecret(): string {
  return process.env.ADMIN_SECRET ?? process.env.SUPABASE_SERVICE_KEY!;
}

function generateToken(): string {
  const ts = Date.now().toString();
  const hmac = createHmac('sha256', getSecret()).update(ts).digest('hex');
  return `${ts}.${hmac}`;
}

async function getStoredHash(): Promise<string | null> {
  // Allow hard-coded env var override for simplicity
  if (process.env.ADMIN_PASSWORD) {
    return createHash('sha256').update(process.env.ADMIN_PASSWORD).digest('hex');
  }
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from('admin_config')
    .select('value')
    .eq('key', 'password_hash')
    .single();
  return data?.value ?? null;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password } = req.body || {};
  if (!password) return res.status(401).json({ error: 'Senha obrigatória' });

  const secret = getSecret();
  if (!secret) return res.status(500).json({ error: 'Servidor mal configurado' });

  try {
    const storedHash = await getStoredHash();
    if (!storedHash) return res.status(500).json({ error: 'Senha de admin não configurada' });

    const submitted = createHash('sha256').update(password).digest('hex');
    if (submitted !== storedHash) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    return res.status(200).json({ token: generateToken() });
  } catch {
    return res.status(500).json({ error: 'Erro interno ao verificar credenciais' });
  }
}
