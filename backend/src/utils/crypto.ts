import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

const getKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('FATAL: ENCRYPTION_KEY no está definida. Configura esta variable en tu archivo .env');
  }
  if (key.length < 32) {
    throw new Error('FATAL: ENCRYPTION_KEY debe tener al menos 32 caracteres');
  }
  return Buffer.from(key.slice(0, 32));
};

export const encryptBuffer = (buffer: Buffer): Buffer => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Layout: [IV (16B)][AuthTag (16B)][Encrypted Data]
  return Buffer.concat([iv, authTag, encrypted]);
};

export const decryptBuffer = (encryptedData: Buffer): Buffer => {
  if (encryptedData.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error('Datos cifrados corruptos o incompletos');
  }
  const iv = encryptedData.subarray(0, IV_LENGTH);
  const authTag = encryptedData.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = encryptedData.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
};

