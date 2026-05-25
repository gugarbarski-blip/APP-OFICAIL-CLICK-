'use strict';

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LEN    = 12;
const TAG_LEN   = 16;
const PREFIX    = 'enc1:';

function getKey() {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) return null;
  const buf = Buffer.from(raw, 'hex');
  return buf.length === 32 ? buf : null;
}

function encrypt(value) {
  if (value === null || value === undefined || value === '') return value;
  const str = String(value);
  const key = getKey();
  if (!key) return str;

  const iv  = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const enc = Buffer.concat([cipher.update(str, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, tag, enc]).toString('base64');
}

function decrypt(value) {
  if (!value || !String(value).startsWith(PREFIX)) return value;
  const key = getKey();
  if (!key) return value;
  try {
    const buf = Buffer.from(String(value).slice(PREFIX.length), 'base64');
    const iv  = buf.slice(0, IV_LEN);
    const tag = buf.slice(IV_LEN, IV_LEN + TAG_LEN);
    const enc = buf.slice(IV_LEN + TAG_LEN);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
  } catch {
    return value;
  }
}

module.exports = { encrypt, decrypt };
