
const TIME_OFFSET_SECONDS = 51;

// Get adjusted system time in milliseconds
export function getAdjustedTime() {
  return Date.now() + TIME_OFFSET_SECONDS * 1000;
}

// Convert Base32 secret into bytes
function base32ToBytes(secret) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

  const normalized = secret
    .replace(/=+$/, "")
    .toUpperCase();

  if (!normalized || !/^[A-Z2-7]+$/.test(normalized)) {
    throw new Error("Invalid Base32 secret.");
  }

  let bits = 0;
  let value = 0;
  const bytes = [];

  for (const char of normalized) {
    value = (value << 5) | alphabet.indexOf(char);
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(bytes);
}

// Validate Base32 secret
export function validateSecret(secret) {
  const normalized = String(secret || "")
    .replace(/\s/g, "")
    .toUpperCase();

  base32ToBytes(normalized);

  return normalized;
}

// Generate TOTP using adjusted timestamp
export async function generateTOTP(
  account,
  epoch = getAdjustedTime() / 1000
) {
  if (!account?.secret) {
    throw new Error("Missing TOTP secret.");
  }

  const secret = validateSecret(account.secret);
  const keyBytes = base32ToBytes(secret);

  const algorithm = (
    account.algorithm || "SHA1"
  ).toUpperCase();

  const digits = Number(account.digits || 6);
  const period = Number(account.period || 30);

  const supportedAlgorithms = {
    SHA1: "SHA-1",
    SHA256: "SHA-256",
    SHA512: "SHA-512"
  };

  if (!supportedAlgorithms[algorithm]) {
    throw new Error("Unsupported algorithm.");
  }

  if (![6, 8].includes(digits)) {
    throw new Error("Invalid OTP digit count.");
  }

  if (!Number.isInteger(period) || period <= 0) {
    throw new Error("Invalid OTP period.");
  }

  if (!Number.isFinite(epoch) || epoch < 0) {
    throw new Error("Invalid timestamp.");
  }

  // Calculate TOTP counter
  const counter = Math.floor(epoch / period);

  // Convert counter into 8-byte array
  const counterBytes = new Uint8Array(8);

  let remaining = counter;

  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = remaining % 256;
    remaining = Math.floor(remaining / 256);
  }

  // Import secret key
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    {
      name: "HMAC",
      hash: supportedAlgorithms[algorithm]
    },
    false,
    ["sign"]
  );

  // Generate HMAC
  const hmac = new Uint8Array(
    await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      counterBytes
    )
  );

  // Dynamic truncation
  const offset = hmac[hmac.length - 1] & 0x0f;

  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  // Generate final OTP
  const otp = binary % (10 ** digits);

  return String(otp).padStart(digits, "0");
}

// Get remaining OTP validity time
export function getTOTPRemainingTime(account) {
  const period = Number(account.period || 30);

  const adjustedSeconds = Math.floor(
    getAdjustedTime() / 1000
  );

  return period - (adjustedSeconds % period);
}

// Get current TOTP counter
export function getTOTPTimeCounter(account) {
  const period = Number(account.period || 30);

  return Math.floor(
    getAdjustedTime() / 1000 / period
  );
}
