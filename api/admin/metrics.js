'use strict';

const { createHmac, timingSafeEqual } = require('crypto');

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

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const auth = req.headers?.authorization;
  if (!auth?.startsWith('Bearer ') || !validateAdminToken(auth.slice(7))) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const { createClient } = require('@supabase/supabase-js');
  const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  // Busca apenas campos leves para métricas — sem dados sensíveis
  const { data, error } = await db
    .from('pedidos')
    .select('id, status, valor_total, quantidade, produto, created_at')
    .not('status', 'in', '(aguardando_pix,aguardando_cartao)')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const pedidos = data || [];
  const PAID    = ['pago', 'producao', 'enviado', 'entregue'];
  const now     = new Date();

  const statusCounts = {};
  pedidos.forEach(p => { statusCounts[p.status] = (statusCounts[p.status] || 0) + 1; });

  const paidAll = pedidos.filter(p => PAID.includes(p.status));
  const paidMes = paidAll.filter(p => {
    const d = new Date(p.created_at);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const prodMap = {};
  paidAll.forEach(p => {
    const nome = p.produto?.split(' — ')[0]?.trim() || 'Desconhecido';
    if (!prodMap[nome]) prodMap[nome] = { pedidos: 0, unidades: 0 };
    prodMap[nome].pedidos++;
    prodMap[nome].unidades += p.quantidade || 0;
  });
  const prodStats = Object.entries(prodMap)
    .map(([nome, s]) => ({ nome, ...s }))
    .sort((a, b) => b.unidades - a.unidades);

  return res.status(200).json({
    statusCounts,
    fatMes:       paidMes.reduce((s, p) => s + (p.valor_total || 0), 0),
    fatTotal:     paidAll.reduce((s, p) => s + (p.valor_total || 0), 0),
    ticket:       paidAll.length > 0 ? paidAll.reduce((s, p) => s + (p.valor_total || 0), 0) / paidAll.length : 0,
    unidMes:      paidMes.reduce((s, p) => s + (p.quantidade || 0), 0),
    totalPedidos: paidAll.length,
    totalMes:     paidMes.length,
    prodStats,
  });
};
