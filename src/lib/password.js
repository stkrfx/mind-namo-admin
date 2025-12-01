import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12; // Higher rounds = slower but more secure against brute force

/**
 * Hashes a plain text password using bcrypt.
 * Used during Signup, Seed, and Reset Password.
 */
export async function saltAndHashPassword(password) {
  if (!password) return null;
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  return hashedPassword;
}

/**
 * Compares a plain text password with a stored hash.
 * Used during Login.
 */
export async function verifyPassword(password, hashedPassword) {
  if (!password || !hashedPassword) return false;
  const isValid = await bcrypt.compare(password, hashedPassword);
  return isValid;
}