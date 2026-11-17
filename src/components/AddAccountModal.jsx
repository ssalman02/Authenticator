import { useState } from "react";
import { X, KeyRound, QrCode } from "lucide-react";
import QRScanner from "./QRScanner";
import { parseOTPAuthURI } from "../utils";
import { validateSecret } from "../services/totp.service";

export default function AddAccountModal({ onClose, onAdd }) {
  const [tab, setTab] = useState("scan");
  const [issuer, setIssuer] = useState("");
  const [accountName, setAccountName] = useState("");
  const [secret, setSecret] = useState("");
  const [algorithm, setAlgorithm] = useState("SHA1");
  const [digits, setDigits] = useState("6");
  const [period, setPeriod] = useState("30");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const add = async account => {
    if (saving) return;
    setSaving(true); setError("");
    try { await onAdd(account); onClose(); }
    catch (e) {
  setError(
    typeof e?.message === "string"
      ? e.message
      : "Unable to add account."
  );
}
    finally { setSaving(false); }
  };

  const scan = async uri => add(parseOTPAuthURI(uri));

  const submit = async event => {
    event.preventDefault();
    try {
      const account = {
        issuer: issuer.trim(), accountName: accountName.trim(),
        secret: validateSecret(secret), algorithm, digits: Number(digits), period: Number(period)
      };
      if (!account.issuer || !account.accountName) throw new Error("Enter issuer and account name.");
      if (![6,8].includes(account.digits)) throw new Error("Invalid digit count.");
      if (!Number.isInteger(account.period) || account.period <= 0) throw new Error("Invalid period.");
      await add(account);
    } catch (e) { setError(e.message); }
  };

  return <div className="modal-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-header">
        <div><h2 id="modal-title">Add Account</h2><p>Connect an account to generate secure codes.</p></div>
        <button className="close-button" onClick={onClose} aria-label="Close"><X size={18}/></button>
      </div>
      <div className="modal-tabs">
        <button className={tab === "scan" ? "active" : ""} onClick={() => {setTab("scan");setError("");}}><QrCode size={15}/> Scan QR</button>
        <button className={tab === "manual" ? "active" : ""} onClick={() => {setTab("manual");setError("");}}><KeyRound size={15}/> Manual Entry</button>
      </div>
      {tab === "scan" ? <QRScanner onScan={scan}/> : <form className="manual-form" onSubmit={submit}>
        <label>Service / Issuer<input value={issuer} onChange={e=>setIssuer(e.target.value)} placeholder="Google, GitHub..." required/></label>
        <label>Account name<input value={accountName} onChange={e=>setAccountName(e.target.value)} placeholder="name@example.com" required/></label>
        <label>Base32 secret<input value={secret} onChange={e=>setSecret(e.target.value)} placeholder="Paste setup key" autoComplete="off" required/></label>
        <div className="form-row">
          <label>Algorithm<select value={algorithm} onChange={e=>setAlgorithm(e.target.value)}><option>SHA1</option><option>SHA256</option><option>SHA512</option></select></label>
          <label>Digits<select value={digits} onChange={e=>setDigits(e.target.value)}><option value="6">6</option><option value="8">8</option></select></label>
        </div>
        <label>Period (seconds)<input type="number" min="1" max="300" value={period} onChange={e=>setPeriod(e.target.value)}/></label>
        <button className="primary-button submit-button" disabled={saving}>{saving ? "Adding…" : "Add Account"}</button>
      </form>}
      {error && <p className="error-message modal-error">{error}</p>}
    </section>
  </div>;
}