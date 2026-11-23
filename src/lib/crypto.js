import crypto from 'crypto';

/**
 * Returns a 32-byte Buffer derived from process.env.TOKEN_ENCRYPTION_KEY.
 * Falls back to SHA-256 hashing to guarantee exact 32 bytes regardless of format.
 */
function getKeyBuffer() {
  const secret = process.env.TOKEN_ENCRYPTION_KEY || 'default-makeapost-secret-key-32chars!';
  if (Buffer.byteLength(secret, 'utf8') === 32) {
    return Buffer.from(secret, 'utf8');
  }
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts a plaintext token using AES-256-GCM.
 * @param {string} plainText
 * @returns {string} iv:authTag:encryptedContent in hex format
 */
export function encryptToken(plainText) {
  if (!plainText) return null;
  const key = getKeyBuffer();
  const iv = crypto.randomBytes(12); // Standard 96-bit IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted token.
 * @param {string} cipherText - Expected format: "iv:authTag:encryptedContent"
 * @returns {string|null}
 */
export function decryptToken(cipherText) {
  if (!cipherText) return null;
  const parts = cipherText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid cipherText format for token decryption');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = getKeyBuffer();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
