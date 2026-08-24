
const SHA256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

const SHA256_H = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
];

function sha256(value: string): string {
  const bytes = new TextEncoder().encode(value);
  const bitLength = bytes.length * 8;
  const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 4, bitLength >>> 0);
  const hash = SHA256_H.slice();

  for (let offset = 0; offset < paddedLength; offset += 64) {
    const words = new Uint32Array(64);
    for (let index = 0; index < 16; index++) words[index] = view.getUint32(offset + index * 4);
    for (let index = 16; index < 64; index++) {
      const valueA = words[index - 15];
      const valueB = words[index - 2];
      const sigmaA = ((valueA >>> 7) | (valueA << 25)) ^ ((valueA >>> 18) | (valueA << 14)) ^ (valueA >>> 3);
      const sigmaB = ((valueB >>> 17) | (valueB << 15)) ^ ((valueB >>> 19) | (valueB << 13)) ^ (valueB >>> 10);
      words[index] = (words[index - 16] + sigmaA + words[index - 7] + sigmaB) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = hash;
    for (let index = 0; index < 64; index++) {
      const sumE = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const choice = (e & f) ^ (~e & g);
      const temp1 = (h + sumE + choice + SHA256_K[index] + words[index]) >>> 0;
      const sumA = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const majority = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (sumA + majority) >>> 0;
      [h, g, f, e, d, c, b, a] = [g, f, e, (d + temp1) >>> 0, c, b, a, (temp1 + temp2) >>> 0];
    }
    hash[0] = (hash[0] + a) >>> 0;
    hash[1] = (hash[1] + b) >>> 0;
    hash[2] = (hash[2] + c) >>> 0;
    hash[3] = (hash[3] + d) >>> 0;
    hash[4] = (hash[4] + e) >>> 0;
    hash[5] = (hash[5] + f) >>> 0;
    hash[6] = (hash[6] + g) >>> 0;
    hash[7] = (hash[7] + h) >>> 0;
  }
  return hash.map(word => word.toString(16).padStart(8, '0')).join('');
}

function createSalt(): string {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return Array.from(salt, byte => byte.toString(16).padStart(2, '0')).join('');
}

function legacyHashPassword(password: string): string {
  let hash = 0;
  for (let index = 0; index < password.length; index++) {
    hash = ((hash << 5) - hash) + password.charCodeAt(index);
    hash &= hash;
  }
  return 'sms_' + Math.abs(hash).toString(16) + '_' + password.length;
}

export function hashPassword(password: string): string {
  const salt = createSalt();
  return `sms_v2_${salt}_${sha256(`${salt}:${password}`)}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  if (hash.startsWith('sms_v2_')) {
    const [, , salt, expected] = hash.split('_');
    if (!salt || !expected) return false;
    return sha256(`${salt}:${password}`) === expected;
  }
  return legacyHashPassword(password) === hash;
}

export function hashVerificationCode(code: string, challenge: string): string {
  return sha256(`${challenge}:${code}`);
}

export function needsPasswordUpgrade(hash: string): boolean {
  return !hash.startsWith('sms_v2_');
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#16a34a'];
  return { score, label: labels[score], color: colors[score] };
}

const loginAttempts: Record<string, { count: number; lastAttempt: number }> = {};

export function checkRateLimit(identifier: string): { allowed: boolean; waitSeconds: number } {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  const normalizedIdentifier = identifier.trim().toLowerCase();
  const record = loginAttempts[normalizedIdentifier];
  if (!record) {
    loginAttempts[normalizedIdentifier] = { count: 1, lastAttempt: now };
    return { allowed: true, waitSeconds: 0 };
  }

  if (now - record.lastAttempt > windowMs) {
    loginAttempts[normalizedIdentifier] = { count: 1, lastAttempt: now };
    return { allowed: true, waitSeconds: 0 };
  }

  if (record.count >= maxAttempts) {
    const waitSeconds = Math.ceil((windowMs - (now - record.lastAttempt)) / 1000);
    return { allowed: false, waitSeconds };
  }

  record.count++;
  record.lastAttempt = now;
  return { allowed: true, waitSeconds: 0 };
}

export function resetRateLimit(identifier: string): void {
  delete loginAttempts[identifier.trim().toLowerCase()];
}

export function getClientIP(): string {
  return '127.0.0.1';
}