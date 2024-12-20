import * as crypto from "crypto";

/**
 * Generate HMAC-SHA256 hash asynchronously.
 * @param message - The message to hash.
 * @param secretKey - The secret key used for hashing.
 * @returns A Promise resolving to the hash as a Buffer.
 */
async function generateHMAC(message: string, secretKey: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const hmac = crypto
        .createHmac("sha256", secretKey)
        .update(message)
        .digest(); // Output as Buffer
      resolve(hmac);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Securely compare two hashes using timingSafeEqual.
 * @param hash1 - First hash to compare.
 * @param hash2 - Second hash to compare.
 * @returns True if hashes match, false otherwise.
 */
async function compareHashes(hash1: Buffer, hash2: Buffer): Promise<boolean> {
  if (hash1.length !== hash2.length) {
    return false; // Immediately return if lengths differ
  }

  return new Promise((resolve) => {
    resolve(crypto.timingSafeEqual(hash1, hash2));
  });
}


