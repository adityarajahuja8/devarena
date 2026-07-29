import crypto from 'crypto';
import Team from '../models/Team.js';

/**
 * Generates a unique 6-character uppercase alphanumeric join code.
 * Validates uniqueness within the hackathon before returning.
 * @param {string} hackathonId - The hackathon ObjectId
 * @returns {Promise<string>} - Unique join code like "X7K2QP"
 */
export const generateJoinCode = async (hackathonId) => {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    // Generate 6 random bytes, map each to CHARS
    const bytes = crypto.randomBytes(6);
    code = Array.from(bytes)
      .map((b) => CHARS[b % CHARS.length])
      .join('');

    // Check uniqueness within this hackathon
    const existing = await Team.findOne({ joinCode: code, hackathon: hackathonId });
    if (!existing) isUnique = true;
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Could not generate a unique join code. Please try again.');
  }

  return code;
};
