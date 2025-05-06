
/**
 * Helper functions for chat-related functionality
 */

/**
 * Generates a random string for room IDs and security codes
 */
export const generateRandomString = (length: number = 6): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};
