import 'fake-indexeddb/auto';
import { beforeAll, afterAll, vi } from 'vitest';
import { Crypto } from '@peculiar/webcrypto';

// Polyfill WebCrypto for Node/JSDOM environment if missing
if (!global.crypto) {
  global.crypto = new Crypto();
} else if (!global.crypto.subtle) {
    // If JSDOM has crypto but no subtle (common issue)
    global.crypto.subtle = new Crypto().subtle;
}
