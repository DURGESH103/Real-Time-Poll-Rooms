import crypto from 'crypto';

/**
 * Generate device fingerprint hash from client data
 * Used for anti-abuse: prevent same device from voting multiple times
 */
export const generateFingerprint = (components) => {
  const {
    userAgent = '',
    screenResolution = '',
    timezone = '',
    language = '',
    platform = ''
  } = components;

  // Combine components into single string
  const fingerprintString = [
    userAgent,
    screenResolution,
    timezone,
    language,
    platform
  ].join('|');

  // Generate SHA-256 hash
  return crypto
    .createHash('sha256')
    .update(fingerprintString)
    .digest('hex');
};

/**
 * Validate fingerprint format
 */
export const isValidFingerprint = (fingerprint) => {
  return typeof fingerprint === 'string' && /^[a-f0-9]{64}$/i.test(fingerprint);
};
