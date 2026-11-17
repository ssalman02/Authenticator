import { useEffect, useState } from "react";
import { Copy, Trash2, Check, ShieldCheck } from "lucide-react";
import {
  generateTOTP,
  getAdjustedTime
} from "../services/totp.service";

// NEW: stable hue per issuer so each account is easy to recognise
function hueFor(text = "") {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) % 360;
  }
  return hash;
}

export default function AccountCard({ account, onDelete }) {
  const [code, setCode] = useState("------");
  const [remaining, setRemaining] = useState(
    Number(account.period || 30)
  );
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const period = Number(account.period || 30);

  useEffect(() => {
    let active = true;
    let lastStep = -1;
    let requestId = 0;

    const tick = async () => {
      if (!active) return;

      // Get adjusted time only once per tick
      const adjustedNow = getAdjustedTime();
      const adjustedEpoch = adjustedNow / 1000;

      // Calculate counter using adjusted time
      const step = Math.floor(adjustedEpoch / period);

      // Calculate countdown using the same time
      const timeLeft =
        period - (Math.floor(adjustedEpoch) % period);

      setRemaining(timeLeft);

      // No need to regenerate OTP within same period
      if (step === lastStep) return;

      lastStep = step;
      const currentRequest = ++requestId;

      try {
        // Generate OTP using the exact same timestamp
        const value = await generateTOTP(
          account,
          adjustedEpoch
        );

        if (
          !active ||
          currentRequest !== requestId
        ) {
          return;
        }

        // Make sure the counter is still current
        const latestEpoch = getAdjustedTime() / 1000;
        const latestStep = Math.floor(latestEpoch / period);

        if (latestStep !== step) {
          return;
        }

        setCode(value);
        setError("");

      } catch (e) {
        if (
          active &&
          currentRequest === requestId
        ) {
          setCode("------");
          setError(e.message || "OTP generation failed.");
        }
      }
    };

    tick();

    // Check countdown and OTP boundary every second
    const timer = window.setInterval(tick, 1000);

    return () => {
      active = false;
      requestId++;
      window.clearInterval(timer);
    };

  }, [
    account.secret,
    account.algorithm,
    account.digits,
    account.period,
    period
  ]);

  const copyCode = async () => {
    if (!/^\d+$/.test(code)) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);

    } catch {
      setError("Unable to copy code.");
    }
  };

  // ENHANCED: 6 digits -> "123 456", 8 digits -> "1234 5678"
  const formattedCode =
    code.length === 6 || (code.length === 8 && /^\d+$/.test(code))
      ? `${code.slice(0, code.length / 2)} ${code.slice(code.length / 2)}`
      : code;

  const initials = (account.issuer || "A")
    .charAt(0)
    .toUpperCase();

  // NEW: urgency state drives ring / code colour in CSS
  const urgency =
    remaining <= 5
      ? "is-critical"
      : remaining <= 10
      ? "is-warning"
      : "";

  // Border depletes clockwise from 100% (full) to 0% (expired)
  const progress = `${(remaining / period) * 100}%`;

  return (
    <div
      className={`card-ring ${urgency}`}
      style={{ "--progress": progress }}
    >
    <article className={`account-card ${urgency}`}>

      <div className="account-top">
        <div className="account-identity">
          <div
            className="account-avatar"
            style={{ "--avatar-hue": hueFor(account.issuer || "A") }}
          >
            {initials}
          </div>

          <div className="account-label">
            <h3>{account.issuer || "Authenticator"}</h3>
            <p>{account.accountName || "Account"}</p>
          </div>
        </div>

        <div className="card-actions">
          <span className="secure-tag">
            <ShieldCheck size={12} />
            TOTP
          </span>

          <button
            className="delete-button"
            onClick={() => {
              if (
                window.confirm(
                  `Delete ${account.issuer} account?`
                )
              ) {
                onDelete(account.id);
              }
            }}
            title="Delete account"
            aria-label="Delete account"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="otp-section ">
        <div className="otp-details">
          <span className="otp-caption">
            <u>V</u>erification code
          </span>

          <div className="otp-left">
            <strong
              className="otp-code"
              onClick={copyCode}
            >
              {formattedCode}
            </strong>

            <button
              className={`copy-button ${
                copied ? "copied" : ""
              }`}
              onClick={copyCode}
              disabled={!/^\d+$/.test(code)}
              title="Copy OTP"
              aria-label="Copy OTP"
            >
              {copied ? (
                <Check size={18} />
              ) : (
                <Copy size={18} />
              )}
            </button>
          </div>

          {/* <span className="copy-hint" aria-live="polite">
            {copied
              ? "Copied successfully"
              : "Tap to copy code"}
          </span> */}
        </div>
        {/* <div className="timer-wrap">
          <span>{remaining}</span>
        </div> */}
      </div>

      {/* <div className="progress-track">
        <span
          style={{
            width: `${(remaining / period) * 100}%`
          }}
        />
      </div> */}

      {error && (
        <p className="error-message" role="alert">{error}</p>
      )}

    </article>
    </div>
  );
}