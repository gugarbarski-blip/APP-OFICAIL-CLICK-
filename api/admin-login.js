'use strict';

const { createHmac, createHash } = require('crypto');

function getSecret() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error('ADMIN_SECRET not configured');
  return secret;
}

function generateToken() {
  const ts = Date.now().toString();
  const hmac = createHmac('sha256', getSecret()).update(ts).digest('hex');
  return `${ts}.${hmac}`;
}

async function getStoredHash() {
  if (process.env.ADMIN_PASSWORD) {
    return createHash('sha256').update(process.env.ADMIN_PASSWORD).digest('hex');
  }
  const { createClient } = require('@supabase/supabase-js');
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  const db = createClient(url, key);
  const { data, error } = await db
    .from('admin_config')
    .select('value')
    .eq('key', 'password_hash')
    .single();
  if (error || !data) return null;
  return data.value;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password } = req.body || {};
  if (!password) return res.status(401).json({ error: 'Senha obrigatória' });

  let secret;
  try { secret = getSecret(); } catch {
    return res.status(500).json({ error: 'Servidor mal configurado' });
  }

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
};
