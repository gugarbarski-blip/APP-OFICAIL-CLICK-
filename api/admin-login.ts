import { createHmac } from 'crypto';

function generateToken(): string {
  const ts = Date.now().toString();
  const secret = process.env.ADMIN_SECRET!;
  const hmac = createHmac('sha256', secret).update(ts).digest('hex');
  return `${ts}.${hmac}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password } = req.body || {};
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || !process.env.ADMIN_SECRET) {
    return res.status(500).json({ error: 'Servidor mal configurado' });
  }

  if (!password || password !== adminPassword) {
    return res.status(401).json({ error: 'Senha incorreta' });
  }

  return res.status(200).json({ token: generateToken() });
}
