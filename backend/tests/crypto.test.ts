import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import dotenv from 'dotenv';
dotenv.config();
if (!process.env.ENCRYPTION_KEY) {
  process.env.ENCRYPTION_KEY = 'nexus_secret_enc_key_32bytes_!ab';
}
import { encryptBuffer, decryptBuffer } from '../src/utils/crypto.js';

describe('Security & Cryptography Suite (AES-256-GCM)', () => {
  const samplePdfBuffer = Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\nxref\n0 2\ntrailer<</Size 2/Root 1 0 R>>\nstartxref\n99\n%%EOF');

  test('1. Encrypt and Decrypt: Perfect byte-by-byte integrity for PDF buffers', () => {
    const encrypted = encryptBuffer(samplePdfBuffer);
    assert.ok(encrypted.length > samplePdfBuffer.length, 'Ciphertext must include IV (16B) and AuthTag (16B)');
    
    const decrypted = decryptBuffer(encrypted);
    assert.deepEqual(decrypted, samplePdfBuffer, 'Decrypted buffer must exactly match original PDF plaintext');
    assert.equal(decrypted.subarray(0, 4).toString('utf-8'), '%PDF', 'Magic bytes %PDF must be preserved');
  });

  test('2. CPA Resistance / Semantic Security: Identical plaintexts produce distinct ciphertexts', () => {
    const enc1 = encryptBuffer(samplePdfBuffer);
    const enc2 = encryptBuffer(samplePdfBuffer);
    
    assert.notDeepEqual(enc1, enc2, 'Two encryptions of the same plaintext must use distinct random IVs');
    
    const dec1 = decryptBuffer(enc1);
    const dec2 = decryptBuffer(enc2);
    assert.deepEqual(dec1, dec2, 'Both distinct ciphertexts must decrypt to the exact same plaintext');
  });

  test('3. Authenticated Encryption Tamper Resistance: Corrupted AuthTag must throw error', () => {
    const encrypted = encryptBuffer(samplePdfBuffer);
    // Corrupt one byte in the AuthTag (bytes 16 to 31)
    const tampered = Buffer.from(encrypted);
    tampered[20] = tampered[20] ^ 0xff; // Flip bits

    assert.throws(
      () => decryptBuffer(tampered),
      /Unsupported state or unable to authenticate data/,
      'Tampered AuthTag must fail authentication and throw cryptographic error'
    );
  });

  test('4. Ciphertext Integrity: Bit flip in ciphertext must fail decryption', () => {
    const encrypted = encryptBuffer(samplePdfBuffer);
    // Corrupt one byte in the ciphertext body (after byte 32)
    const tampered = Buffer.from(encrypted);
    tampered[35] = tampered[35] ^ 0x01; // 1-bit flip

    assert.throws(
      () => decryptBuffer(tampered),
      /Unsupported state or unable to authenticate data/,
      'Tampered ciphertext must fail authentication and abort without leaking plaintext'
    );
  });

  test('5. Incomplete Buffer Detection: Buffers smaller than 32 bytes must be rejected', () => {
    const invalidShortBuffer = Buffer.from('too-short-to-have-iv-and-tag');
    
    assert.throws(
      () => decryptBuffer(invalidShortBuffer),
      /Datos cifrados corruptos o incompletos/,
      'Buffers lacking minimum 32 bytes header must be immediately rejected'
    );
  });
});
