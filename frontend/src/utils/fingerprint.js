/**
 * Generate device fingerprint on client side
 * Used for anti-abuse mechanism
 */

const getFingerprint = async () => {
  const components = {
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}x${screen.colorDepth}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform
  };

  const fingerprintString = Object.values(components).join('|');
  
  // Generate SHA-256 hash
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprintString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
};

// Cache fingerprint to avoid recalculation
let cachedFingerprint = null;

export const getDeviceFingerprint = async () => {
  if (!cachedFingerprint) {
    cachedFingerprint = await getFingerprint();
  }
  return cachedFingerprint;
};
