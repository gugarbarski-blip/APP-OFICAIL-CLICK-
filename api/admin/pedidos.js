'use strict';

const { createHmac, timingSafeEqual } = require('crypto');
const { decrypt } = require('../_crypto');

const TOKEN_MAX_AGE_MS = 12 * 60 * 60 * 1000;

function validateAdminToken(token) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || !token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [ts, hmac] = parts;
  const age = Date.now() - parseInt(ts, 10);
  if (isNaN(age) || age < 0 || age > TOKEN_MAX_AGE_MS) return false;
  const expected = createHmac('sha256', secret).update(ts).digest('hex');
  try { return timingSafeEqual(Buffer.from(hmac), Buffer.from(expected)); } catch { return false; }
}

function getTokenFromRequest(req) {
  const auth = req.headers?.authorization;
  if (!auth?.startsWith('Bearer ')) return undefined;
  return auth.slice(7);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  if (!validateAdminToken(getTokenFromRequest(req))) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const page     = Math.max(1, parseInt(req.query?.page) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(req.query?.pageSize) || 20));
  const status   = req.query?.status;
  const HIDDEN   = ['aguardando_pix', 'aguardando_cartao'];

  const { createClient } = require('@supabase/supabase-js');
  const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  let query = db.from('pedidos').select('*', { count: 'exact' });

  if (status && status !== 'todos') {
    query = query.eq('status', status);
  } else {
    query = query.not('status', 'in', `(${HIDDEN.join(',')})`);
  }

  const from = (page - 1) * pageSize;
  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) return res.status(500).json({ error: error.message });

  const pedidos = (data || []).map(p => ({
    ...p,
    cpf_cnpj: decrypt(p.cpf_cnpj),
    telefone:  decrypt(p.telefone),
    endereco:  decrypt(p.endereco),
  }));

  return res.status(200).json({ pedidos, total: count ?? 0, page, pageSize });
};
