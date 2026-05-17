import { createClient } from '@supabase/supabase-js';

function getDb() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Supabase env vars missing');
  return createClient(url, key);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fileBase64, fileName, mimeType } = req.body || {};
  if (!fileBase64 || !fileName) return res.status(400).json({ error: 'Missing file data' });

  try {
    const db = getDb();
    const buffer = Buffer.from(fileBase64, 'base64');
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueName = `${Date.now()}-${safeName}`;

    const { error } = await db.storage
      .from('artes')
      .upload(uniqueName, buffer, { contentType: mimeType || 'application/octet-stream' });

    if (error) throw error;

    const { data: { publicUrl } } = db.storage.from('artes').getPublicUrl(uniqueName);

    return res.status(200).json({ url: publicUrl });
  } catch (err: any) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Falha ao fazer upload', detail: err?.message });
  }
}
