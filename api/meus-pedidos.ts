// Este endpoint foi substituído por /api/customer/orders (autenticado via Supabase Auth).
// Mantido apenas para compatibilidade — retorna 410 Gone.
export default async function handler(req: any, res: any) {
  return res.status(410).json({ error: 'Use /minha-conta para acompanhar seus pedidos com segurança.' });
}
