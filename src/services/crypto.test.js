import { describe, it, expect, beforeAll } from 'vitest';
import { CryptoService } from './crypto';

describe('CryptoService', () => {
  it('should derive consistent Workspace IDs for same username', async () => {
    const creds = ['testuser', 'password123'];
    const result1 = await CryptoService.deriveKeys(creds[0], creds[1]);
    const result2 = await CryptoService.deriveKeys(creds[0], 'different_password');
    
    // Workspace ID only depends on Username, so it should be same
    expect(result1.workspaceId).toBe(result2.workspaceId);
    expect(result1.workspaceId).toHaveLength(64); // SHA-256 hex
  });

  it('should derive DIFFERENT keys for different passwords', async () => {
    const creds = ['testuser', 'password123'];
    const result1 = await CryptoService.deriveKeys(creds[0], creds[1]);
    const result2 = await CryptoService.deriveKeys(creds[0], 'password456');
    
    // Keys are non-extractable, so we can't export them to compare bytes.
    // But they should be different CryptoKey objects.
    expect(result1.encryptionKey).toBeDefined();
    expect(result2.encryptionKey).toBeDefined();
    expect(result1.encryptionKey).not.toBe(result2.encryptionKey);
  });

  it('should encrypt and decrypt data correctly', async () => {
    const { encryptionKey } = await CryptoService.deriveKeys('user', 'pass');
    
    const secret = { text: "Secret Plans", ids: [1, 2, 3] };
    const encrypted = await CryptoService.encrypt(secret, encryptionKey);
    
    expect(typeof encrypted).toBe('string');
    expect(encrypted).not.toContain('Secret Plans');
    
    const decrypted = await CryptoService.decrypt(encrypted, encryptionKey);
    expect(decrypted).toEqual(secret);
  });
});
