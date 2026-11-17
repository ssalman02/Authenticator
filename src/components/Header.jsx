import { ShieldCheck, Sun, Moon } from "lucide-react";

export default function Header({ theme, onToggleTheme }) {
  return (
    <header className="header">
      <div className="brand">
        <div className="brand-icon">
          <ShieldCheck size={25} />
        </div>
        <div>
          <h1
            style={{
              fontFamily: "'Agrave Pro', cursive",
              fontOpticalSizing: "auto",
              fontWeight: 600,
              fontStyle: "normal",
              fontSize:'22px'
            }}
          >
            Authenticator
          </h1>
        </div>
      </div>

      <div className="header-actions">
        <button
          className="header-icon"
          onClick={onToggleTheme}
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
}