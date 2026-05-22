'use strict';

// Map<key, { count, resetAt }>
const _store = new Map();

// Limpeza periódica para não vazar memória
setInterval(function () {
  const now = Date.now();
  for (const [key, entry] of _store.entries()) {
    if (now >= entry.resetAt) _store.delete(key);
  }
}, 5 * 60 * 1000).unref();

/** Extrai o IP real do cliente, respeitando proxies do Vercel */
function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

/**
 * Rate limiter geral — incrementa a cada chamada.
 * Usar em endpoints de pagamento.
 * @returns {boolean} true = bloqueado
 */
function isRateLimited(key, limit, windowMs) {
  const now = Date.now();
  const entry = _store.get(key);
  if (!entry || now >= entry.resetAt) {
    _store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  if (entry.count >= limit) return true;
  entry.count++;
  return false;
}

/**
 * Verifica se a chave está bloqueada SEM incrementar.
 * Usar no início do handler de login.
 * @returns {boolean} true = bloqueado
 */
function isBlocked(key, limit) {
  const entry = _store.get(key);
  if (!entry || Date.now() >= entry.resetAt) return false;
  return entry.count >= limit;
}

/**
 * Incrementa manualmente (conta apenas falhas).
 * Usar após tentativa de login fracassada.
 * @returns {boolean} true = acabou de bloquear
 */
function hit(key, limit, windowMs) {
  const now = Date.now();
  const entry = _store.get(key);
  if (!entry || now >= entry.resetAt) {
    _store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count++;
  return entry.count >= limit;
}

/** Limpa o contador — usar após login bem-sucedido */
function reset(key) {
  _store.delete(key);
}

module.exports = { getClientIp, isRateLimited, isBlocked, hit, reset };
