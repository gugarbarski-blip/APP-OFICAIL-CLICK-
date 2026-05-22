'use strict';

const { createHmac, createHash } = require('crypto');
const { getClientIp, isBlocked, hit, reset } = require('./_ratelimit');

const BF_LIMIT  = 5;               // tentativas erradas antes de bloquear
const BF_WINDOW = 15 * 60 * 1000;  // janela: 15 minutos

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

  const ip = getClientIp(req);
  const bfKey = 'admin_login:' + ip;

  // Proteção brute force: bloqueia o IP se já atingiu o limite de falhas
  if (isBlocked(bfKey, BF_LIMIT)) {
    return res.status(429).json({ error: 'Muitas tentativas. Tente novamente em 15 minutos.' });
  }

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
      // Contabiliza a falha — só bloqueia depois de BF_LIMIT erros
      hit(bfKey, BF_LIMIT, BF_WINDOW);
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    // Login bem-sucedido: limpa o contador de falhas do IP
    reset(bfKey);
    return res.status(200).json({ token: generateToken() });
  } catch {
    return res.status(500).json({ error: 'Erro interno ao verificar credenciais' });
  }
};
