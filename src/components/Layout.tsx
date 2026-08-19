import type { ReactNode } from "react";
import {
  BarChart3, Bell, CalendarDays, CarFront, ChevronDown, CircleHelp, FileBarChart,
  Home, Menu, Route, Settings, WalletCards, X, Upload, ListChecks,
} from "lucide-react";

export type ViewId = "overview" | "trips" | "statistics" | "costs" | "calendar" | "routes" | "reports" | "settings";

type LayoutProps = {
  children: ReactNode;
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
  userName: string;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
};

const navGroups: Array<Array<{ id: ViewId; label: string; icon: typeof Home }>> = [
  [
    { id: "overview", label: "Übersicht", icon: Home },
    { id: "trips", label: "Fahrten", icon: CarFront },
    { id: "statistics", label: "Statistiken", icon: BarChart3 },
    { id: "costs", label: "Kosten", icon: WalletCards },
    { id: "calendar", label: "Kalender", icon: CalendarDays },
    { id: "routes", label: "Routen", icon: Route },
  ],
  [
    { id: "reports", label: "Berichte", icon: FileBarChart },
    { id: "settings", label: "Export", icon: Upload },
  ],
  [
    { id: "settings", label: "Einstellungen", icon: Settings },
    { id: "settings", label: "Hilfe & FAQ", icon: CircleHelp },
  ],
];

export function Layout({ children, activeView, onNavigate, userName, mobileMenuOpen, setMobileMenuOpen }: LayoutProps) {
  const navigate = (view: ViewId) => { onNavigate(view); setMobileMenuOpen(false); };
  const initials = userName.trim().charAt(0).toUpperCase() || "M";

  return (
    <div className="app-shell">
      {mobileMenuOpen && <button className="drawer-shade" aria-label="Menü schließen" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <div className="brand-row">
          <span className="brand-mark"><CarFront /></span>
          <span><strong>Fahrtenbuch</strong><small>Digital &amp; Einfach</small></span>
          <button className="icon-button drawer-close" onClick={() => setMobileMenuOpen(false)} aria-label="Menü schließen"><X /></button>
        </div>
        <nav aria-label="Hauptnavigation">
          {navGroups.map((group, groupIndex) => (
            <div className="nav-group" key={groupIndex}>
              {group.map(({ id, label, icon: Icon }, itemIndex) => (
                <button key={`${label}-${itemIndex}`} className={activeView === id && (label === "Übersicht" || label === "Einstellungen") ? "nav-active" : ""} onClick={() => navigate(id)}>
                  <Icon /> <span>{label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="privacy-card"><span><ListChecks /></span><strong>100 % lokal</strong><p>Deine Fahrten bleiben ausschließlich in diesem Browser.</p><button onClick={() => navigate("settings")}>Backup erstellen</button></div>
      </aside>
      <div className="app-workspace">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setMobileMenuOpen(true)} aria-label="Menü öffnen"><Menu /></button>
          <div className="topbar-spacer" />
          <button className="icon-button" aria-label="Benachrichtigungen" title="Keine neuen Benachrichtigungen"><Bell /></button>
          <button className="icon-button header-help" aria-label="Hilfe öffnen" title="Hilfe & FAQ"><CircleHelp /></button>
          <span className="topbar-divider" />
          <span className="avatar" aria-hidden="true">{initials}</span>
          <strong className="profile-name">{userName}</strong>
          <ChevronDown className="profile-chevron" aria-hidden="true" />
        </header>
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
