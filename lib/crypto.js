import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";

// We derive a consistent 32-byte key from the AUTH_SECRET
// This ensures we don't need a separate env variable, but keeps it secure.
const getSecretKey = () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not defined in .env");
  }
  // Create a 32-byte key from the secret
  return crypto.createHash("sha256").update(String(secret)).digest();
};

/**
 * Encrypts a text string.
 * Returns format: "iv:encryptedText" (hex string)
 */
export function encrypt(text) {
  if (!text) return text; // Return as-is if empty (e.g., null or empty string)

  try {
    const key = getSecretKey();
    const iv = crypto.randomBytes(16); // Generate random Initialization Vector
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Return IV and Encrypted data separated by ':'
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  } catch (error) {
    console.error("Encryption failed:", error);
    // In production, you might want to throw error, but for robust UI we fallback
    return text; 
  }
}

/**
 * Decrypts an encrypted string.
 * Expects format: "iv:encryptedText"
 */
export function decrypt(text) {
  if (!text) return text;
  
  // Check if text follows the format (contains ':')
  // If not, it might be old unencrypted data, return as is.
  if (!text.includes(":")) return text;

  try {
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift(), "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const key = getSecretKey();
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  } catch (error) {
    // If decryption fails (e.g. wrong key, bad data), return original text
    // to prevent app crash, but log the security issue.
    console.error("Decryption failed:", error);
    return "[Encrypted Message - Key Mismatch]"; 
  }
}