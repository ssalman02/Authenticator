import { validateSecret } from "./services/totp.service.js";

export function parseOTPAuthURI(uri) {
  let url;
  try { url = new URL(uri.trim()); } catch { throw new Error("Invalid QR code data."); }
  if (url.protocol !== "otpauth:" || url.hostname.toLowerCase() !== "totp") {
    throw new Error("Only TOTP QR codes are supported.");
  }
  const secret = validateSecret(url.searchParams.get("secret"));
  const label = decodeURIComponent(url.pathname.slice(1));
  const splitAt = label.indexOf(":");
  const issuerLabel = splitAt >= 0 ? label.slice(0, splitAt) : "";
  const accountName = splitAt >= 0 ? label.slice(splitAt + 1) : label;
  const issuer = url.searchParams.get("issuer") || issuerLabel || "Unknown";
  const algorithm = (url.searchParams.get("algorithm") || "SHA1").toUpperCase();
  const digits = Number(url.searchParams.get("digits") || 6);
  const period = Number(url.searchParams.get("period") || 30);
  if (!["SHA1", "SHA256", "SHA512"].includes(algorithm)) throw new Error("Unsupported algorithm.");
  if (![6, 8].includes(digits)) throw new Error("Unsupported digit count.");
  if (!Number.isInteger(period) || period <= 0) throw new Error("Invalid period.");
  if (!accountName) throw new Error("Account name is missing.");
  return { id: crypto.randomUUID(), issuer, accountName, secret, algorithm, digits, period };
}