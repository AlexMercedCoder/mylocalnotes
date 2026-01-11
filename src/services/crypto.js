export const CryptoService = {
  /**
   * Derives a workspace ID and encryption key from credentials.
   * @param {string} username 
   * @param {string} password 
   * @returns {Promise<{workspaceId: string, encryptionKey: InternalKey, username: string}>}
   */
  async deriveKeys(username, password) {
    const encoder = new TextEncoder();

    // 1. Derive Workspace ID (SHA-256 of username)
    // This allows partitioning data by user.
    const wsData = encoder.encode(username.trim().toLowerCase() + "_WORKSPACE_SALT_v1");
    const wsHash = await crypto.subtle.digest("SHA-256", wsData);
    const workspaceId = Array.from(new Uint8Array(wsHash))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    // 2. Derive Encryption Key (PBKDF2)
    // We use the username as a deterministic salt so we don't need to store a random salt.
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    const salt = encoder.encode(username.trim().toLowerCase() + "_KEY_SALT_v1");
    
    const encryptionKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false, // non-extractable
      ["encrypt", "decrypt"]
    );

    return { workspaceId, encryptionKey, username };
  },

  /**
   * Encrypts a JSON object or string.
   * @param {any} data 
   * @param {CryptoKey} key 
   * @returns {Promise<string>} JSON stringified object { iv, ciphertext }
   */
  async encrypt(data, key) {
    if (!key) throw new Error("No active encryption key");
    
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(JSON.stringify(data));
    
    // AES-GCM needs a unique IV for every encryption.
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedContent = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      encodedData
    );

    // Convert buffers to base64 for storage
    const ivArray = Array.from(iv);
    const contentArray = Array.from(new Uint8Array(encryptedContent));
    
    return JSON.stringify({
      iv: btoa(String.fromCharCode.apply(null, ivArray)),
      data: btoa(String.fromCharCode.apply(null, contentArray))
    });
  },

  /**
   * Decrypts a stored encrypted string.
   * @param {string} encryptedString JSON string { iv, data }
   * @param {CryptoKey} key 
   * @returns {Promise<any>} Original data
   */
  async decrypt(encryptedString, key) {
    if (!key) throw new Error("No active encryption key");

    try {
      const { iv, data } = JSON.parse(encryptedString);
      
      const ivBytes = new Uint8Array(atob(iv).split("").map(c => c.charCodeAt(0)));
      const dataBytes = new Uint8Array(atob(data).split("").map(c => c.charCodeAt(0)));
      
      const decrypted = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: ivBytes
        },
        key,
        dataBytes
      );
      
      const decoder = new TextDecoder();
      return JSON.parse(decoder.decode(decrypted));
    } catch (error) {
      console.error("Decryption failed:", error);
      throw new Error("Failed to decrypt data. Wrong password?");
    }
  }
};
