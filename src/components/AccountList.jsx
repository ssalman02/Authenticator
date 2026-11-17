import AccountCard from "./AccountCard";
import { KeyRound } from "lucide-react";

export default function AccountList({ accounts, onDelete, isDark }) {
  if (!accounts.length) return <div className="empty-state">
    <div className="empty-icon"><KeyRound size={28}/></div>
    <h3>No accounts yet</h3>
    <p>Add your first authenticator account using a QR code or enter the setup key manually.</p>
  </div>;
  return <div className="account-list">
    {accounts.map(account => <AccountCard key={account.id} account={account} onDelete={onDelete} isDark={isDark}/>)}
  </div>;
}