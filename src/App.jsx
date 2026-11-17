import { useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal, ShieldCheck } from "lucide-react";
import Header from "./components/Header";
import AccountList from "./components/AccountList";
import AddAccountModal from "./components/AddAccountModal";
import useAccounts from "./hooks/useAccounts";
import useTheme from "./hooks/useTheme";

export default function App() {
  const { accounts, loading, error, addAccount, removeAccount } = useAccounts();
  const { theme, toggleTheme } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const filtered = useMemo(() => accounts.filter(a =>
    `${a.issuer} ${a.accountName}`.toLowerCase().includes(search.toLowerCase())
  ), [accounts, search]);

  return <main className={`app ${theme === "light" ? "theme-light" : "theme-dark"}`}>
    <Header theme={theme} onToggleTheme={toggleTheme} onSettings={() => setShowSettings(v=>!v)}/>
    <section className="dashboard">
      <div className="toolbar">
        <label className="search-box"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search accounts..."/></label>
        <button className="add-button" onClick={()=>setShowModal(true)}><Plus size={16}/> Add Account</button>
      </div>
      <div className="section-heading">
        <div><h2>Your Accounts</h2><p>{accounts.length} {accounts.length === 1 ? "account" : "accounts"} added</p></div>
        <span className="account-count">{accounts.length} total</span>
      </div>
      {loading ? <p className="loading-state">Loading accounts…</p> :
        error ? <p className="error-message">{error}</p> :
        <AccountList accounts={filtered} onDelete={removeAccount} isDark={theme === "dark"}/>}
      {/* <button className="add-account-button" onClick={()=>setShowModal(true)}><Plus size={17}/> Add another account</button> */}
    </section>
    {showModal && <AddAccountModal onClose={()=>setShowModal(false)} onAdd={addAccount}/>}
  </main>;
}