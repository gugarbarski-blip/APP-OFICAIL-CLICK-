'use strict';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']);
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

function getDb() {
  const { createClient } = require('@supabase/supabase-js');
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Supabase env vars missing');
  return createClient(url, key);
}

function detectMimeFromBuffer(buf) {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return 'image/gif';
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) return 'image/webp';
  if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) return 'application/pdf';
  return null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fileBase64, fileName } = req.body || {};
  if (!fileBase64 || !fileName) return res.status(400).json({ error: 'Missing file data' });

  try {
    const buffer = Buffer.from(fileBase64, 'base64');

    if (buffer.length > MAX_SIZE_BYTES) {
      return res.status(400).json({ error: 'Arquivo muito grande. Máximo 10MB.' });
    }

    const detectedMime = detectMimeFromBuffer(buffer);
    if (!detectedMime || !ALLOWED_MIME_TYPES.has(detectedMime)) {
      return res.status(400).json({ error: 'Tipo de arquivo não permitido. Use JPG, PNG, PDF ou WebP.' });
    }

    const db = getDb();
    const ext = detectedMime.split('/')[1].replace('jpeg', 'jpg');
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await db.storage
      .from('artes')
      .upload(uniqueName, buffer, { contentType: detectedMime });

    if (error) throw error;

    const { data: { publicUrl } } = db.storage.from('artes').getPublicUrl(uniqueName);
    return res.status(200).json({ url: publicUrl });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Falha ao fazer upload' });
  }
};
